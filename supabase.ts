import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    const env = (window as any).process?.env || {};
    return env[key] || "";
  } catch {
    return "";
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_KEY') || getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

// Cria o cliente apenas se configurado, caso contrário exporta null com segurança
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;