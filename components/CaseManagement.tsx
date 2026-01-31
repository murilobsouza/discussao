
import React, { useState, useEffect } from 'react';
import { ClinicalCase } from '../types';
import { storage } from '../storage';
import { Plus, Trash2, Save, Upload, Search, X, Edit2, Loader2, BookCopy } from 'lucide-react';

const CaseManagement: React.FC = () => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [editingCase, setEditingCase] = useState<ClinicalCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    const data = await storage.getCases();
    setCases(data);
    setLoading(false);
  };

  const createEmptyCase = () => {
    const newCase: ClinicalCase = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      theme: 'Catarata',
      difficulty: 'médio',
      tags: [],
      steps: [
        { title: 'Apresentação Inicial', content: '', question: 'Quais suas hipóteses diagnósticas?' },
        { title: 'Exames Complementares', content: '', question: 'Quais exames solicitaria?' },
        { title: 'Diagnóstico Final', content: '', question: 'Qual o diagnóstico mais provável?' },
        { title: 'Conduta', content: '', question: 'Qual o tratamento indicado?' },
        { title: 'Resumo e Feedback', content: '', question: 'O que aprendemos com este caso?' },
      ],
      created_at: new Date().toISOString(),
      created_by: 'admin'
    };
    setEditingCase(newCase);
  };

  const saveCase = async () => {
    if (editingCase && editingCase.title) {
      setLoading(true);
      await storage.saveCase(editingCase);
      await loadCases();
      setEditingCase(null);
    } else {
      alert("Por favor, insira pelo menos o título do caso.");
    }
  };

  const deleteCase = async (id: string) => {
    if (confirm('Deseja realmente excluir este caso do Supabase?')) {
      setLoading(true);
      await storage.deleteCase(id);
      await loadCases();
    }
  };

  const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const casesToImport = Array.isArray(json) ? json : [json];
          for (const c of casesToImport) {
            await storage.saveCase({ ...c, id: c.id || Math.random().toString(36).substr(2, 9) });
          }
          await loadCases();
          alert("Importação concluída!");
        } catch (err) {
          alert("Erro no formato do JSON.");
          setLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.theme.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {!editingCase ? (
        <>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Pesquisar por título ou tema..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <label className="flex-1 sm:flex-none bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-100 transition-all active:scale-95">
                <Upload size={18} />
                IMPORTAR JSON
                <input type="file" accept=".json" onChange={handleJsonUpload} className="hidden" />
              </label>
              <button
                onClick={createEmptyCase}
                className="flex-1 sm:flex-none bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"
              >
                <Plus size={20} />
                NOVO CASO
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCases.map(c => (
                <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group relative">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      c.difficulty === 'fácil' ? 'bg-emerald-50 text-emerald-700' : 
                      c.difficulty === 'médio' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {c.difficulty}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingCase(c)} className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg"><Edit2 size={16} /></button>
                      <button onClick={() => deleteCase(c.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <h4 className="font-black text-slate-800 text-lg mb-1 leading-tight">{c.title}</h4>
                  <p className="text-sm font-bold text-blue-500 mb-6">{c.theme}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <BookCopy size={14} />
                      <span className="text-[10px] font-bold uppercase">{c.steps.length} etapas</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">ID: {c.id.slice(0, 5)}</span>
                  </div>
                </div>
              ))}
              {filteredCases.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                  <p className="text-slate-400 font-medium">Nenhum caso clínico encontrado.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
          <div className="bg-slate-900 px-8 py-5 flex justify-between items-center text-white">
            <h3 className="font-black tracking-tight text-lg">CONFIGURADOR DE CASO CLÍNICO</h3>
            <button onClick={() => setEditingCase(null)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
          </div>
          
          <div className="p-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título Principal do Caso</label>
                <input
                  type="text"
                  placeholder="Ex: Glaucoma Agudo de Ângulo Fechado"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold text-lg"
                  value={editingCase.title}
                  onChange={(e) => setEditingCase({...editingCase, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Especialidade/Tema</label>
                <select
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  value={editingCase.theme}
                  onChange={(e) => setEditingCase({...editingCase, theme: e.target.value})}
                >
                  <option>Geral</option>
                  <option>Glaucoma</option>
                  <option>Catarata</option>
                  <option>Retina</option>
                  <option>Córnea</option>
                  <option>Urgência</option>
                  <option>Uveíte</option>
                </select>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                Sequenciamento do Caso ({editingCase.steps.length} Etapas)
              </h4>
              <div className="grid gap-6">
                {editingCase.steps.map((step, idx) => (
                  <div key={idx} className="bg-slate-50 p-8 rounded-3xl border border-slate-200 relative group hover:border-blue-300 transition-all">
                    <div className="absolute -left-4 top-8 bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-xl ring-8 ring-white">
                      {idx + 1}
                    </div>
                    <div className="grid gap-4 ml-4">
                      <input
                        type="text"
                        placeholder="Nome desta etapa..."
                        className="w-full px-5 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-800 outline-none"
                        value={step.title}
                        onChange={(e) => {
                          const newSteps = [...editingCase.steps];
                          newSteps[idx].title = e.target.value;
                          setEditingCase({...editingCase, steps: newSteps});
                        }}
                      />
                      <textarea
                        placeholder="Descreva o cenário clínico (sintomas, achados, exames)..."
                        rows={4}
                        className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl outline-none resize-none font-medium leading-relaxed"
                        value={step.content}
                        onChange={(e) => {
                          const newSteps = [...editingCase.steps];
                          newSteps[idx].content = e.target.value;
                          setEditingCase({...editingCase, steps: newSteps});
                        }}
                      />
                      <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-600/10">
                        <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">Pergunta para o Aluno:</label>
                        <input
                          type="text"
                          placeholder="Qual pergunta a IA deve fazer aqui?"
                          className="w-full bg-transparent outline-none font-bold text-blue-900 placeholder:text-blue-300"
                          value={step.question}
                          onChange={(e) => {
                            const newSteps = [...editingCase.steps];
                            newSteps[idx].question = e.target.value;
                            setEditingCase({...editingCase, steps: newSteps});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
              <button
                onClick={() => setEditingCase(null)}
                className="px-10 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
              >
                DESCARTAR
              </button>
              <button
                onClick={saveCase}
                disabled={loading}
                className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 flex items-center gap-3 shadow-xl transition-all active:scale-95 disabled:bg-slate-300"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                SALVAR NO SUPABASE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
