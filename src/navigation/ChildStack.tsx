import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ChildStackParamList } from './types';
import { HomeScreen } from '@/screens/HomeScreen';

const Stack = createNativeStackNavigator<ChildStackParamList>();

export function ChildStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
