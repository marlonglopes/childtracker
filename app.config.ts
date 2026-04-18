import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'ChildTracker',
  slug: 'childtracker',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/icon.png',
  scheme: 'childtracker',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './src/assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#4F46E5',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.childtracker.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'ChildTracker uses your location to include it in activity updates sent to your parent.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'ChildTracker uses your location in the background for automatic arrival/departure detection.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#4F46E5',
    },
    package: 'com.childtracker.app',
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_BACKGROUND_LOCATION'],
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow ChildTracker to use your location for automatic check-ins.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './src/assets/images/notification-icon.png',
        color: '#4F46E5',
      },
    ],
  ],
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
});
