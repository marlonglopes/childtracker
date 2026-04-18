import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import twilio from 'twilio';

admin.initializeApp();
const db = admin.firestore();

// Twilio credentials stored in Firebase Functions config:
// firebase functions:config:set twilio.sid="ACxxx" twilio.token="xxx" twilio.from="whatsapp:+14155238886"
function getTwilioClient() {
  const cfg = functions.config().twilio as { sid: string; token: string; from: string };
  return { client: twilio(cfg.sid, cfg.token), from: cfg.from };
}

async function sendWhatsApp(to: string, body: string) {
  const { client, from } = getTwilioClient();
  await client.messages.create({
    from,
    to: `whatsapp:${to}`,
    body,
  });
}

// Triggered when a child logs an activity
export const onActivityLogged = functions.firestore
  .document('families/{familyId}/activities/{activityId}')
  .onCreate(async (snap, context) => {
    const { familyId } = context.params as { familyId: string };
    const activity = snap.data();

    const familySnap = await db.doc(`families/${familyId}`).get();
    if (!familySnap.exists) return;

    const family = familySnap.data()!;
    const settings = family['settings'] as { notifyMode: string };

    if (settings.notifyMode === 'digest') {
      // Digest mode: mark for batch, don't send now (except SOS)
      if (activity['type'] !== 'sos') return;
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locationStr = activity['location']?.address
      ? ` 📍 ${activity['location'].address}`
      : '';

    const isSos = activity['type'] === 'sos';
    const body = isSos
      ? `🚨 SOS from ${activity['childName']} at ${time}.${locationStr} Please call them immediately.`
      : `${activity['childName']} — ${activity['label']} at ${time}.${locationStr}`;

    try {
      await sendWhatsApp(family['parentPhone'], body);
      await snap.ref.update({ notified: true, notifiedAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (err) {
      functions.logger.error('WhatsApp send failed', err);
    }
  });

// Daily digest — runs every day at 18:00 UTC (adjust per family timezone in v2)
export const dailyDigest = functions.pubsub
  .schedule('0 18 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const familiesSnap = await db.collection('families').get();

    for (const familyDoc of familiesSnap.docs) {
      const family = familyDoc.data();
      if (family['settings']?.notifyMode === 'instant') continue;

      const since = new Date();
      since.setHours(0, 0, 0, 0);

      const activitiesSnap = await db
        .collection(`families/${familyDoc.id}/activities`)
        .where('timestamp', '>=', since)
        .where('notified', '==', false)
        .orderBy('timestamp', 'asc')
        .get();

      if (activitiesSnap.empty) continue;

      const lines = activitiesSnap.docs.map((d) => {
        const a = d.data();
        const t = (a['timestamp'] as admin.firestore.Timestamp)
          .toDate()
          .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `• ${a['childName']}: ${a['label']} at ${t}`;
      });

      const body = `📋 Today's summary:\n${lines.join('\n')}`;

      try {
        await sendWhatsApp(family['parentPhone'], body);
        const batch = db.batch();
        activitiesSnap.docs.forEach((d) => {
          batch.update(d.ref, {
            notified: true,
            notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
      } catch (err) {
        functions.logger.error(`Digest failed for family ${familyDoc.id}`, err);
      }
    }
  });
