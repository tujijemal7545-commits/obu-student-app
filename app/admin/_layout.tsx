import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';

export default function AdminLayout() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // Robust Auth Guard inside the Layout level
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Force redirect if unauthenticated
        router.replace('/(tabs)/admin');
      } else {
        setIsAuthChecking(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isAuthChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19' }}>
        <ActivityIndicator size="large" color="#00E5FF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ 
      headerStyle: { backgroundColor: '#0F172A' },
      headerTintColor: '#E0E7FF',
      headerTitleStyle: { fontWeight: 'bold' }
    }}>
      <Stack.Screen name="index" options={{ title: 'Admin Hub', headerShown: false }} />
      <Stack.Screen name="students" options={{ title: 'Student Database' }} />
      <Stack.Screen name="users" options={{ title: 'User Management' }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance Scanner' }} />
      <Stack.Screen name="analytics" options={{ title: 'Analytics & Reports' }} />
      <Stack.Screen name="add-student" options={{ title: 'Add Student' }} />
      <Stack.Screen name="edit-student" options={{ title: 'Edit Student' }} />
      <Stack.Screen name="account" options={{ title: 'Profile Settings' }} />
      <Stack.Screen name="settings" options={{ title: 'App Settings' }} />
    </Stack>
  );
}
