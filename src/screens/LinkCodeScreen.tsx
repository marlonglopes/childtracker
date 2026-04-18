import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore, useFamilyStore } from '@/store';
import { linkChildToFamily } from '@/services/familyService';
import type { AuthScreenProps } from '@/navigation/types';

const AVATARS = ['🧒', '👦', '👧', '🧑', '🐱', '🦊', '🐶', '🦁'];

export function LinkCodeScreen({ navigation }: AuthScreenProps<'LinkCode'>) {
  const [code, setCode] = useState('');
  const [childName, setChildName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]!);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const { setAuth, setOnboarded } = useAuthStore();
  const { setFamily } = useFamilyStore();

  async function handleLink() {
    if (code.length !== 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit code from your parent.');
      return;
    }
    if (!childName.trim()) {
      Alert.alert('Missing name', 'Enter your name so your parent knows who sent the message.');
      return;
    }

    setLoading(true);
    try {
      const { family, child } = await linkChildToFamily(code, childName.trim(), avatar);
      setFamily(family);
      setAuth({ uid: child.id, familyId: family.id, role: 'child', childId: child.id, childName: child.name });
      setOnboarded();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not link. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 pt-8"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <Text className="text-indigo-600 text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-900 mb-2">Enter Link Code</Text>
        <Text className="text-gray-500 mb-8">Ask your parent for the 6-digit code in their app.</Text>

        <Text className="text-gray-700 font-semibold mb-1">Your name</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-5"
          placeholder="e.g. Sofia"
          value={childName}
          onChangeText={setChildName}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => inputRef.current?.focus()}
        />

        <Text className="text-gray-700 font-semibold mb-1">6-digit code</Text>
        <TextInput
          ref={inputRef}
          className="border border-gray-300 rounded-xl px-4 py-3 text-2xl tracking-widest text-center font-mono mb-5"
          placeholder="_ _ _ _ _ _"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
          returnKeyType="done"
        />

        <Text className="text-gray-700 font-semibold mb-3">Pick your avatar</Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {AVATARS.map((a) => (
            <TouchableOpacity
              key={a}
              className={`w-14 h-14 rounded-2xl items-center justify-center ${
                avatar === a ? 'bg-indigo-100 border-2 border-indigo-500' : 'bg-gray-100'
              }`}
              onPress={() => setAvatar(a)}
            >
              <Text className="text-3xl">{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-indigo-600 rounded-2xl py-4 items-center"
          onPress={handleLink}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-bold">Connect to Family</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
