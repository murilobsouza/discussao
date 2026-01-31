
import React, { useEffect, useState } from 'react';
import { UserProfile, ClinicalSession, ClinicalCase } from '../types';
import { storage } from '../storage';
import { Play, History, Award, Clock, ChevronRight, Loader2 } from 'lucide-react';

interface StudentDashboardProps {
  user: UserProfile;
  onStartCase: (sessionId: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onStartCase }) => {
  const [sessions, setSessions] = useState<ClinicalSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userSessions = await storage.getUserSessions(user.id);
    setSessions(userSessions);
    setLoading(false);
  };

  const startRandomCase = async () => {
    setLoading(true);
    const cases = await storage.getCases();
    if (cases.length === 0) {
      alert("Nenhum caso disponível cadastrado pelo professor.");
      setLoading(false);
      return;
    }

    const completedCaseIds = sessions.filter(s => s.status === 'completed').map(s => s.case_id);
    const availableCases = cases.filter(c => !completedCaseIds.includes(c.id));
    
    const selectedCase = availableCases.length > 0 
      ? availableCases[Math.floor(Math.random() * availableCases.length)]
      : cases[Math.floor(Math.random() * cases.length)];

    const newSession: ClinicalSession = {
      id: Math.random().toString(36).substr(2, 9),
      student_id: user.id,
      case_id: selectedCase.id,
      case_title: selectedCase.title,
      status: 'in_progress',
      current_step: 0,
      total_score: 0,
      steps_data: [],
      started_at: new Date().toISOString()
    };

    await storage.saveSession(newSession);
    onStartCase(newSession.id);
  };

  const completed = sessions.filter(s => s.status === 'completed');
  const avgScore = completed.length > 0 
    ? (completed.reduce((acc, s) => acc + s.total_score, 0) / completed.length).toFixed(1) 
    : '0.0';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-medium">Carregando seus dados do Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Olá, {user.name.split(' ')[0]} 👋</h2>
          <p className="text-slate-500 text-lg">Pronto para aprimorar seu diagnóstico clínico?</p>
        </div>
        
        <button
          onClick={startRandomCase}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold shadow-xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group"
        >
          <Play size={24} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
          INICIAR CASO ALEATÓRIO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Score Médio" value={`${avgScore}/10`} icon={Award} color="blue" />
        <StatCard label="Casos Concluídos" value={completed.length} icon={History} color="emerald" />
        <StatCard label="Total de Sessões" value={sessions.length} icon={Clock} color="amber" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <History className="text-blue-500" />
            Meu Histórico
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{sessions.length} registros</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {sessions.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="text-slate-400 ml-1" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum caso clínico realizado ainda.</p>
              <button onClick={startRandomCase} className="mt-4 text-blue-600 font-bold hover:underline">Começar agora</button>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-slate-50 transition-all flex items-center justify-between group">
                <div className="flex gap-4 items-center">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${session.status === 'completed' ? 'bg-emerald-500 ring-4 ring-emerald-50' : 'bg-amber-500 ring-4 ring-amber-50'}`}></div>
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{session.case_title}</h4>
                    <p className="text-xs font-medium text-slate-400">
                      {new Date(session.started_at).toLocaleDateString()} • {new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-10">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">PONTUAÇÃO</p>
                    <p className="text-xl font-black text-slate-700">{session.total_score} <span className="text-slate-300 text-sm">/ 10</span></p>
                  </div>
                  
                  <button 
                    onClick={() => onStartCase(session.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    {session.status === 'completed' ? 'Revisar' : 'Continuar'}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
      <div className={`${colors[color]} p-4 rounded-2xl shadow-inner`}>
        <Icon size={32} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
