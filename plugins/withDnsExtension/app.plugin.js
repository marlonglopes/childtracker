const {
  withEntitlementsPlist,
  withDangerousMod,
  withXcodeProject,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DEFAULTS = {
  appGroup: 'group.com.childtracker.shared',
  extensionName: 'ChildTrackerDNS',
};

/**
 * Expo config plugin — adds a DNS Proxy Network Extension target to the iOS app.
 *
 * Responsibilities:
 *  1. Main-app entitlements: App Group + networkextension(dns-proxy)
 *  2. Write the extension's Swift sources + Info.plist + .entitlements to ios/
 *  3. Register the extension target in the Xcode project (follow-up commit)
 *
 * @type {import('@expo/config-plugins').ConfigPlugin<Partial<typeof DEFAULTS> | void>}
 */
const withDnsExtension = (config, props) => {
  const appGroup = (props && props.appGroup) || DEFAULTS.appGroup;
  const extensionName = (props && props.extensionName) || DEFAULTS.extensionName;
  const mainBundleId = (config.ios && config.ios.bundleIdentifier) || 'com.childtracker.app';
  const extensionBundleId = `${mainBundleId}.dns`;

  config = withMainAppEntitlements(config, appGroup);
  config = withExtensionFiles(config, { extensionName, appGroup, extensionBundleId });
  config = withExtensionTarget(config, { extensionName, extensionBundleId });

  return config;
};

function withMainAppEntitlements(config, appGroup) {
  return withEntitlementsPlist(config, (c) => {
    c.modResults['com.apple.security.application-groups'] = [appGroup];
    c.modResults['com.apple.developer.networking.networkextension'] = ['dns-proxy'];
    return c;
  });
}

function withExtensionFiles(config, opts) {
  return withDangerousMod(config, [
    'ios',
    async (c) => {
      const { projectRoot } = c.modRequest;
      const extDir = path.join(projectRoot, 'ios', opts.extensionName);
      fs.mkdirSync(extDir, { recursive: true });

      const templatesDir = path.join(__dirname, 'swift');
      const entries = [
        { src: 'DNSProxyProvider.swift', dest: 'DNSProxyProvider.swift' },
        { src: 'DomainLogger.swift', dest: 'DomainLogger.swift' },
        { src: 'Info.plist', dest: 'Info.plist' },
        { src: 'Extension.entitlements', dest: `${opts.extensionName}.entitlements` },
      ];

      for (const { src, dest } of entries) {
        const srcPath = path.join(templatesDir, src);
        const destPath = path.join(extDir, dest);
        const content = fs
          .readFileSync(srcPath, 'utf8')
          .replace(/\$\{APP_GROUP\}/g, opts.appGroup)
          .replace(/\$\{EXTENSION_BUNDLE_ID\}/g, opts.extensionBundleId)
          .replace(/\$\{EXTENSION_NAME\}/g, opts.extensionName);
        fs.writeFileSync(destPath, content);
      }

      return c;
    },
  ]);
}

// Target creation lands in the next commit (pbxproj manipulation via the
// `xcode` package is large enough to warrant its own reviewable diff).
function withExtensionTarget(config, _opts) {
  return withXcodeProject(config, (c) => c);
}

module.exports = withDnsExtension;
module.exports.default = withDnsExtension;
