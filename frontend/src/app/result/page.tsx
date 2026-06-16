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
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8 w-full flex flex-col items-center">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl gradient-primary mb-4">
            <Trophy className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Resultado da Avaliação</h1>
          <p className="text-sm md:text-base text-muted-foreground">Olá, {studentName}! Veja seu desempenho em cada conceito.</p>
        </div>

        {/* Overall Score */}
        <div className="glass-card p-5 md:p-6 mb-4 md:mb-6 animate-slide-up flex flex-col sm:flex-row items-center gap-4 md:gap-6">
          <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0">
            <svg className="w-20 h-20 md:w-24 md:h-24 transform -rotate-90" viewBox="0 0 100 100">
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
              <span className="text-xl md:text-2xl font-bold">{overallScore}%</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg md:text-xl font-semibold flex items-center justify-center sm:justify-start gap-2">
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
              className="glass-card p-4 md:p-5 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-start sm:items-center gap-2 md:gap-3 min-w-0">
                  <span className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {result.nodeId}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm md:text-base truncate">{result.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {result.category === 'matrices' ? 'Matrizes' : 'Vetores'} • {result.correct}/{result.total} acertos
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-base md:text-lg font-bold ${getMasteryColor(result.mastery)}`}>
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
        <div className="mt-6 md:mt-8 text-center animate-fade-in">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-xl gradient-primary text-white font-semibold text-base md:text-lg transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 mx-auto"
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
