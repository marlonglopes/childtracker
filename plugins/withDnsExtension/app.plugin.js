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

function withExtensionTarget(config, opts) {
  return withXcodeProject(config, (c) => {
    const project = c.modResults;
    const { extensionName, extensionBundleId } = opts;
    const mainAppName = c.modRequest.projectName || 'ChildTracker';

    // Idempotency guard — re-running the plugin must not create duplicate targets.
    if (findTargetByName(project, extensionName)) {
      return c;
    }

    // --- 1. Create a PBXGroup for the extension folder so the sources show up
    //        in the Xcode project navigator. ---
    const groupKey = project.pbxCreateGroup(extensionName, extensionName);
    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(groupKey, mainGroup);

    // --- 2. Create the native target. `addTarget` creates a PBXNativeTarget
    //        with empty buildPhases — we create each phase explicitly below. ---
    const target = project.addTarget(extensionName, 'app_extension', extensionName, extensionBundleId);

    // --- 3. Create the Sources build phase and register Swift files in it. ---
    const sources = ['DNSProxyProvider.swift', 'DomainLogger.swift'];
    project.addBuildPhase(
      sources.map((f) => `${extensionName}/${f}`),
      'PBXSourcesBuildPhase',
      'Sources',
      target.uuid,
    );
    // addSourceFile also adds the file to the navigator group.
    for (const file of sources) {
      project.addSourceFile(`${extensionName}/${file}`, { target: target.uuid }, groupKey);
    }

    // Info.plist + entitlements are referenced via build settings, not phases.
    project.addFile(`${extensionName}/Info.plist`, groupKey);
    project.addFile(`${extensionName}/${extensionName}.entitlements`, groupKey);

    // --- 4. Create the Frameworks phase and link NetworkExtension.framework. ---
    project.addBuildPhase([], 'PBXFrameworksBuildPhase', 'Frameworks', target.uuid);
    project.addFramework('NetworkExtension.framework', {
      target: target.uuid,
      link: true,
    });

    // --- 5. Build settings — bundle id, entitlements, Info.plist, Swift. ---
    const configurations = project.pbxXCBuildConfigurationSection();
    const mainDeploymentTarget = readMainDeploymentTarget(project) || '15.1';

    for (const key in configurations) {
      const cfg = configurations[key];
      if (!cfg || !cfg.buildSettings) continue;
      if (cfg.buildSettings.PRODUCT_NAME !== `"${extensionName}"`) continue;

      Object.assign(cfg.buildSettings, {
        PRODUCT_BUNDLE_IDENTIFIER: extensionBundleId,
        INFOPLIST_FILE: `${extensionName}/Info.plist`,
        CODE_SIGN_ENTITLEMENTS: `${extensionName}/${extensionName}.entitlements`,
        SWIFT_VERSION: '5.0',
        IPHONEOS_DEPLOYMENT_TARGET: mainDeploymentTarget,
        TARGETED_DEVICE_FAMILY: '"1,2"',
        SKIP_INSTALL: 'NO',
        CODE_SIGN_STYLE: 'Automatic',
        LD_RUNPATH_SEARCH_PATHS:
          '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
        CLANG_ENABLE_MODULES: 'YES',
        DEFINES_MODULE: 'YES',
      });
    }

    // --- 6. Make the main app depend on the extension and embed it into the
    //        app bundle via a CopyFiles phase with destination = PlugIns. ---
    const mainTargetUuid = findTargetUuidByName(project, mainAppName);
    console.log('[withDnsExtension] mainAppName:', mainAppName, 'mainTargetUuid:', mainTargetUuid, 'extensionUuid:', target.uuid);
    if (mainTargetUuid) {
      try {
        project.addTargetDependency(mainTargetUuid, [target.uuid]);
      } catch (e) {
        console.warn('[withDnsExtension] addTargetDependency failed:', e && e.message);
      }
      project.addBuildPhase(
        [`${extensionName}.appex`],
        'PBXCopyFilesBuildPhase',
        'Embed App Extensions',
        mainTargetUuid,
        'app_extension',
      );
    } else {
      console.warn('[withDnsExtension] main target not found for name', mainAppName);
    }

    return c;
  });
}

function findTargetByName(project, name) {
  const targets = project.pbxNativeTargetSection();
  for (const key in targets) {
    const t = targets[key];
    if (t && typeof t === 'object' && t.name === name) return t;
  }
  return null;
}

function findTargetUuidByName(project, name) {
  const targets = project.pbxNativeTargetSection();
  for (const key in targets) {
    const t = targets[key];
    if (t && typeof t === 'object' && t.name === name) {
      // Keys come in pairs — the UUID is the one without the "_comment" suffix.
      return key.replace(/_comment$/, '');
    }
  }
  return null;
}

function readMainDeploymentTarget(project) {
  const configurations = project.pbxXCBuildConfigurationSection();
  for (const key in configurations) {
    const cfg = configurations[key];
    const target = cfg && cfg.buildSettings && cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET;
    if (target) return target;
  }
  return null;
}

module.exports = withDnsExtension;
module.exports.default = withDnsExtension;
