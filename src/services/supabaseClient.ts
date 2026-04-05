import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail loudly if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase credentials!\n' +
      'Please create a .env file with:\n' +
      '  VITE_SUPABASE_URL=your_project_url\n' +
      '  VITE_SUPABASE_ANON_KEY=your_anon_key\n' +
      'Get these from: https://supabase.com/dashboard'
  );
}

if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
  throw new Error(
    '❌ Placeholder Supabase credentials detected!\n' +
      'Please update your .env file with real credentials from:\n' +
      'https://supabase.com/dashboard'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✓ Supabase client initialized');
