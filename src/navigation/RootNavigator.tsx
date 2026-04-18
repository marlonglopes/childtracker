import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store';
import { AuthStack } from './AuthStack';
import { ChildStack } from './ChildStack';
import { ParentStack } from './ParentStack';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { uid, role } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!uid ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : role === 'child' ? (
          <Stack.Screen name="Child" component={ChildStack} />
        ) : (
          <Stack.Screen name="Parent" component={ParentStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
