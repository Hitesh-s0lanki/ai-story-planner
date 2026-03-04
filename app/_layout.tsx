import { useEffect } from 'react';
import { Stack, router, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { loadProfile } from '@/lib/storage';
import './global.css';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // Wait for the navigation container to be fully ready before redirecting.
  // Without this check, router.replace can fire before navigation is initialised
  // and silently fail, leaving a blank screen.
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    loadProfile()
      .then(profile => {
        if (!profile?.username) {
          router.replace('/login');
        }
      })
      .catch(() => {
        // If storage read fails, send to login so the user can set up
        router.replace('/login');
      })
      .finally(() => {
        SplashScreen.hideAsync();
      });
  }, [navigationState?.key]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="story/[id]" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
