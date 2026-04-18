// Placeholder for the React Native native module that communicates with
// the NEDNSProxyProvider extension. Implemented in Sprint 2 once the
// Apple Developer account and Xcode target are set up.

export type ExtensionStatus = 'active' | 'inactive' | 'unavailable';

export async function getExtensionStatus(): Promise<ExtensionStatus> {
  // Sprint 2: call NativeModules.ChildTrackerExtension.getStatus()
  return 'unavailable';
}

export async function startExtension(): Promise<void> {
  // Sprint 2: call NativeModules.ChildTrackerExtension.start()
  throw new Error('Network Extension not available — requires Apple Developer account (Sprint 2).');
}

export async function stopExtension(): Promise<void> {
  // Sprint 2: call NativeModules.ChildTrackerExtension.stop()
  throw new Error('Network Extension not available — requires Apple Developer account (Sprint 2).');
}
