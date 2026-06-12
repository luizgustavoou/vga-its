'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentStore } from '@/store/student-store';
import { assessmentApi } from '@/lib/api';
import { CheckCircle2, XCircle, ArrowRight, Brain, BookOpen } from 'lucide-react';

interface Question {
  id: string;
  nodeId: string;
  conceptLabel: string;
  questionText: string;
  options: string[];
  difficulty: number;
}

export default function AssessmentPage() {
  const router = useRouter();
  const { studentId, setAssessmentId } = useStudentStore();
  const [assessmentId, setLocalAssessmentId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctAnswer: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      router.push('/');
      return;
    }
    startAssessment();
  }, [studentId]);

  const startAssessment = async () => {
    try {
      const res = await assessmentApi.start(studentId!);
      setLocalAssessmentId(res.data.id);
      setAssessmentId(res.data.id);
      setCurrentQuestion(res.data.currentQuestion);
      setTotalQuestions(res.data.totalQuestions);
      setAnsweredCount(res.data.answeredCount);

      if (!res.data.currentQuestion && res.data.status === 'completed') {
        router.push('/result');
      }
    } catch {
      console.error('Erro ao iniciar avaliação');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!assessmentId || !currentQuestion || !selectedAnswer) return;

    try {
      setLoading(true);
      const res = await assessmentApi.answer(assessmentId, currentQuestion.id, selectedAnswer);
      setFeedback({ isCorrect: res.data.isCorrect, correctAnswer: res.data.correctAnswer });
    } catch {
      console.error('Erro ao responder');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setFeedback(null);
    setSelectedAnswer(null);

    try {
      setLoading(true);
      const res = await assessmentApi.getById(assessmentId!);

      if (!res.data.currentQuestion) {
        // All questions answered, finish assessment
        await assessmentApi.finish(assessmentId!);
        router.push('/result');
        return;
      }

      setCurrentQuestion(res.data.currentQuestion);
      setTotalQuestions(res.data.totalQuestions);
      setAnsweredCount(res.data.answeredCount);
    } catch {
      console.error('Erro ao buscar próxima questão');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Preparando avaliação diagnóstica...</p>
        </div>
      </main>
    );
  }

  const progress = totalQuestions > 0 ? ((answeredCount + (feedback ? 1 : 0)) / totalQuestions) * 100 : 0;

  return (
    <main className="min-h-screen p-4 md:p-8 w-full flex flex-col items-center">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="p-2 rounded-xl gradient-primary">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Avaliação Diagnóstica</h1>
            <p className="text-sm text-muted-foreground">Vamos avaliar seu conhecimento em Álgebra Linear</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass-card p-4 mb-6 animate-fade-in">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso</span>
            <span className="text-primary font-semibold">{answeredCount + (feedback ? 1 : 0)} de {totalQuestions}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="glass-card p-6 md:p-8 animate-slide-up">
            {/* Concept badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                <BookOpen className="w-3 h-3 inline mr-1" />
                {currentQuestion.conceptLabel}
              </span>
              <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                Dificuldade: {'⭐'.repeat(currentQuestion.difficulty)}
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-lg md:text-xl font-semibold mb-6 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, i) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = selectedAnswer === option;
                const showCorrect = feedback && option === feedback.correctAnswer;
                const showWrong = feedback && isSelected && !feedback.isCorrect;

                return (
                  <button
                    key={i}
                    onClick={() => !feedback && setSelectedAnswer(option)}
                    disabled={!!feedback}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3
                      ${showCorrect
                        ? 'border-success bg-success/10 text-success'
                        : showWrong
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                      }
                      ${feedback ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                      ${showCorrect ? 'bg-success/20' : showWrong ? 'bg-destructive/20' : isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
                      {showCorrect ? <CheckCircle2 className="w-5 h-5" /> : showWrong ? <XCircle className="w-5 h-5" /> : letter}
                    </span>
                    <span className="pt-1 text-sm md:text-base">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback message */}
            {feedback && (
              <div className={`p-4 rounded-xl mb-4 animate-fade-in ${feedback.isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                <p className={`font-semibold ${feedback.isCorrect ? 'text-success' : 'text-destructive'}`}>
                  {feedback.isCorrect ? '✅ Correto! Muito bem!' : '❌ Incorreto.'}
                </p>
                {!feedback.isCorrect && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Resposta correta: <strong className="text-foreground">{feedback.correctAnswer}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end">
              {!feedback ? (
                <button
                  onClick={handleAnswer}
                  disabled={!selectedAnswer || loading}
                  className="px-8 py-4 rounded-xl gradient-primary text-white font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 text-base"
                >
                  Confirmar Resposta
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="px-8 py-4 rounded-xl gradient-primary text-white font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 text-base"
                >
                  {answeredCount + 1 >= totalQuestions ? 'Ver Resultado' : 'Próxima Questão'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
