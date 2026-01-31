
import { createClient } from '@supabase/supabase-js';

/**
 * IMPORTANTE: Use sempre a ANON/PUBLISHABLE KEY aqui.
 * Nomes comuns: SUPABASE_KEY, SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Verifica se a URL é válida e se a chave existe
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

// Inicializa o cliente apenas se configurado corretamente
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn("Supabase: Chaves não detectadas ou inválidas. Usando modo de persistência local.");
} else {
  console.log("Supabase: Conexão configurada com sucesso.");
}
