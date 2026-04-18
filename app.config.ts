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
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/images/adaptive-icon.png',
      backgroundColor: '#4F46E5',
    },
    package: 'com.childtracker.app',
  },
  plugins: [
    'expo-font',
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
