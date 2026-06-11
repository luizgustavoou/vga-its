'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentStore } from '@/store/student-store';
import { assessmentApi } from '@/lib/api';
import { BarChart3, ArrowRight, Trophy, TrendingUp, BookOpen } from 'lucide-react';

interface ConceptResult {
  nodeId: string;
  label: string;
  category: string;
  correct: number;
  total: number;
  mastery: number;
}

export default function ResultPage() {
  const router = useRouter();
  const { studentId, assessmentId } = useStudentStore();
  const [results, setResults] = useState<ConceptResult[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId || !assessmentId) {
      router.push('/');
      return;
    }
    loadResults();
  }, [studentId, assessmentId]);

  const loadResults = async () => {
    try {
      const res = await assessmentApi.getResult(assessmentId!);
      setResults(res.data.results);
      setOverallScore(res.data.overallScore);
      setStudentName(res.data.studentName);
    } catch {
      console.error('Erro ao carregar resultados');
    } finally {
      setLoading(false);
    }
  };

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return 'text-success';
    if (mastery >= 40) return 'text-warning';
    if (mastery > 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getMasteryBg = (mastery: number) => {
    if (mastery >= 80) return 'bg-success';
    if (mastery >= 40) return 'bg-warning';
    if (mastery > 0) return 'bg-destructive';
    return 'bg-muted-foreground';
  };

  const getMasteryLabel = (mastery: number) => {
    if (mastery >= 80) return 'Dominado';
    if (mastery >= 40) return 'Em progresso';
    if (mastery > 0) return 'Dificuldade';
    return 'Não avaliado';
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Calculando seus resultados...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Resultado da Avaliação</h1>
          <p className="text-muted-foreground">Olá, {studentName}! Veja seu desempenho em cada conceito.</p>
        </div>

        {/* Overall Score */}
        <div className="glass-card p-6 mb-6 animate-slide-up flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
              <circle
                cx="50" cy="50" r="40" fill="none" strokeWidth="8"
                stroke="url(#gradient)"
                strokeDasharray={`${overallScore * 2.51} 251`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{overallScore}%</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Pontuação Geral
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Baseado no seu desempenho em {results.length} conceitos de Álgebra Linear.
            </p>
          </div>
        </div>

        {/* Results per concept */}
        <div className="space-y-3">
          {results.map((result, i) => (
            <div
              key={result.nodeId}
              className="glass-card p-5 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold">
                    {result.nodeId}
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">{result.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {result.category === 'matrices' ? 'Matrizes' : 'Vetores'} • {result.correct}/{result.total} acertos
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${getMasteryColor(result.mastery)}`}>
                    {result.mastery}%
                  </span>
                  <p className={`text-xs ${getMasteryColor(result.mastery)}`}>
                    {getMasteryLabel(result.mastery)}
                  </p>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getMasteryBg(result.mastery)}`}
                  style={{ width: `${result.mastery}%`, animationDelay: `${i * 100}ms` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center animate-fade-in">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 flex items-center gap-2 mx-auto"
          >
            <BarChart3 className="w-5 h-5" />
            Ir para o Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}
