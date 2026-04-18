import * as functions from 'firebase-functions';
import admin = require('firebase-admin');
import twilio from 'twilio';

admin.initializeApp();
const db = admin.firestore();

const IS_EMULATOR = process.env.FUNCTIONS_EMULATOR === 'true';

function getTwilioClient() {
  const cfg = functions.config().twilio as { sid: string; token: string; from: string };
  return { client: twilio(cfg.sid, cfg.token), from: cfg.from };
}

async function sendWhatsApp(to: string, body: string) {
  if (IS_EMULATOR) {
    functions.logger.info(`[WhatsApp MOCK] To: ${to}\n${body}`);
    return;
  }
  const { client, from } = getTwilioClient();
  await client.messages.create({ from, to: `whatsapp:${to}`, body });
}

interface RawLog {
  domain: string;
  timestamp: number;
  appBundleId?: string;
}

// POST { familyId, childId, logs[] } — called by the app's background task every 60s
export const onDnsLogBatch = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { familyId, childId, logs } = req.body as {
    familyId: string;
    childId: string;
    logs: RawLog[];
  };

  if (!familyId || !childId || !Array.isArray(logs) || logs.length === 0) {
    res.status(400).send('Bad Request');
    return;
  }

  const familySnap = await db.doc(`families/${familyId}`).get();
  if (!familySnap.exists) {
    res.status(404).send('Family not found');
    return;
  }

  const settings = familySnap.data()!['settings'] as {
    flaggedDomains: string[];
    blockedDomains: string[];
    alertMode: string;
    parentPhone?: string;
  };
  const flagged: string[] = settings.flaggedDomains ?? [];
  const blocked: string[] = settings.blockedDomains ?? [];

  const batch = db.batch();
  const alertLogs: Array<{ domain: string; isFlagged: boolean; isBlocked: boolean }> = [];

  for (const raw of logs) {
    const domain = raw.domain.toLowerCase();
    const isFlagged = flagged.some((f) => domain === f || domain.endsWith(`.${f}`));
    const isBlocked = blocked.some((b) => domain === b || domain.endsWith(`.${b}`));

    const ref = db.collection(`families/${familyId}/dnsLogs`).doc();
    batch.set(ref, {
      childId,
      domain,
      timestamp: new Date(raw.timestamp),
      blocked: isBlocked,
      flagged: isFlagged,
      appBundleId: raw.appBundleId ?? null,
    });

    if ((isFlagged || isBlocked) && settings.alertMode !== 'digest') {
      alertLogs.push({ domain, isFlagged, isBlocked });
    }
  }

  await batch.commit();

  // Instant alerts for flagged/blocked domains
  if (alertLogs.length > 0) {
    const parentPhone = familySnap.data()!['parentPhone'] as string;
    const lines = alertLogs.map(({ domain, isBlocked }) =>
      isBlocked ? `🚫 BLOCKED: ${domain}` : `⚠️ FLAGGED: ${domain}`,
    );
    const body = `ChildTracker alert:\n${lines.join('\n')}`;
    try {
      await sendWhatsApp(parentPhone, body);
    } catch (err) {
      functions.logger.error('Instant alert WhatsApp failed', err);
    }
  }

  res.status(200).json({ written: logs.length });
});

// Hourly digest — aggregates unnotified flagged/blocked logs and sends summary
export const hourlyDigest = functions.pubsub
  .schedule('0 * * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const familiesSnap = await db.collection('families').get();

    for (const familyDoc of familiesSnap.docs) {
      const family = familyDoc.data();
      const alertMode = family['settings']?.alertMode as string;
      if (alertMode === 'instant') continue;

      const since = new Date(Date.now() - 60 * 60 * 1000);

      const logsSnap = await db
        .collection(`families/${familyDoc.id}/dnsLogs`)
        .where('timestamp', '>=', since)
        .where('flagged', '==', true)
        .orderBy('timestamp', 'asc')
        .get();

      if (logsSnap.empty) continue;

      const lines = logsSnap.docs.map((d) => {
        const data = d.data();
        const t = (data['timestamp'] as FirebaseFirestore.Timestamp)
          .toDate()
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const tag = data['blocked'] ? '🚫' : '⚠️';
        return `${tag} ${data['domain']} at ${t}`;
      });

      const body = `ChildTracker — last hour:\n${lines.join('\n')}`;

      try {
        await sendWhatsApp(family['parentPhone'], body);
      } catch (err) {
        functions.logger.error(`Digest failed for family ${familyDoc.id}`, err);
      }
    }
  });
