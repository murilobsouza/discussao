
import { UserProfile, ClinicalCase, ClinicalSession } from './types';
import { supabase, isSupabaseConfigured } from './supabase';
import { INITIAL_CASES } from './constants';

const LS_KEYS = {
  PROFILES: 'oftalmo_profiles',
  CASES: 'oftalmo_cases',
  SESSIONS: 'oftalmo_sessions'
};

const getLS = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLS = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storage = {
  getProfile: async (email: string): Promise<UserProfile | null> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
        if (error) throw error;
        if (data) return data;
      } catch (e) { 
        console.error("Erro Supabase (getProfile):", e);
      }
    }
    const profiles = getLS<UserProfile[]>(LS_KEYS.PROFILES, []);
    return profiles.find(p => p.email === email) || null;
  },

  saveProfile: async (profile: UserProfile): Promise<void> => {
    // Sempre salva localmente para redundância
    const profiles = getLS<UserProfile[]>(LS_KEYS.PROFILES, []);
    setLS(LS_KEYS.PROFILES, [...profiles.filter(p => p.email !== profile.email), profile]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('profiles').upsert(profile);
        if (error) throw error;
      } catch (e) {
        console.error("Erro Supabase (saveProfile):", e);
      }
    }
  },

  getAllStudents: async (): Promise<UserProfile[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('profiles').select('*').eq('role', 'student');
        if (error) throw error;
        if (data) return data;
      } catch (e) {
        console.error("Erro Supabase (getAllStudents):", e);
      }
    }
    return getLS<UserProfile[]>(LS_KEYS.PROFILES, []).filter(p => p.role === 'student');
  },

  getCases: async (): Promise<ClinicalCase[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (e) {
        console.error("Erro Supabase (getCases):", e);
      }
    }
    const lsCases = getLS<ClinicalCase[]>(LS_KEYS.CASES, []);
    return lsCases.length > 0 ? lsCases : INITIAL_CASES;
  },

  saveCase: async (newCase: ClinicalCase): Promise<void> => {
    const cases = getLS<ClinicalCase[]>(LS_KEYS.CASES, []);
    setLS(LS_KEYS.CASES, [...cases.filter(c => c.id !== newCase.id), newCase]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('cases').upsert(newCase);
        if (error) throw error;
      } catch (e) {
        console.error("Erro Supabase (saveCase):", e);
      }
    }
  },

  deleteCase: async (id: string): Promise<void> => {
    const cases = getLS<ClinicalCase[]>(LS_KEYS.CASES, []);
    setLS(LS_KEYS.CASES, cases.filter(c => c.id !== id));

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('cases').delete().eq('id', id);
        if (error) throw error;
      } catch (e) {
        console.error("Erro Supabase (deleteCase):", e);
      }
    }
  },

  getSessions: async (): Promise<ClinicalSession[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('sessions').select('*').order('started_at', { ascending: false });
        if (error) throw error;
        if (data) return data;
      } catch (e) {
        console.error("Erro Supabase (getSessions):", e);
      }
    }
    return getLS<ClinicalSession[]>(LS_KEYS.SESSIONS, []);
  },

  getUserSessions: async (userId: string): Promise<ClinicalSession[]> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('sessions').select('*').eq('student_id', userId).order('started_at', { ascending: false });
        if (error) throw error;
        if (data) return data;
      } catch (e) {
        console.error("Erro Supabase (getUserSessions):", e);
      }
    }
    return getLS<ClinicalSession[]>(LS_KEYS.SESSIONS, []).filter(s => s.student_id === userId);
  },

  saveSession: async (session: ClinicalSession): Promise<void> => {
    const sessions = getLS<ClinicalSession[]>(LS_KEYS.SESSIONS, []);
    setLS(LS_KEYS.SESSIONS, [...sessions.filter(s => s.id !== session.id), session]);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('sessions').upsert(session);
        if (error) throw error;
      } catch (e) {
        console.error("Erro Supabase (saveSession):", e);
      }
    }
  },

  getSessionById: async (id: string): Promise<ClinicalSession | null> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('sessions').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        if (data) return data;
      } catch (e) {
        console.error("Erro Supabase (getSessionById):", e);
      }
    }
    return getLS<ClinicalSession[]>(LS_KEYS.SESSIONS, []).find(s => s.id === id) || null;
  }
};
