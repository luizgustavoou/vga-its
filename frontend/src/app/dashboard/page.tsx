'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentStore } from '@/store/student-store';
import { studentApi, knowledgeApi } from '@/lib/api';
import { KnowledgeGraph, type KnowledgeNodeData } from '@/components/knowledge-graph';
import {
  Brain, BookOpen, Target, TrendingUp, MessageCircle,
  CheckCircle2, Clock, AlertTriangle, CircleDot, LogOut,
  ArrowRight
} from 'lucide-react';

interface Progress {
  student: { id: string; name: string; email: string };
  overallProgress: number;
  currentConcept: { id: string; label: string; mastery: number } | null;
  totalExercises: number;
  totalCorrect: number;
  successRate: number;
  concepts: {
    nodeId: string;
    label: string;
    category: string;
    masteryLevel: number;
    status: string;
    exercisesCount: number;
    correctCount: number;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { studentId, studentName, logout } = useStudentStore();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [nodes, setNodes] = useState<KnowledgeNodeData[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNodeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      router.push('/');
      return;
    }
    loadData();
  }, [studentId]);

  const loadData = async () => {
    try {
      const [progressRes, graphRes] = await Promise.all([
        studentApi.getProgress(studentId!),
        knowledgeApi.getStudentGraph(studentId!),
      ]);
      setProgress(progressRes.data);
      setNodes(graphRes.data);
    } catch {
      console.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered': return <CheckCircle2 className="w-5 h-5" />;
      case 'in_progress': return <Clock className="w-5 h-5" />;
      case 'struggling': return <AlertTriangle className="w-5 h-5" />;
      default: return <CircleDot className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'mastered': return 'Dominado';
      case 'in_progress': return 'Em progresso';
      case 'struggling': return 'Dificuldade';
      default: return 'Não iniciado';
    }
  };

  const getNodeStatusClass = (status: string) => {
    switch (status) {
      case 'mastered': return 'node-mastered';
      case 'in_progress': return 'node-in-progress';
      case 'struggling': return 'node-struggling';
      default: return 'node-not-started';
    }
  };

  const handleStartStudy = (nodeId: string) => {
    router.push(`/chat?nodeId=${nodeId}`);
  };

  const handleNodeClick = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    setSelectedNode(selectedNode?.id === nodeId ? null : node || null);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </main>
    );
  }

  const firstPendingNode = nodes.find(n => n.status !== 'mastered');

  return (
    <main className="min-h-screen p-4 md:p-8 w-full flex flex-col items-center">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Olá, {studentName}! 👋</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[
            { label: 'Progresso Geral', value: `${Math.round(progress?.overallProgress || 0)}%`, icon: TrendingUp, color: 'text-primary' },
            { label: 'Exercícios', value: progress?.totalExercises || 0, icon: BookOpen, color: 'text-accent' },
            { label: 'Acertos', value: progress?.totalCorrect || 0, icon: Target, color: 'text-success' },
            { label: 'Taxa de Sucesso', value: `${progress?.successRate || 0}%`, icon: CheckCircle2, color: 'text-warning' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 flex flex-col gap-3 relative overflow-hidden group animate-slide-up hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none"></div>
              <div className="flex justify-between items-center w-full">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <div className={`p-2.5 rounded-xl bg-muted/50 bg-opacity-10`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Knowledge Graph with React Flow */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 lg:p-8 animate-slide-up">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Brain className="w-5 h-5" />
                </div>
                Grafo de Conhecimento
              </h2>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4 text-xs">
                {[
                  { label: 'Dominado', cls: 'node-mastered' },
                  { label: 'Em progresso', cls: 'node-in-progress' },
                  { label: 'Dificuldade', cls: 'node-struggling' },
                  { label: 'Não iniciado', cls: 'node-not-started' },
                ].map((item) => (
                  <div key={item.label} className={`px-3 py-1 rounded-full border ${item.cls}`}>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* React Flow Graph */}
              <KnowledgeGraph nodes={nodes} onNodeClick={handleNodeClick} />

              {/* Selected node details */}
              {selectedNode && (
                <div className={`mt-4 p-5 rounded-xl border-2 animate-fade-in ${getNodeStatusClass(selectedNode.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(selectedNode.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold opacity-60">{selectedNode.id}</span>
                          <span className="font-semibold">{selectedNode.label}</span>
                        </div>
                        <p className="text-xs opacity-70">
                          {selectedNode.category === 'matrices' ? '📊 Matrizes' : '📐 Vetores'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{Math.round(selectedNode.masteryLevel)}%</span>
                      <p className="text-xs opacity-70">{getStatusLabel(selectedNode.status)}</p>
                    </div>
                  </div>
                  <p className="text-sm opacity-80 mb-3">{selectedNode.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-60">
                      {selectedNode.exercisesCount} exercícios • {selectedNode.correctCount} acertos
                    </span>
                    <button
                      onClick={() => handleStartStudy(selectedNode.id)}
                      className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-medium transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> Estudar
                    </button>
                  </div>
                  <div className="h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-current rounded-full transition-all duration-500"
                      style={{ width: `${selectedNode.masteryLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Concept */}
            {progress?.currentConcept && (
              <div className="glass-card p-6 md:p-8 flex flex-col gap-2 animate-slide-up relative overflow-hidden" style={{ animationDelay: '200ms' }}>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                <h3 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider mb-2">
                  <Target className="w-4 h-4" /> Conceito Atual
                </h3>
                <p className="text-xl font-extrabold">{progress.currentConcept.label}</p>
                
                <div className="flex justify-between items-end mt-4">
                  <span className="text-sm font-medium text-muted-foreground">Domínio Atual</span>
                  <span className="text-xl font-bold text-primary">{Math.round(progress.currentConcept.mastery)}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden my-4 shadow-inner">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress.currentConcept.mastery}%` }}
                  />
                </div>
                <button
                  onClick={() => handleStartStudy(progress.currentConcept!.id)}
                  className="w-full py-4 rounded-xl gradient-primary text-white font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 mt-4 text-base relative z-10"
                >
                  <MessageCircle className="w-5 h-5" />
                  Continuar Estudando
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick study */}
            {firstPendingNode && firstPendingNode.id !== progress?.currentConcept?.id && (
              <div className="glass-card p-6 md:p-8 animate-slide-up border-l-4 border-l-accent" style={{ animationDelay: '300ms' }}>
                <h3 className="text-xs font-bold text-accent flex items-center gap-2 uppercase tracking-wider mb-3">
                  <BookOpen className="w-4 h-4" /> Próximo Conceito
                </h3>
                <p className="text-lg font-bold mb-2">{firstPendingNode.label}</p>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">{firstPendingNode.description}</p>
                <button
                  onClick={() => handleStartStudy(firstPendingNode.id)}
                  className="w-full py-4 rounded-xl bg-accent/10 text-accent font-semibold transition-all duration-300 hover:bg-accent hover:text-white hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm"
                >
                  Começar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Progress overview */}
            <div className="glass-card p-6 md:p-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <h3 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider mb-5">
                <TrendingUp className="w-4 h-4" /> Resumo do Progresso
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-success/5 border border-success/10 transition-colors hover:bg-success/10">
                  <span className="text-sm font-medium text-foreground">Dominados</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-success">{nodes.filter(n => n.status === 'mastered').length}</span>
                    <span className="text-sm text-muted-foreground">/ {nodes.length}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-warning/5 border border-warning/10 transition-colors hover:bg-warning/10">
                  <span className="text-sm font-medium text-foreground">Em progresso</span>
                  <span className="text-xl font-bold text-warning">{nodes.filter(n => n.status === 'in_progress').length}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/10 transition-colors hover:bg-destructive/10">
                  <span className="text-sm font-medium text-foreground">Com dificuldade</span>
                  <span className="text-xl font-bold text-destructive">{nodes.filter(n => n.status === 'struggling').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
