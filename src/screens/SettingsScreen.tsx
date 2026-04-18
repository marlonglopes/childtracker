import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthStore, useFamilyStore } from '@/store';
import type { NotifyMode } from '@/types';

const NOTIFY_OPTIONS: { label: string; value: NotifyMode; desc: string }[] = [
  { label: 'Instant', value: 'instant', desc: 'WhatsApp on every activity' },
  { label: 'Daily digest', value: 'digest', desc: 'One summary at end of day' },
  { label: 'Both', value: 'both', desc: 'Instant alerts + daily summary' },
];

export function SettingsScreen() {
  const { clearAuth } = useAuthStore();
  const { family, clearFamily, updateSettings } = useFamilyStore();

  function handleSignOut() {
    Alert.alert('Sign out', 'This will unlink this device. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          clearAuth();
          clearFamily();
        },
      },
    ]);
  }

  const current = family?.settings.notifyMode ?? 'instant';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {family && (
          <View className="bg-white rounded-2xl p-4">
            <Text className="text-gray-500 text-sm mb-1">Family link code</Text>
            <Text className="text-3xl font-mono font-bold text-indigo-600 tracking-widest">
              {family.linkCode}
            </Text>
            <Text className="text-gray-400 text-xs mt-1">Share this with your child to link their device</Text>
          </View>
        )}

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-gray-900 mb-3">Notification mode</Text>
          {NOTIFY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              className={`flex-row items-center py-3 border-b border-gray-100 ${
                opt.value === NOTIFY_OPTIONS[NOTIFY_OPTIONS.length - 1]?.value ? 'border-b-0' : ''
              }`}
              onPress={() => updateSettings({ notifyMode: opt.value })}
            >
              <View
                className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                  current === opt.value ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                }`}
              >
                {current === opt.value && <View className="w-2 h-2 rounded-full bg-white" />}
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">{opt.label}</Text>
                <Text className="text-gray-400 text-sm">{opt.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-500 text-sm mb-1">Parent WhatsApp</Text>
          <Text className="text-gray-900 font-medium">{family?.parentPhone ?? '—'}</Text>
        </View>

        <TouchableOpacity
          className="bg-red-50 rounded-2xl p-4 items-center border border-red-200"
          onPress={handleSignOut}
        >
          <Text className="text-red-600 font-semibold">Sign out &amp; Unlink Device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
