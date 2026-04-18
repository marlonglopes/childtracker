import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAuthStore, useFamilyStore } from '@/store';
import { updateFamilySettings } from '@/services/familyService';
import { notify, confirmDestructive } from '@/utils/dialog';
import type { AlertMode, FamilySettings } from '@/types';

const ALERT_OPTIONS: { label: string; value: AlertMode; desc: string }[] = [
  { label: 'Instant', value: 'instant', desc: 'WhatsApp on every flagged/blocked domain' },
  { label: 'Hourly digest', value: 'digest', desc: 'One summary per hour' },
  { label: 'Both', value: 'both', desc: 'Instant alerts + hourly summary' },
];

function normalizeDomain(raw: string): string | null {
  const d = raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!d || !d.includes('.')) return null;
  return d;
}

export function SettingsScreen() {
  const { clearAuth, familyId } = useAuthStore();
  const { family, clearFamily, updateSettings } = useFamilyStore();

  const [flaggedInput, setFlaggedInput] = useState('');
  const [blockedInput, setBlockedInput] = useState('');

  if (!family || !familyId) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">No family loaded.</Text>
      </SafeAreaView>
    );
  }

  async function persist(patch: Partial<FamilySettings>) {
    const merged = { ...family!.settings, ...patch };
    updateSettings(patch);
    try {
      await updateFamilySettings(familyId!, patch);
    } catch (e) {
      updateSettings(family!.settings);
      notify('Could not save', e instanceof Error ? e.message : 'Try again.');
      return merged;
    }
    return merged;
  }

  function setAlertMode(mode: AlertMode) {
    persist({ alertMode: mode });
  }

  async function addDomain(kind: 'flagged' | 'blocked') {
    const raw = kind === 'flagged' ? flaggedInput : blockedInput;
    const domain = normalizeDomain(raw);
    if (!domain) {
      notify('Invalid domain', 'Enter a domain like tiktok.com.');
      return;
    }
    const key = kind === 'flagged' ? 'flaggedDomains' : 'blockedDomains';
    const list = family!.settings[key];
    if (list.includes(domain)) {
      notify('Already added', `${domain} is already in the list.`);
      return;
    }
    await persist({ [key]: [...list, domain] } as Partial<FamilySettings>);
    if (kind === 'flagged') setFlaggedInput('');
    else setBlockedInput('');
  }

  async function removeDomain(kind: 'flagged' | 'blocked', domain: string) {
    const key = kind === 'flagged' ? 'flaggedDomains' : 'blockedDomains';
    const list = family!.settings[key].filter((d) => d !== domain);
    await persist({ [key]: list } as Partial<FamilySettings>);
  }

  async function handleSignOut() {
    const ok = await confirmDestructive('Sign out', 'This will unlink this device. Are you sure?');
    if (!ok) return;
    clearAuth();
    clearFamily();
  }

  const current = family.settings.alertMode;
  const flagged = family.settings.flaggedDomains;
  const blocked = family.settings.blockedDomains;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-500 text-sm mb-1">Family link code</Text>
          <Text className="text-3xl font-mono font-bold text-indigo-600 tracking-widest">
            {family.linkCode}
          </Text>
          <Text className="text-gray-400 text-xs mt-1">
            Share this with your child to link their device.
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-gray-900 mb-3">Alert mode</Text>
          {ALERT_OPTIONS.map((opt, idx) => (
            <TouchableOpacity
              key={opt.value}
              className={`flex-row items-center py-3 ${
                idx === ALERT_OPTIONS.length - 1 ? '' : 'border-b border-gray-100'
              }`}
              onPress={() => setAlertMode(opt.value)}
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
          <Text className="font-semibold text-gray-900 mb-1">Flagged domains</Text>
          <Text className="text-gray-400 text-xs mb-3">
            You’ll get a WhatsApp alert when these are visited.
          </Text>
          <View className="flex-row gap-2 mb-3">
            <TextInput
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-base"
              placeholder="tiktok.com"
              value={flaggedInput}
              onChangeText={setFlaggedInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity
              className="bg-amber-500 rounded-xl px-4 justify-center"
              onPress={() => addDomain('flagged')}
            >
              <Text className="text-white font-semibold">Add</Text>
            </TouchableOpacity>
          </View>
          {flagged.length === 0 ? (
            <Text className="text-gray-400 text-sm">No flagged domains.</Text>
          ) : (
            flagged.map((d) => (
              <View
                key={d}
                className="flex-row justify-between items-center py-2 border-t border-gray-100"
              >
                <Text className="text-gray-900">{d}</Text>
                <TouchableOpacity onPress={() => removeDomain('flagged', d)}>
                  <Text className="text-red-500 text-sm">Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-gray-900 mb-1">Blocked domains</Text>
          <Text className="text-gray-400 text-xs mb-3">
            Logged and alerted. Actual DNS blocking happens on the child’s device (Sprint 2).
          </Text>
          <View className="flex-row gap-2 mb-3">
            <TextInput
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-base"
              placeholder="pornhub.com"
              value={blockedInput}
              onChangeText={setBlockedInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity
              className="bg-red-500 rounded-xl px-4 justify-center"
              onPress={() => addDomain('blocked')}
            >
              <Text className="text-white font-semibold">Add</Text>
            </TouchableOpacity>
          </View>
          {blocked.length === 0 ? (
            <Text className="text-gray-400 text-sm">No blocked domains.</Text>
          ) : (
            blocked.map((d) => (
              <View
                key={d}
                className="flex-row justify-between items-center py-2 border-t border-gray-100"
              >
                <Text className="text-gray-900">{d}</Text>
                <TouchableOpacity onPress={() => removeDomain('blocked', d)}>
                  <Text className="text-red-500 text-sm">Remove</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-500 text-sm mb-1">Parent WhatsApp</Text>
          <Text className="text-gray-900 font-medium">{family.parentPhone}</Text>
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
