
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

// Verifica se as configurações básicas existem para evitar erro de execução fatal
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : (null as any);
