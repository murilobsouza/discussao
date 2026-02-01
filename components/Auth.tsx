
import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { storage } from '../storage';
import { AUTH_CODES } from '../constants';
import { Eye, EyeOff, Stethoscope, Loader2 } from 'lucide-react';

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
        // No Supabase real, usaríamos supabase.auth.signIn
        // Para este MVP com tabela 'profiles':
        const profile = await storage.getProfile(email);
        if (profile) {
          onLogin(profile);
        } else {
          setError('Usuário não encontrado ou credenciais inválidas.');
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
      setError('Erro de conexão com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-blue-600 p-10 text-white text-center">
          <div className="flex justify-center mb-4">
            <Stethoscope size={56} className="text-blue-100" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tutor Oftalmologia</h1>
          <p className="text-blue-100 mt-1 text-sm font-medium">Plataforma de Casos Clínicos</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100 animate-fade-in">
              {error}
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
