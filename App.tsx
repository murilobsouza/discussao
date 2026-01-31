
import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { storage } from './storage';
import { isSupabaseConfigured } from './supabase';
import Auth from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import CaseSession from './components/CaseSession';
import { LogOut, BookOpen, AlertTriangle, ExternalLink } from 'lucide-react';

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

  // Se o Supabase não estiver configurado, mostra uma tela de orientação em vez de quebrar
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 text-center">
          <div className="bg-amber-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Conexão Necessária</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            O aplicativo está pronto, mas você precisa configurar as variáveis de ambiente do <strong>Supabase</strong> no seu painel da Vercel para que o banco de dados funcione.
          </p>
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs font-mono text-slate-500 border border-slate-100">
              SUPABASE_URL=sua_url_aqui<br/>
              SUPABASE_KEY=sua_chave_anonima_aqui
            </div>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              Ir para o Supabase <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

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
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" size={28} />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Tutor Oftalmo
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2 text-right">
            <span className="text-sm font-semibold text-slate-700">{user.name}</span>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              {user.role === 'professor' ? 'Professor/Admin' : 'Estudante'}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-all"
            title="Sair"
          >
            <LogOut size={20} />
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

      <footer className="bg-white border-t border-slate-200 p-4 text-center text-slate-400 text-xs">
        <p className="font-semibold text-amber-600 mb-1">
          Aviso: Uso educacional. Não substitui supervisão médica.
        </p>
        <p>© 2024 Tutor de Casos Clínicos - Oftalmologia. Dados integrados ao Supabase.</p>
      </footer>
    </div>
  );
};

export default App;
