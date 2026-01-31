
import React, { useState, useEffect } from 'react';
import { UserProfile, ClinicalCase, ClinicalSession } from '../types';
import { storage } from '../storage';
import { Plus, Users, Layout, FileText, Download, Loader2, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import CaseManagement from './CaseManagement';

interface ProfessorDashboardProps {
  user: UserProfile;
}

const ProfessorDashboard: React.FC<ProfessorDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'students'>('overview');
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [sessions, setSessions] = useState<ClinicalSession[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    const [c, s, u] = await Promise.all([
      storage.getCases(),
      storage.getSessions(),
      storage.getAllStudents()
    ]);
    setCases(c);
    setSessions(s);
    setStudents(u);
    setLoading(false);
  };

  const chartData = students.map(student => {
    const studentSessions = sessions.filter(sess => sess.student_id === student.id && sess.status === 'completed');
    const avg = studentSessions.length > 0 
      ? studentSessions.reduce((acc, curr) => acc + curr.total_score, 0) / studentSessions.length
      : 0;
    return { name: student.name.split(' ')[0], score: Number(avg.toFixed(1)) };
  }).sort((a, b) => b.score - a.score).slice(0, 10);

  const stats = {
    totalSessions: sessions.length,
    avgScore: sessions.length > 0 ? (sessions.reduce((acc, s) => acc + s.total_score, 0) / sessions.length).toFixed(1) : '0.0',
    totalStudents: students.length,
    activeCases: cases.length
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-medium">Sincronizando dados com Supabase...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Portal do Preceptor</h2>
          <p className="text-slate-500">Gestão acadêmica e monitoramento de desempenho em tempo real.</p>
        </div>
        
        <button
          onClick={() => {
            const csvContent = "data:text/csv;charset=utf-8," 
              + ["Aluno,Caso,Score,Data"].join(",") + "\n"
              + sessions.map(s => `${s.student_id},${s.case_title},${s.total_score},${s.started_at}`).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "relatorio_desempenho.csv");
            document.body.appendChild(link);
            link.click();
          }}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <Download size={18} />
          EXPORTAR RELATÓRIO
        </button>
      </div>

      <nav className="flex gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-fit border border-slate-200">
        {[
          { id: 'overview', label: 'Estatísticas', icon: BarChart3 },
          { id: 'cases', label: 'Curadoria de Casos', icon: FileText },
          { id: 'students', label: 'Lista de Alunos', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatSmall label="Sessões Totais" value={stats.totalSessions} icon={TrendingUp} color="blue" />
            <StatSmall label="Média da Turma" value={stats.avgScore} icon={Users} color="emerald" />
            <StatSmall label="Alunos Ativos" value={stats.totalStudents} icon={Users} color="indigo" />
            <StatSmall label="Casos no Banco" value={stats.activeCases} icon={Layout} color="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
              <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
                <BarChart3 className="text-blue-500" />
                Performance dos Melhores Alunos (Top 10)
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <h3 className="font-bold text-slate-800 mb-6">Atividade Recente</h3>
              <div className="space-y-4">
                {sessions.slice(0, 6).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 truncate">{s.case_title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {students.find(u => u.id === s.student_id)?.name || 'Estudante'}
                      </p>
                    </div>
                    <span className="text-sm font-black text-blue-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">{s.total_score} pts</span>
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-center text-slate-400 py-10">Nenhuma atividade recente.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cases' && <CaseManagement />}

      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Nome do Aluno</th>
                <th className="px-8 py-5">Identificação</th>
                <th className="px-8 py-5">Sessões</th>
                <th className="px-8 py-5">Performance Média</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((student) => {
                const sSessions = sessions.filter(s => s.student_id === student.id);
                const avg = sSessions.length > 0 
                  ? (sSessions.reduce((a, b) => a + b.total_score, 0) / sSessions.length).toFixed(1)
                  : '0.0';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-800">{student.name}</td>
                    <td className="px-8 py-6 text-slate-500 text-sm">{student.email}</td>
                    <td className="px-8 py-6 font-medium">{sSessions.length} casos</td>
                    <td className="px-8 py-6">
                      <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-black text-sm">
                        {avg} / 10
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatSmall = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-600',
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`${colors[color]} p-3 rounded-xl`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default ProfessorDashboard;
