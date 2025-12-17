import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in your .env file
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

// Create a client only if keys exist to avoid runtime crash.
// If keys are missing, we export a proxy/mock that logs errors when called.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
    get: () => () => {
      console.error('Supabase client is not initialized. Missing environment variables.');
      return { data: null, error: { message: 'Supabase not configured' } };
    }
  });
