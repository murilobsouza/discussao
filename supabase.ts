
import { createClient } from '@supabase/supabase-js';

// Função ultra-segura para capturar variáveis de ambiente sem quebrar o browser
const getEnv = (key: string): string => {
  const g = globalThis as any;
  const env = g.process?.env || g.import?.meta?.env || {};
  
  return env[key] || 
         env[`VITE_${key}`] || 
         env[`NEXT_PUBLIC_${key}`] || 
         '';
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_KEY') || getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

// Inicializa o cliente apenas se tivermos os dados necessários
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Log de diagnóstico silencioso
if (isSupabaseConfigured) {
  console.log("☁️ Supabase Cloud: Ativo");
} else {
  console.log("🏠 Modo Local: Ativo (LocalStorage)");
}
