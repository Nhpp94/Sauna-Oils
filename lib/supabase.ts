import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const CHUNK_SIZE = 2000;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    const numChunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (!numChunksStr) return SecureStore.getItemAsync(key);
    const numChunks = parseInt(numChunksStr, 10);
    const chunks = await Promise.all(
      Array.from({ length: numChunks }, (_, i) => SecureStore.getItemAsync(`${key}_${i}`))
    );
    if (chunks.some((c) => c === null)) return null;
    return chunks.join('');
  },
  setItem: async (key: string, value: string) => {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
    await Promise.all(chunks.map((chunk, i) => SecureStore.setItemAsync(`${key}_${i}`, chunk)));
  },
  removeItem: async (key: string) => {
    const numChunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
    if (numChunksStr) {
      const numChunks = parseInt(numChunksStr, 10);
      await SecureStore.deleteItemAsync(`${key}_chunks`);
      await Promise.all(
        Array.from({ length: numChunks }, (_, i) => SecureStore.deleteItemAsync(`${key}_${i}`))
      );
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: Platform.OS === 'web' ? AsyncStorage : ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
