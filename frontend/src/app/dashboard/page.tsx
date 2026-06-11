'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentStore } from '@/store/student-store';
import { studentApi, knowledgeApi } from '@/lib/api';
import {
  Brain, BookOpen, Target, TrendingUp, MessageCircle,
  CheckCircle2, Clock, AlertTriangle, CircleDot, LogOut,
  ArrowRight
} from 'lucide-react';

interface KnowledgeNode {
  id: string;
  label: string;
  description: string;
  order: number;
  category: string;
  prerequisites: string[];
  masteryLevel: number;
  status: string;
  exercisesCount: number;
  correctCount: number;
}

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
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
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

  const getNodeStatusClass = (status: string) => {
    switch (status) {
      case 'mastered': return 'node-mastered';
      case 'in_progress': return 'node-in-progress';
      case 'struggling': return 'node-struggling';
      default: return 'node-not-started';
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

  const handleStartStudy = (nodeId: string) => {
    router.push(`/chat?nodeId=${nodeId}`);
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
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Progresso Geral', value: `${Math.round(progress?.overallProgress || 0)}%`, icon: TrendingUp, color: 'text-primary' },
            { label: 'Exercícios', value: progress?.totalExercises || 0, icon: BookOpen, color: 'text-accent' },
            { label: 'Acertos', value: progress?.totalCorrect || 0, icon: Target, color: 'text-success' },
            { label: 'Taxa de Sucesso', value: `${progress?.successRate || 0}%`, icon: CheckCircle2, color: 'text-warning' },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Knowledge Graph */}
          <div className="md:col-span-2">
            <div className="glass-card p-6 animate-slide-up">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Grafo de Conhecimento
              </h2>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-6 text-xs">
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

              {/* Graph nodes */}
              <div className="space-y-2">
                {nodes.map((node, i) => (
                  <div key={node.id} className="flex items-center gap-2" style={{ animationDelay: `${i * 50}ms` }}>
                    {/* Connector line */}
                    {i > 0 && (
                      <div className="w-8 flex justify-center -mt-2 -mb-2">
                        <div className="w-0.5 h-4 bg-border" />
                      </div>
                    )}
                    {i > 0 && <div className="w-0" />}
                  </div>
                ))}

                {nodes.map((node, i) => (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${getNodeStatusClass(node.status)} hover:scale-[1.01]`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(node.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold opacity-60">{node.id}</span>
                            <span className="font-semibold text-sm">{node.label}</span>
                          </div>
                          <p className="text-xs opacity-70 mt-0.5">
                            {node.category === 'matrices' ? '📊 Matrizes' : '📐 Vetores'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{Math.round(node.masteryLevel)}%</span>
                        <p className="text-xs opacity-70">{getStatusLabel(node.status)}</p>
                      </div>
                    </div>

                    {/* Expanded info */}
                    {selectedNode?.id === node.id && (
                      <div className="mt-4 pt-4 border-t border-current/20 animate-fade-in">
                        <p className="text-sm opacity-80 mb-3">{node.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs opacity-60">
                            {node.exercisesCount} exercícios • {node.correctCount} acertos
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartStudy(node.id); }}
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                          >
                            <MessageCircle className="w-4 h-4" /> Estudar
                          </button>
                        </div>
                        {/* Mastery bar */}
                        <div className="h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-current rounded-full transition-all duration-500"
                            style={{ width: `${node.masteryLevel}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Connector */}
                    {i < nodes.length - 1 && (
                      <div className="flex justify-center mt-2">
                        <div className="w-0.5 h-3 bg-current/30 rounded" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Concept */}
            {progress?.currentConcept && (
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Conceito Atual
                </h3>
                <p className="text-lg font-bold mb-1">{progress.currentConcept.label}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Domínio: {Math.round(progress.currentConcept.mastery)}%
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full gradient-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress.currentConcept.mastery}%` }}
                  />
                </div>
                <button
                  onClick={() => handleStartStudy(progress.currentConcept!.id)}
                  className="w-full py-3 rounded-xl gradient-primary text-white font-semibold transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Continuar Estudando
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick study */}
            {firstPendingNode && firstPendingNode.id !== progress?.currentConcept?.id && (
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">📚 Próximo Conceito</h3>
                <p className="font-semibold mb-1">{firstPendingNode.label}</p>
                <p className="text-xs text-muted-foreground mb-3">{firstPendingNode.description}</p>
                <button
                  onClick={() => handleStartStudy(firstPendingNode.id)}
                  className="w-full py-2.5 rounded-xl bg-muted text-foreground font-medium transition-all hover:bg-muted/80 flex items-center justify-center gap-2 text-sm"
                >
                  Começar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Progress overview */}
            <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">📈 Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Conceitos dominados</span>
                  <span className="font-semibold text-success">
                    {nodes.filter(n => n.status === 'mastered').length}/{nodes.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Em progresso</span>
                  <span className="font-semibold text-warning">
                    {nodes.filter(n => n.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Com dificuldade</span>
                  <span className="font-semibold text-destructive">
                    {nodes.filter(n => n.status === 'struggling').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
