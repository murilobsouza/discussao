
import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { storage } from './storage';
import { isSupabaseConfigured } from './supabase';
import Auth from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import CaseSession from './components/CaseSession';
import { LogOut, BookOpen, Cloud, CloudOff, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('oftalmo_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: UserProfile) => {
    localStorage.setItem('oftalmo_current_user', JSON.stringify(user));
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('oftalmo_current_user');
    setUser(null);
    setActiveSessionId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Se não há usuário logado, mostra Auth (que agora permite criar conta local ou cloud)
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Se houver uma sessão de caso ativa, mostra a sessão
  if (activeSessionId) {
    return (
      <CaseSession 
        sessionId={activeSessionId} 
        onClose={() => setActiveSessionId(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-fade-in">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent leading-none">
              Tutor Oftalmo
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSupabaseConfigured ? (
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
                  <Cloud size={10} /> Cloud Synced
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-tighter">
                  <CloudOff size={10} /> Local Mode
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2 text-right">
            <span className="text-sm font-bold text-slate-800">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {user.role === 'professor' ? 'Preceptor' : 'Acadêmico'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2.5 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {user.role === 'student' ? (
          <StudentDashboard 
            user={user} 
            onStartCase={(sessionId) => setActiveSessionId(sessionId)} 
          />
        ) : (
          <ProfessorDashboard user={user} />
        )}
      </main>

      <footer className="bg-slate-100/50 border-t border-slate-200 p-6 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="text-blue-600">IA Powered by Gemini 3</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>Uso Acadêmico Restrito</span>
          </div>
          <p>© 2024 - Faculdade de Medicina - Disciplina de Oftalmologia</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
