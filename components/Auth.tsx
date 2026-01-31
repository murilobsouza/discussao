
import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { storage } from '../storage';
import { AUTH_CODES } from '../constants';
import { isSupabaseConfigured } from '../supabase';
import { Eye, EyeOff, Stethoscope, Loader2, Database, ShieldAlert } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [authCode, setAuthCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const profile = await storage.getProfile(email);
        if (profile) {
          onLogin(profile);
        } else {
          setError(
            !isSupabaseConfigured 
            ? 'Usuário não encontrado localmente. Tente criar uma conta.' 
            : 'Usuário não encontrado no banco de dados. Verifique o e-mail ou crie uma conta.'
          );
        }
      } else {
        const expectedCode = role === 'student' ? AUTH_CODES.STUDENT : AUTH_CODES.PROFESSOR;
        if (authCode !== expectedCode) {
          setError('Código de cadastro inválido para este perfil.');
          setLoading(false);
          return;
        }

        const newUser: UserProfile = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name,
          role,
          created_at: new Date().toISOString()
        };

        await storage.saveProfile(newUser);
        onLogin(newUser);
      }
    } catch (err) {
      console.error(err);
      setError('Erro crítico ao acessar o banco de dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-10 text-white text-center relative">
          <div className="flex justify-center mb-4">
            <Stethoscope size={56} className="text-blue-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tutor Oftalmologia</h1>
          <p className="text-blue-100 mt-1 text-sm font-medium">Plataforma de Casos Clínicos</p>
          
          {/* Indicador visual de modo de conexão */}
          <div className="absolute top-4 right-4">
            {isSupabaseConfigured ? (
              <div className="bg-emerald-500/20 text-emerald-100 p-1.5 rounded-full" title="Conectado ao Cloud">
                <Database size={14} />
              </div>
            ) : (
              <div className="bg-amber-500/20 text-amber-100 p-1.5 rounded-full" title="Modo Local Offline">
                <ShieldAlert size={14} />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 animate-fade-in flex gap-2 items-start">
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all ${
                    role === 'student' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 bg-white'
                  }`}
                >
                  ESTUDANTE
                </button>
                <button
                  type="button"
                  onClick={() => setRole('professor')}
                  className={`py-2 px-4 rounded-lg text-xs font-bold border transition-all ${
                    role === 'professor' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-500 bg-white'
                  }`}
                >
                  PROFESSOR
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Código de Segurança</label>
                <input
                  type="text"
                  required
                  placeholder={role === 'student' ? "Código 2026" : "Código 2317"}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">E-mail</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Senha</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-7 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>

          <p className="text-center text-sm text-slate-500 mt-4">
            {isLogin ? 'Novo por aqui?' : 'Já tem cadastro?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Crie uma conta' : 'Fazer login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Auth;
