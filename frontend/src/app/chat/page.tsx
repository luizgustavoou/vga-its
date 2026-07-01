'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudentStore } from '@/store/student-store';
import { chatApi, studentApi, knowledgeApi } from '@/lib/api';
import { MarkdownRenderer } from '@/components/markdown-renderer';
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

      // Create session — may throw 403 if prerequisites not met
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
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 403) {
        // Prerequisite gate — inform user and go back to dashboard
        alert(`🔒 Acesso bloqueado\n\n${message || 'Você precisa dominar os pré-requisitos antes de acessar este conceito.'}`);
        router.push('/dashboard');
        return;
      }

      console.error('Erro ao inicializar chat', err);
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
    <main className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="glass-card rounded-none border-x-0 border-t-0 px-3 py-3 md:px-4 md:py-4 shrink-0 w-full flex justify-center">
        <div className="w-full max-w-5xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
              aria-label="Voltar ao dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 rounded-xl gradient-primary shrink-0">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm truncate">Tutor de Álgebra Linear</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <BookOpen className="w-3 h-3 shrink-0" />
                <span className="truncate">{currentNode?.label || 'Carregando...'}</span>
              </p>
            </div>
          </div>
          {currentNode && (
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0 px-2 md:px-3 py-1.5 rounded-lg bg-primary/10">
              <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
              <span className="text-xs md:text-sm font-semibold text-primary">{Math.round(currentNode.masteryLevel)}%</span>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 w-full flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-3 md:space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`w-fit max-w-[90%] sm:max-w-[80%] md:max-w-[70%] px-4 py-3 md:px-5 rounded-2xl ${
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
                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} className="text-sm leading-relaxed" />
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in w-full">
              <div className="w-fit px-4 py-3 md:px-5 glass-card rounded-2xl rounded-bl-md">
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
      <div className="shrink-0 px-3 md:px-4 pb-2 w-full flex justify-center">
        <div className="w-full max-w-3xl flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={handleExplain}
            disabled={loading}
            className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-muted border border-border/50 text-xs md:text-sm font-medium text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" /> Explicar
          </button>
          <button
            onClick={handleExercise}
            disabled={loading}
            className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-muted border border-border/50 text-xs md:text-sm font-medium text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" /> Exercício
          </button>
          <button
            onClick={handleHint}
            disabled={loading}
            className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-muted border border-border/50 text-xs md:text-sm font-medium text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:-translate-y-0.5 flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Lightbulb className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" /> Dica
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 md:px-4 pb-4 md:pb-6 pt-2 w-full flex justify-center bg-background/80 backdrop-blur-md safe-area-bottom">
        <form onSubmit={handleSubmit} className="w-full max-w-3xl flex items-center gap-2 bg-muted/40 p-1.5 md:p-2 rounded-2xl border border-border/50 shadow-sm focus-within:border-primary/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2.5 md:px-4 md:py-3 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base min-w-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="shrink-0 p-3 md:p-3.5 rounded-xl gradient-primary text-white font-medium transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
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
