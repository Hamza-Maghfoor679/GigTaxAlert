import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Typed Supabase client — set EXPO_PUBLIC_SUPABASE_* in `.env` for real usage. */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
