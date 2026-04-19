import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore, useFamilyStore } from '@/store';
import {
  getExtensionStatus,
  isMockMode,
  startExtension,
  stopExtension,
  type ExtensionStatus,
} from '@/services/extensionBridge';

const STATUS_COPY: Record<ExtensionStatus, { title: string; tone: string; detail: string }> = {
  active: {
    title: 'Monitoring is on',
    tone: 'text-green-600',
    detail: 'Your device is connected. Domains are visible to your parent.',
  },
  inactive: {
    title: 'Monitoring is off',
    tone: 'text-amber-600',
    detail: 'Tap below to turn it back on. iOS will ask you to allow the VPN profile.',
  },
  unavailable: {
    title: 'Extension not installed',
    tone: 'text-gray-500',
    detail:
      'The DNS filter is not available on this build. Install via TestFlight or a signed build to enable monitoring.',
  },
};

export function MonitorScreen() {
  const { childName, familyId, childId, clearAuth } = useAuthStore();
  const { family, clearFamily } = useFamilyStore();
  const [status, setStatus] = useState<ExtensionStatus>('unavailable');
  const [busy, setBusy] = useState(false);
  const mockMode = isMockMode();

  const refresh = useCallback(async () => {
    const s = await getExtensionStatus();
    setStatus(s);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function toggle() {
    if (!familyId || !childId) {
      Alert.alert('Not linked', 'Finish setup before turning on monitoring.');
      return;
    }
    setBusy(true);
    try {
      if (status === 'active') await stopExtension();
      else await startExtension({ familyId, childId });
      await refresh();
    } catch (e) {
      Alert.alert('Cannot toggle', e instanceof Error ? e.message : 'Unknown error.');
    } finally {
      setBusy(false);
    }
  }

  function handleUnlink() {
    Alert.alert('Unlink device?', 'Your parent will stop receiving alerts from this phone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unlink',
        style: 'destructive',
        onPress: () => {
          clearAuth();
          clearFamily();
        },
      },
    ]);
  }

  const copy = STATUS_COPY[status];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-6">
        <Text className="text-2xl font-bold text-gray-900">Hi {childName ?? 'there'} 👋</Text>
        <Text className="text-gray-500 mt-1">
          Linked to {family?.parentName ?? 'your parent'}
        </Text>
        {mockMode ? (
          <View className="mt-3 bg-amber-100 rounded-lg px-3 py-2">
            <Text className="text-amber-800 text-xs">
              Dev build — using a mock DNS source. On signed builds this will
              be the real system DNS filter.
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-1 px-6 justify-center">
        <View className="bg-white rounded-2xl p-6 items-center">
          <Text className="text-5xl mb-3">
            {status === 'active' ? '🟢' : status === 'inactive' ? '🟡' : '⚪️'}
          </Text>
          <Text className={`text-xl font-bold ${copy.tone}`}>{copy.title}</Text>
          <Text className="text-gray-500 text-center mt-2">{copy.detail}</Text>

          <TouchableOpacity
            className={`mt-6 w-full rounded-2xl py-4 items-center ${
              status === 'active' ? 'bg-red-100' : 'bg-indigo-600'
            } ${status === 'unavailable' ? 'opacity-50' : ''}`}
            disabled={busy || status === 'unavailable'}
            onPress={toggle}
          >
            {busy ? (
              <ActivityIndicator color={status === 'active' ? '#DC2626' : '#FFF'} />
            ) : (
              <Text
                className={`font-bold text-base ${
                  status === 'active' ? 'text-red-600' : 'text-white'
                }`}
              >
                {status === 'active' ? 'Turn off monitoring' : 'Turn on monitoring'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 pb-8">
        <TouchableOpacity className="py-3 items-center" onPress={handleUnlink}>
          <Text className="text-gray-400 text-sm">Unlink this device</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
