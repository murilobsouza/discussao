
import { createClient } from '@supabase/supabase-js';

/**
 * Tenta capturar as variáveis de todas as formas possíveis que 
 * diferentes servidores de deploy (Vercel, Netlify, Cloudflare) utilizam.
 */
const getEnvVar = (baseName: string): string => {
  const variations = [
    baseName,
    `VITE_${baseName}`,
    `NEXT_PUBLIC_${baseName}`,
    `REACT_APP_${baseName}`
  ];

  for (const v of variations) {
    const value = (process.env as any)[v];
    if (value && typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
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

// Inicializa o cliente apenas se configurado
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Diagnóstico avançado para o console do navegador
console.group("🛠️ Status da Conexão Cloud");
if (isSupabaseConfigured) {
  console.log("✅ Supabase: Configurado");
  console.log(`📍 URL: ${supabaseUrl.substring(0, 15)}...`);
  console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 6)}...`);
} else {
  console.warn("⚠️ Supabase: Não configurado. Usando MODO LOCAL (LocalStorage).");
  console.info("Dica: No Vercel, use o prefixo VITE_ nas variáveis (ex: VITE_SUPABASE_URL)");
}
console.groupEnd();
