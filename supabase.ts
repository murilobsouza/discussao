
import { createClient } from '@supabase/supabase-js';

// No Vercel/Vite, as variáveis podem vir com ou sem prefixo dependendo da configuração do projeto
const rawUrl = process.env.SUPABASE_URL || (process.env as any).NEXT_PUBLIC_SUPABASE_URL || (process.env as any).VITE_SUPABASE_URL;
const rawKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || (process.env as any).VITE_SUPABASE_ANON_KEY;

// Limpeza de espaços em branco que podem vir de copy-paste
const supabaseUrl = rawUrl?.trim() || '';
const supabaseAnonKey = rawKey?.trim() || '';

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

// Log de depuração (Visível apenas no F12 do navegador)
if (isSupabaseConfigured) {
  console.log("🚀 Supabase: Conectado com sucesso.");
} else {
  console.warn("⚠️ Supabase: Chaves não encontradas ou inválidas. O app funcionará em MODO LOCAL (apenas neste navegador).");
  console.debug("Config detectada:", { url: !!supabaseUrl, key: !!supabaseAnonKey });
}
