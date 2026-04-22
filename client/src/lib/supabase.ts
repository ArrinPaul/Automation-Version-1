import { createClient } from '@supabase/supabase-js';

const isTestMode = import.meta.env.MODE === 'test';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? (isTestMode ? 'http://localhost:54321' : undefined);
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? (isTestMode ? 'test-anon-key' : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
