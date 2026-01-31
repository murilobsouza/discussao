
import { createClient } from '@supabase/supabase-js';

/**
 * Procura as chaves em todas as variações possíveis de prefixos.
 * Vercel/Vite/React costumam exigir prefixos diferentes.
 */
const getEnv = (name: string) => {
  return (
    (process.env as any)[name] ||
    (process.env as any)[`VITE_${name}`] ||
    (process.env as any)[`NEXT_PUBLIC_${name}`] ||
    (process.env as any)[`REACT_APP_${name}`] ||
    ''
  ).trim();
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_KEY') || getEnv('SUPABASE_ANON_KEY');

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

// Diagnóstico para o desenvolvedor no navegador (F12)
if (!isSupabaseConfigured) {
  console.group("🛠️ Diagnóstico de Conexão Supabase");
  console.warn("Status: MODO LOCAL ATIVO");
  console.info("Para ativar a nuvem, configure na Vercel:");
  console.log("- SUPABASE_URL:", supabaseUrl ? "✅ Detectada" : "❌ Ausente");
  console.log("- SUPABASE_KEY:", supabaseAnonKey ? "✅ Detectada" : "❌ Ausente");
  console.groupEnd();
} else {
  console.log("🚀 Supabase: Conexão configurada e ativa.");
}
