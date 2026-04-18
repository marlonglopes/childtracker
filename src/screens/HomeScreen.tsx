import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '@/store';
import { logActivity } from '@/services/activityService';
import { getCurrentLocation } from '@/services/locationService';
import { ACTIVITY_CONFIGS, type ActivityType } from '@/types';

const GRID_ACTIVITIES = [
  'arrived_school',
  'left_school',
  'arrived_home',
  'left_home',
  'arrived_practice',
  'left_practice',
  'homework_done',
  'eating',
] as const satisfies readonly Exclude<ActivityType, 'custom' | 'sos'>[];

export function HomeScreen() {
  const { familyId, childId, childName } = useAuthStore();
  const [loadingType, setLoadingType] = useState<ActivityType | null>(null);
  const [lastActivity, setLastActivity] = useState<string | null>(null);

  const handleActivity = useCallback(
    async (type: ActivityType) => {
      if (!familyId || !childId || !childName) return;

      setLoadingType(type);
      try {
        const location = await getCurrentLocation();
        const config = type !== 'sos' && type !== 'custom' ? ACTIVITY_CONFIGS[type] : null;
        const label = config?.label ?? 'SOS';

        await logActivity({ familyId, childId, childName, type, label, location: location ?? undefined });
        setLastActivity(label);
      } catch {
        Alert.alert('Oops', 'Could not send activity. Check your connection.');
      } finally {
        setLoadingType(null);
      }
    },
    [familyId, childId, childName],
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Hi, {childName ?? 'there'} 👋</Text>
        {lastActivity && (
          <Text className="text-green-600 text-sm mt-1">✓ Sent: {lastActivity}</Text>
        )}
      </View>

      {/* SOS — always on top, prominent */}
      <TouchableOpacity
        className="mx-5 mt-2 mb-4 bg-red-600 rounded-2xl py-5 items-center active:bg-red-700"
        onPress={() => handleActivity('sos')}
        disabled={loadingType !== null}
      >
        {loadingType === 'sos' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text className="text-4xl">🆘</Text>
            <Text className="text-white text-xl font-bold mt-1">SOS</Text>
          </>
        )}
      </TouchableOpacity>

      <FlatList
        data={GRID_ACTIVITIES}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const config = ACTIVITY_CONFIGS[item];
          const isLoading = loadingType === item;
          return (
            <TouchableOpacity
              className={`flex-1 ${config.color} rounded-2xl py-6 items-center justify-center active:opacity-80`}
              onPress={() => handleActivity(item)}
              disabled={loadingType !== null}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <>
                  <Text className="text-5xl">{config.emoji}</Text>
                  <Text className="text-white text-base font-semibold mt-2 text-center px-2">
                    {config.label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
