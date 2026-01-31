
import React, { useState, useEffect, useRef } from 'react';
import { ClinicalSession, ClinicalCase, SessionStep } from '../types';
import { storage } from '../storage';
import { getAIFeedback } from '../geminiService';
import { Send, ArrowRight, X, User, Bot, CheckCircle2, AlertCircle, Award, Loader2 } from 'lucide-react';

interface CaseSessionProps {
  sessionId: string;
  onClose: () => void;
}

const CaseSession: React.FC<CaseSessionProps> = ({ sessionId, onClose }) => {
  const [session, setSession] = useState<ClinicalSession | null>(null);
  const [clinicalCase, setClinicalCase] = useState<ClinicalCase | null>(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    const s = await storage.getSessionById(sessionId);
    if (s) {
      setSession(s);
      const cases = await storage.getCases();
      const c = cases.find(x => x.id === s.case_id);
      if (c) setClinicalCase(c);
    }
    setDataLoaded(true);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session]);

  if (!dataLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  if (!session || !clinicalCase) return null;

  const isCompleted = session.status === 'completed';

  const handleSend = async () => {
    if (!response.trim() || loading || isCompleted) return;

    setLoading(true);
    try {
      const aiResult = await getAIFeedback(clinicalCase, session.current_step, response);
      
      const newStepData: SessionStep = {
        step_index: session.current_step,
        student_response: response,
        ai_feedback: aiResult.feedback,
        partial_score: aiResult.score,
        timestamp: new Date().toISOString()
      };

      const isLastStep = session.current_step === clinicalCase.steps.length - 1;
      const updatedSession: ClinicalSession = {
        ...session,
        current_step: isLastStep ? session.current_step : session.current_step + 1,
        status: isLastStep ? 'completed' : 'in_progress',
        total_score: session.total_score + aiResult.score,
        steps_data: [...session.steps_data, newStepData],
        finished_at: isLastStep ? new Date().toISOString() : undefined
      };

      await storage.saveSession(updatedSession);
      setSession(updatedSession);
      setResponse('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      {/* Dynamic Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-3 hover:bg-slate-700 rounded-2xl text-slate-400 transition-colors">
            <X size={20} />
          </button>
          <div>
            <h2 className="font-black text-white tracking-tight">{clinicalCase.title}</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                ETAPA {session.current_step + 1} / {clinicalCase.steps.length}
              </span>
              <div className="w-40 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-700 ease-out"
                  style={{ width: `${((session.current_step + (isCompleted ? 1 : 0)) / clinicalCase.steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-3 px-6 py-2 bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20">
          <Award size={18} />
          <span className="text-lg">{session.total_score} <span className="text-blue-200 text-xs">PTS</span></span>
        </div>
      </header>

      {/* Main Discussion Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 flex flex-col gap-10">
        
        {/* Clinical Scenario Block */}
        <div className="bg-slate-800 rounded-[2.5rem] p-10 shadow-inner border border-slate-700 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Stethoscope size={100} className="text-blue-500" />
          </div>
          <div className="relative z-10">
            <h3 className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <AlertCircle size={16} />
               CASO EM PROGRESSO • {clinicalCase.steps[isCompleted ? clinicalCase.steps.length - 1 : session.current_step].title}
            </h3>
            <p className="text-slate-100 leading-relaxed text-xl font-medium mb-10">
              {clinicalCase.steps[isCompleted ? clinicalCase.steps.length - 1 : session.current_step].content}
            </p>
            <div className="bg-slate-900/50 p-8 rounded-[2rem] border-l-8 border-blue-500">
              <p className="font-black text-white text-lg italic">
                {clinicalCase.steps[isCompleted ? clinicalCase.steps.length - 1 : session.current_step].question}
              </p>
            </div>
          </div>
        </div>

        {/* Chat / Timeline */}
        <div className="space-y-12 mb-20">
          {session.steps_data.map((step, idx) => (
            <div key={idx} className="space-y-6 animate-fade-in">
              {/* Aluno */}
              <div className="flex justify-end items-start gap-4">
                <div className="max-w-[70%] bg-blue-600 text-white rounded-[2rem] rounded-tr-none p-6 shadow-xl relative">
                   <p className="text-[10px] font-black text-blue-200 uppercase mb-2 tracking-widest">Minha Resposta</p>
                   <p className="font-semibold leading-relaxed">{step.student_response}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black text-xs shrink-0 mt-2">
                  EU
                </div>
              </div>

              {/* Tutor IA */}
              <div className="flex justify-start items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center text-blue-400 shrink-0 mt-2">
                  <Bot size={20} />
                </div>
                <div className="max-w-[80%] bg-slate-800 text-slate-200 rounded-[2rem] rounded-tl-none p-8 shadow-xl border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Análise do Tutor IA</p>
                    <div className="flex items-center gap-2 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-700">
                      <span className="text-xs font-black text-emerald-400">+{step.partial_score} PTS</span>
                    </div>
                  </div>
                  <p className="leading-relaxed font-medium text-lg whitespace-pre-wrap">{step.ai_feedback}</p>
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      {!isCompleted && (
        <div className="bg-slate-800/80 backdrop-blur-xl border-t border-slate-700 p-8 sticky bottom-0 z-30">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Elabore sua hipótese e raciocínio clínico detalhado..."
                  className="w-full bg-slate-900 border-2 border-slate-700 text-white p-6 rounded-[2rem] focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none font-medium text-lg placeholder:text-slate-600"
                  disabled={loading}
                />
                {loading && (
                  <div className="absolute inset-0 bg-slate-900/50 rounded-[2rem] flex items-center justify-center backdrop-blur-sm">
                    <div className="flex items-center gap-3 text-blue-400 font-black tracking-widest uppercase text-xs">
                      <Loader2 className="animate-spin" />
                      O Tutor está analisando sua resposta...
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSend}
                disabled={loading || !response.trim()}
                className={`p-6 rounded-[2rem] text-white transition-all shadow-2xl active:scale-95 group ${
                  loading || !response.trim() ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20'
                }`}
              >
                <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Score Block */}
      {isCompleted && (
        <div className="bg-slate-900 border-t border-slate-800 p-16 flex flex-col items-center gap-8 animate-fade-in z-30">
          <div className="text-center">
            <div className="bg-emerald-500/20 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
               <CheckCircle2 className="text-emerald-500" size={48} />
            </div>
            <h3 className="text-4xl font-black text-white tracking-tight mb-2">Discussão Concluída!</h3>
            <p className="text-slate-400 text-lg mb-8">O desempenho foi registrado no seu perfil do aluno.</p>
            <div className="inline-flex items-center gap-6 bg-slate-800 px-10 py-6 rounded-[2.5rem] border border-slate-700 shadow-2xl">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">SCORE FINAL</p>
                <p className="text-5xl font-black text-blue-500 tracking-tighter">{session.total_score} <span className="text-slate-600 text-2xl tracking-normal">/ 10</span></p>
              </div>
              <div className="w-px h-12 bg-slate-700"></div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">DATA</p>
                <p className="text-white font-bold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black hover:bg-slate-100 transition-all flex items-center gap-3 shadow-xl active:scale-95"
          >
            VOLTAR AO PAINEL
            <ArrowRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

const Stethoscope = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3Z"/><path d="M10 2v2"/><path d="M14 2v2"/><path d="M3 10v1a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-1"/><path d="M12 21a3.5 3.5 0 0 1-7 0V15"/><path d="M12 21a3.5 3.5 0 0 0 7 0V15"/><path d="M12 3a3 3 0 0 0-3 3v7h6V6a3 3 0 0 0-3-3Z"/>
  </svg>
);

export default CaseSession;
