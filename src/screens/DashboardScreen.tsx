import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore, useFamilyStore } from '@/store';
import { getRecentActivities } from '@/services/activityService';
import type { ActivityLog } from '@/types';

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return isToday ? 'Today' : date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export function DashboardScreen({ navigation }: { navigation: any }) {
  const { familyId } = useAuthStore();
  const { family } = useFamilyStore();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId) return;
    getRecentActivities(familyId)
      .then(setActivities)
      .finally(() => setLoading(false));
  }, [familyId]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Family Activity</Text>
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
      ) : activities.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">📭</Text>
          <Text className="text-gray-500 text-center text-lg">
            No activity yet. Once your child logs something, it'll appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{item.childName}</Text>
                  <Text className="text-gray-700 mt-0.5">{item.label}</Text>
                  {item.location?.address && (
                    <Text className="text-gray-400 text-xs mt-1">📍 {item.location.address}</Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-gray-500 text-sm">{formatTime(item.timestamp)}</Text>
                  <Text className="text-gray-400 text-xs">{formatDate(item.timestamp)}</Text>
                  {item.notified && <Text className="text-green-500 text-xs mt-1">✓ Sent</Text>}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
