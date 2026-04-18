import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuthStore, useFamilyStore } from '@/store';
import { createFamily } from '@/services/familyService';
import { notify } from '@/utils/dialog';
import type { AuthScreenProps } from '@/navigation/types';

export function ParentSetupScreen({ navigation }: AuthScreenProps<'ParentSetup'>) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { setAuth, setOnboarded } = useAuthStore();
  const { setFamily } = useFamilyStore();

  async function handleSetup() {
    if (!name.trim() || !phone.trim()) {
      notify('Missing info', 'Please enter your name and WhatsApp phone number.');
      return;
    }

    const normalized = phone.startsWith('+') ? phone : `+${phone.replace(/\D/g, '')}`;
    if (normalized.length < 10) {
      notify('Invalid number', 'Enter your full phone number with country code (e.g. +15551234567).');
      return;
    }

    setLoading(true);
    try {
      const family = await createFamily(name.trim(), normalized);
      setFamily(family);
      setAuth({ uid: family.id, familyId: family.id, role: 'parent' });
      setOnboarded();
    } catch (e) {
      notify('Error', e instanceof Error ? e.message : 'Could not create family. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
            <Text className="text-indigo-600 text-base">← Back</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-gray-900 mb-2">Parent Setup</Text>
          <Text className="text-gray-500 mb-8">
            We’ll create a link code your child enters to connect their device.
          </Text>

          <Text className="text-gray-700 font-semibold mb-1">Your name</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-5"
            placeholder="e.g. Maria"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text className="text-gray-700 font-semibold mb-1">WhatsApp phone number</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-2"
            placeholder="+1 555 123 4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="done"
          />
          <Text className="text-gray-400 text-sm mb-8">
            Include country code. This is where activity alerts will be sent.
          </Text>

          <TouchableOpacity
            className="bg-indigo-600 rounded-2xl py-4 items-center"
            onPress={handleSetup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">Create Family</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
