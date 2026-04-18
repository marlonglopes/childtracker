import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import type { AuthScreenProps } from '@/navigation/types';

export function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  return (
    <SafeAreaView className="flex-1 bg-indigo-600">
      <View className="flex-1 justify-center items-center px-8 gap-6">
        <Text className="text-7xl">👨‍👩‍👧‍👦</Text>
        <Text className="text-4xl font-bold text-white text-center">ChildTracker</Text>
        <Text className="text-lg text-indigo-200 text-center">
          Stay connected with your kids. They tap once — you know they're safe.
        </Text>
      </View>

      <View className="px-8 pb-12 gap-4">
        <TouchableOpacity
          className="bg-white rounded-2xl py-4 items-center"
          onPress={() => navigation.navigate('ParentSetup')}
        >
          <Text className="text-indigo-600 text-lg font-bold">I'm a Parent</Text>
          <Text className="text-indigo-400 text-sm">Set up family &amp; get WhatsApp alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-indigo-500 rounded-2xl py-4 items-center border border-indigo-400"
          onPress={() => navigation.navigate('LinkCode')}
        >
          <Text className="text-white text-lg font-bold">I'm a Child</Text>
          <Text className="text-indigo-200 text-sm">Enter the code from your parent</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
