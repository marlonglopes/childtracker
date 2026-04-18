import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ChildStackParamList } from './types';
import { MonitorScreen } from '@/screens/MonitorScreen';

const Stack = createNativeStackNavigator<ChildStackParamList>();

export function ChildStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Monitor" component={MonitorScreen} />
    </Stack.Navigator>
  );
}
