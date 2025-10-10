import { createClient } from '@supabase/supabase-js';

// Note: Vite requires environment variables to be prefixed with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Make sure they are set in your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
