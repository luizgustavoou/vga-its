'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentStore } from '@/store/student-store';
import { studentApi } from '@/lib/api';
import { BookOpen, LogIn, UserPlus, Brain, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setStudent } = useStudentStore();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await studentApi.login({ email, password });
        setStudent(res.data.id, res.data.name, res.data.email);
      } else {
        const res = await studentApi.create({ name, email, password });
        setStudent(res.data.id, res.data.name, res.data.email);
      }
      router.push('/assessment');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 animate-pulse-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            VGA-<span className="text-primary">ITS</span>
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            Sistema Tutor Inteligente para Álgebra Linear
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Toggle */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                ${isLogin ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
                ${!isLogin ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <UserPlus className="w-4 h-4" /> Cadastrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg gradient-primary text-white font-semibold transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <BookOpen className="w-5 h-5" />
                  {isLogin ? 'Entrar' : 'Cadastrar e Iniciar'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          IA Aplicada à Educação • UFRN/IMD
        </p>
      </div>
    </main>
  );
}
