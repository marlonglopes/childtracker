import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { ParentSetupScreen } from '@/screens/ParentSetupScreen';
import { LinkCodeScreen } from '@/screens/LinkCodeScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ParentSetup" component={ParentSetupScreen} />
      <Stack.Screen name="LinkCode" component={LinkCodeScreen} />
    </Stack.Navigator>
  );
}
