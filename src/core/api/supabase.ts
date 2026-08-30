import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from '@/core/api/database.types';
import { resolveSupabaseConfiguration } from '@/core/api/supabaseConfig';

export const supabaseConfiguration = resolveSupabaseConfiguration(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

let client: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (supabaseConfiguration.status !== 'ready') return null;
  if (client) return client;

  client = createClient<Database>(
    supabaseConfiguration.url,
    supabaseConfiguration.publishableKey,
    {
      auth: {
        ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }),
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
      },
    },
  );

  return client;
}
