import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const isDark = useColorScheme() === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#00E5FF' : '#2563EB',
        tabBarInactiveTintColor: isDark ? '#64748B' : '#9CA3AF',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          default: {
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#1E293B' : '#E5E7EB',
            height: 68,
            paddingBottom: 10,
            paddingTop: 8,
            shadowColor: isDark ? '#000' : '#111827',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 8,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Register',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="person-add" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => <Ionicons size={size} name="shield-checkmark" color={color} />,
        }}
      />
    </Tabs>
  );
}
