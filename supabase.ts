
import { createClient } from '@supabase/supabase-js';

/**
 * Tenta capturar as variáveis de ambiente de forma segura no navegador.
 */
const getEnvVar = (baseName: string): string => {
  const variations = [
    baseName,
    `VITE_${baseName}`,
    `NEXT_PUBLIC_${baseName}`,
    `REACT_APP_${baseName}`
  ];

  try {
    // Verifica se 'process' e 'process.env' existem para evitar crash fatal
    const env = (typeof process !== 'undefined' && process.env) 
      ? process.env 
      : (window as any).process?.env;

    if (!env) return '';

    for (const v of variations) {
      const value = (env as any)[v];
      if (value && typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
  } catch (e) {
    // Silencia erros de acesso a variáveis de ambiente
  }
  return '';
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_KEY') || getEnvVar('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

// Inicializa o cliente apenas se configurado e se as chaves forem válidas
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Diagnóstico seguro no console
if (typeof window !== 'undefined') {
  console.group("🛠️ Status da Conexão Cloud");
  if (isSupabaseConfigured) {
    console.log("✅ Supabase: Configurado");
  } else {
    console.warn("⚠️ Supabase: Não configurado. Usando MODO LOCAL.");
    console.info("Dica: Adicione VITE_SUPABASE_URL e VITE_SUPABASE_KEY na Vercel e faça Redeploy.");
  }
  console.groupEnd();
}
