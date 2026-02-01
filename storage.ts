
import { UserProfile, ClinicalCase, ClinicalSession } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

export const storage = {
  // Helper para evitar erros se o cliente for nulo
  safeCall: async (fn: () => Promise<any>, fallback: any) => {
    if (!isSupabaseConfigured) return fallback;
    try {
      return await fn();
    } catch (e) {
      console.error("Supabase error:", e);
      return fallback;
    }
  },

  // Usuários e Perfis
  getProfile: async (email: string): Promise<UserProfile | null> => {
    return storage.safeCall(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      return data;
    }, null);
  },

  saveProfile: async (profile: UserProfile): Promise<void> => {
    await storage.safeCall(async () => {
      await supabase.from('profiles').insert([profile]);
    }, null);
  },

  getAllStudents: async (): Promise<UserProfile[]> => {
    return storage.safeCall(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');
      return data || [];
    }, []);
  },

  // Casos Clínicos
  getCases: async (): Promise<ClinicalCase[]> => {
    return storage.safeCall(async () => {
      const { data } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }, []);
  },

  saveCase: async (newCase: ClinicalCase): Promise<void> => {
    await storage.safeCall(async () => {
      await supabase.from('cases').upsert(newCase);
    }, null);
  },

  deleteCase: async (id: string): Promise<void> => {
    await storage.safeCall(async () => {
      await supabase.from('cases').delete().eq('id', id);
    }, null);
  },

  // Sessões de Discussão
  getSessions: async (): Promise<ClinicalSession[]> => {
    return storage.safeCall(async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .order('started_at', { ascending: false });
      return data || [];
    }, []);
  },

  getUserSessions: async (userId: string): Promise<ClinicalSession[]> => {
    return storage.safeCall(async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('student_id', userId)
        .order('started_at', { ascending: false });
      return data || [];
    }, []);
  },

  saveSession: async (session: ClinicalSession): Promise<void> => {
    await storage.safeCall(async () => {
      await supabase.from('sessions').upsert(session);
    }, null);
  },

  getSessionById: async (id: string): Promise<ClinicalSession | null> => {
    return storage.safeCall(async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();
      return data;
    }, null);
  }
};
