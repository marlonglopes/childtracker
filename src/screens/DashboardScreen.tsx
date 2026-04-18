import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthStore, useFamilyStore } from '@/store';
import { getRecentLogs } from '@/services/dnsLogService';
import type { DnsLog } from '@/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ParentStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ParentStackParamList, 'Dashboard'>;

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return isToday ? 'Today' : date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function DomainTag({ log }: { log: DnsLog }) {
  if (log.blocked) return <Text className="text-red-500 text-xs font-semibold">BLOCKED</Text>;
  if (log.flagged) return <Text className="text-amber-500 text-xs font-semibold">FLAGGED</Text>;
  return null;
}

export function DashboardScreen({ navigation }: Props) {
  const { familyId } = useAuthStore();
  const { family } = useFamilyStore();
  const [logs, setLogs] = useState<DnsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!familyId) return;
    const data = await getRecentLogs(familyId);
    setLogs(data);
  }, [familyId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">DNS Activity</Text>
          {family?.linkCode && (
            <Text className="text-gray-400 text-sm">Link code: {family.linkCode}</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text className="text-2xl">⚙️</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : logs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📡</Text>
          <Text className="text-gray-500 text-center text-lg">
            No DNS logs yet. Once your child’s device connects, domains will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <View
              className={`bg-white rounded-xl px-4 py-3 shadow-sm border-l-4 ${
                item.blocked
                  ? 'border-red-500'
                  : item.flagged
                  ? 'border-amber-400'
                  : 'border-transparent'
              }`}
            >
              <View className="flex-row justify-between items-center">
                <Text className="font-medium text-gray-900 flex-1 mr-2" numberOfLines={1}>
                  {item.domain}
                </Text>
                <DomainTag log={item} />
              </View>
              <View className="flex-row items-center mt-1 gap-2">
                <Text className="text-gray-400 text-xs">{formatTime(item.timestamp)}</Text>
                <Text className="text-gray-300 text-xs">·</Text>
                <Text className="text-gray-400 text-xs">{formatDate(item.timestamp)}</Text>
                {item.appBundleId && (
                  <>
                    <Text className="text-gray-300 text-xs">·</Text>
                    <Text className="text-gray-400 text-xs">{item.appBundleId}</Text>
                  </>
                )}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
