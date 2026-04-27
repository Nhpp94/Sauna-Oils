import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Typography, FontSize } from '../constants/theme';
import { CustomLibraryProvider } from '../context/CustomLibraryContext';
import { MyKitProvider } from '../context/MyKitContext';
import { SavedSessionsProvider } from '../context/SavedSessionsContext';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
  });

  if (!loaded) return null;

  return (
    <MyKitProvider>
    <CustomLibraryProvider>
    <SavedSessionsProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0704' },
          headerTintColor: '#f0e4c8',
          headerTitleStyle: {
            fontFamily: Typography.serifBold,
            fontSize: FontSize.xl,
          },
          contentStyle: { backgroundColor: '#0a0704' },
          headerShadowVisible: false,
          headerBackTitle: '',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="session/index"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="session/result"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen name="session/build" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="saved-sessions" options={{ headerShown: false }} />
        <Stack.Screen name="oil/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="blend/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="incense/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
    </SavedSessionsProvider>
    </CustomLibraryProvider>
    </MyKitProvider>
  );
}
