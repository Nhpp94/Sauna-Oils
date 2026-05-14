import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';

LogBox.ignoreLogs(['Some of the used filters are not yet supported on native platforms']);
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Colors, Typography, FontSize } from '../constants/theme';
import { CustomLibraryProvider } from '../context/CustomLibraryContext';
import { MyKitProvider } from '../context/MyKitContext';
import { SavedSessionsProvider } from '../context/SavedSessionsContext';
import { RemoteDataProvider } from '../context/RemoteDataContext';
import { AuthProvider } from '../context/AuthContext';
import { StudioProvider } from '../context/StudioContext';
import { PurchaseProvider } from '../context/PurchaseContext';
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
    <AuthProvider>
    <PurchaseProvider>
    <RemoteDataProvider>
    <MyKitProvider>
    <CustomLibraryProvider>
    <SavedSessionsProvider>
    <StudioProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            fontFamily: Typography.serifBold,
            fontSize: FontSize.xl,
          },
          contentStyle: { backgroundColor: Colors.bg },
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
        <Stack.Screen name="auth/index" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="studio/join" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="studio/create" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="studio/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="studio/manage" options={{ headerShown: false }} />
        <Stack.Screen name="studio/new-session" options={{ headerShown: false }} />
      </Stack>
    </StudioProvider>
    </SavedSessionsProvider>
    </CustomLibraryProvider>
    </MyKitProvider>
    </RemoteDataProvider>
    </PurchaseProvider>
    </AuthProvider>
  );
}
