'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudentStore } from '@/store/student-store';
import { chatApi, studentApi, knowledgeApi } from '@/lib/api';
import {
  Brain, Send, ArrowLeft, Lightbulb, BookOpen,
  MessageCircle, Loader2, TrendingUp
} from 'lucide-react';

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface NodeInfo {
  id: string;
  label: string;
  masteryLevel: number;
  status: string;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { studentId, studentName, currentSessionId, setCurrentSessionId } = useStudentStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [currentNode, setCurrentNode] = useState<NodeInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nodeId = searchParams.get('nodeId');

  useEffect(() => {
    if (!studentId) {
      router.push('/');
      return;
    }
    initializeChat();
  }, [studentId, nodeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      if (!nodeId) {
        router.push('/dashboard');
        return;
      }

      // Get node info
      const graphRes = await knowledgeApi.getStudentGraph(studentId!);
      const node = graphRes.data.find((n: NodeInfo) => n.id === nodeId);
      if (node) setCurrentNode(node);

      // Create session
      const sessionRes = await chatApi.createSession(studentId!, nodeId);
      setCurrentSessionId(sessionRes.data.sessionId);

      if (sessionRes.data.messages && sessionRes.data.messages.length > 0) {
        setMessages(sessionRes.data.messages.map((m: any) => ({
          id: m.id || m._id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt || new Date().toISOString(),
        })));
      } else if (sessionRes.data.greeting) {
        setMessages([
          {
            id: 'greeting',
            role: 'assistant',
            content: sessionRes.data.greeting,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      console.error('Erro ao inicializar chat');
    } finally {
      setInitializing(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!currentSessionId || !content.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatApi.sendMessage(currentSessionId, content);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: res.data.content,
          createdAt: new Date().toISOString(),
        },
      ]);
      
      if (res.data.updatedMastery !== undefined && currentNode) {
        setCurrentNode({ ...currentNode, masteryLevel: res.data.updatedMastery });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '❌ Erro ao processar sua mensagem. Tente novamente.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleHint = () => {
    sendMessage('Pode me dar uma dica sobre esse conceito?');
  };

  const handleExercise = () => {
    sendMessage('Crie um exercício sobre esse conceito para eu praticar.');
  };

  const handleExplain = () => {
    sendMessage('Pode me explicar esse conceito de forma simples?');
  };

  const handleCorrectAnswer = async () => {
    if (!studentId || !nodeId) return;
    try {
      const res = await studentApi.updateMastery(studentId, nodeId, 'correct');
      if (currentNode && res.data.masteryLevel !== undefined) {
        setCurrentNode({ ...currentNode, masteryLevel: res.data.masteryLevel });
      }
      sendMessage('Acertei o exercício! ✅');
    } catch {
      console.error('Erro ao atualizar mastery');
    }
  };

  const handleWrongAnswer = async () => {
    if (!studentId || !nodeId) return;
    try {
      const res = await studentApi.updateMastery(studentId, nodeId, 'incorrect');
      if (currentNode && res.data.masteryLevel !== undefined) {
        setCurrentNode({ ...currentNode, masteryLevel: res.data.masteryLevel });
      }
      sendMessage('Errei o exercício. Pode me ajudar a entender?');
    } catch {
      console.error('Erro ao atualizar mastery');
    }
  };

  if (initializing) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Iniciando sessão com o tutor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 p-4 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 rounded-xl gradient-primary">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Tutor de Álgebra Linear</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {currentNode?.label || 'Carregando...'}
              </p>
            </div>
          </div>
          {currentNode && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">{Math.round(currentNode.masteryLevel)}%</span>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'gradient-primary text-white rounded-br-md'
                    : 'glass-card rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-primary font-medium">
                    <Brain className="w-3 h-3" /> Tutor IA
                  </div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-card p-4 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Tutor está pensando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="shrink-0 px-4 pb-2">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
          <button onClick={handleExplain} className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Explicar conceito
          </button>
          <button onClick={handleExercise} className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> Criar exercício
          </button>
          <button onClick={handleHint} className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Pedir dica
          </button>
          <button onClick={handleCorrectAnswer} className="px-3 py-1.5 rounded-full bg-success/10 text-xs font-medium text-success hover:bg-success/20 transition-colors">
            ✅ Acertei
          </button>
          <button onClick={handleWrongAnswer} className="px-3 py-1.5 rounded-full bg-destructive/10 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors">
            ❌ Errei
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 p-4 glass-card rounded-none border-x-0 border-b-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl gradient-primary text-white font-medium transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando chat...</p>
        </div>
      </main>
    }>
      <ChatContent />
    </Suspense>
  );
}
