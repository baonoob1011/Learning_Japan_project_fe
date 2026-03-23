"use client";
import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Lightbulb,
  BookOpen,
  RefreshCw,
  Trophy,
  Zap
} from "lucide-react";
import { vocabPracticeService, VocabPracticeQuestion } from "@/services/vocabPracticeService";

interface AIPracticeProps {
  isDark: boolean;
}

const AIPractice: React.FC<AIPracticeProps> = ({ isDark }) => {
  const [questions, setQuestions] = useState<VocabPracticeQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [answeredState, setAnsweredState] = useState<Record<string, { selected: string; correct: boolean }>>({});

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      const data = await vocabPracticeService.getExercises();
      if (data && Array.isArray(data)) {
        setQuestions(data);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error("Failed to load questions", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleOptionClick = (questionId: string, option: string, correctAnswer: string) => {
    if (answeredState[questionId]) return;

    setAnsweredState(prev => ({
      ...prev,
      [questionId]: {
        selected: option,
        correct: option === correctAnswer
      }
    }));
  };

  const correctCount = Object.values(answeredState).filter(s => s.correct).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-700">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-cyan-500 relative z-10" />
        </div>
        <p className={`mt-6 font-medium tracking-wide ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Đang chuẩn bị bài tập cá nhân hóa...
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4 animate-in zoom-in-95 duration-500">
        <div className={`p-6 rounded-full mb-6 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <BookOpen className={`w-12 h-12 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
        </div>
        <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}>
          Chưa có bài tập nào
        </h3>
        <p className={`max-w-md mx-auto mb-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Hệ thống AI chưa tạo bài tập cho bạn. Hãy lưu thêm từ vựng mới để AI có thể tạo nội dung luyện tập nhé!
        </p>
        <button
          onClick={() => loadQuestions(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full px-8 py-3 h-auto font-bold shadow-lg shadow-cyan-500/20 flex items-center transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Stats Header */}
      <div className={`sticky top-0 z-20 mb-10 p-6 rounded-[2rem] border backdrop-blur-md shadow-2xl transition-all duration-500 ${isDark
        ? "bg-gray-900/80 border-gray-700/50 shadow-black/40"
        : "bg-white/80 border-cyan-100/50 shadow-cyan-100/30"
        }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? "bg-cyan-500/10" : "bg-cyan-50"}`}>
              <Zap className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-800"}`}>
                Luyện tập thông minh
              </h2>
              <p className={`text-xs font-medium uppercase tracking-[0.2em] ${isDark ? "text-cyan-400/60" : "text-cyan-500/60"}`}>
                Personalized AI Learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex flex-col items-center px-6 py-2 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>Hoàn thành</span>
              <span className={`text-lg font-black ${isDark ? "text-white" : "text-gray-800"}`}>
                {Object.keys(answeredState).length}/{questions.length}
              </span>
            </div>

            <div className={`flex flex-col items-center px-6 py-2 rounded-2xl border ${isDark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100"}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest text-emerald-500`}>Chính xác</span>
              <span className="text-lg font-black text-emerald-500">
                {correctCount}
              </span>
            </div>

            <button
              onClick={() => loadQuestions(true)}
              disabled={isRefreshing}
              className={`rounded-2xl h-14 w-14 flex items-center justify-center border-2 transition-all duration-300 active:scale-95 ${isDark ? "border-gray-700 hover:bg-gray-800" : "border-gray-100 hover:bg-gray-50"}`}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin text-cyan-500" : isDark ? "text-gray-400" : "text-gray-500"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {questions.map((q, index) => {
          const state = answeredState[q.id];
          const isAnswered = !!state;

          return (
            <div
              key={q.id}
              className={`group relative p-10 rounded-[3rem] border transition-all duration-700 ${isDark
                ? "bg-gray-800/40 border-gray-700 hover:bg-gray-800 shadow-xl shadow-black/20"
                : "bg-white border-gray-100 hover:shadow-2xl hover:shadow-cyan-100/40"
                }`}
            >
              {/* Background gradient effect */}
              <div className={`absolute -inset-1 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-xl -z-10 ${isDark ? "bg-cyan-500/5" : "bg-cyan-500/10"}`}></div>

              <div className="space-y-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${isDark ? "bg-gray-900 text-cyan-400" : "bg-gray-50 text-cyan-600"
                        }`}>
                        Thử thách {index + 1}
                      </span>
                      {q.vocab && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold ${isDark ? "border-gray-700 text-gray-400" : "border-gray-100 text-gray-500"}`}>
                          <BookOpen size={10} />
                          <span>{q.vocab.surface}</span>
                        </div>
                      )}
                    </div>
                    <h3 className={`text-2xl font-bold leading-snug tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                      {q.questionText}
                    </h3>
                  </div>
                  <div className={`p-4 rounded-3xl ${isDark ? "bg-gray-900/50" : "bg-gray-50"}`}>
                    <Sparkles className={`w-6 h-6 ${isDark ? "text-cyan-500/50" : "text-cyan-500/30"}`} />
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map((option, idx) => {
                    const isSelected = state?.selected === option;
                    const isCorrect = option === q.correctAnswer;
                    const isWrong = isSelected && !state?.correct;

                    let bgClass = isDark ? "bg-gray-900/40 border-gray-700/50" : "bg-gray-50/40 border-gray-100";
                    let textClass = isDark ? "text-gray-400" : "text-gray-600";
                    let ringClass = "border-transparent";

                    if (isAnswered) {
                      if (isCorrect) {
                        bgClass = isDark ? "bg-emerald-500/10 border-emerald-500/30" : "bg-emerald-50 border-emerald-200";
                        textClass = "text-emerald-500";
                        ringClass = "ring-4 ring-emerald-500/10";
                      } else if (isWrong) {
                        bgClass = isDark ? "bg-red-500/10 border-red-500/30" : "bg-red-50 border-red-200";
                        textClass = "text-red-500";
                        ringClass = "ring-4 ring-red-500/10";
                      } else {
                        bgClass = isDark ? "bg-gray-900/20 border-gray-800 opacity-40" : "bg-gray-50/20 border-gray-50 opacity-40";
                      }
                    } else {
                      bgClass += " hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:-translate-y-1";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(q.id, option, q.correctAnswer)}
                        disabled={isAnswered}
                        className={`group/opt relative flex items-center justify-between px-8 py-5 rounded-[2rem] border-2 transition-all duration-500 font-bold text-base text-left ${bgClass} ${textClass} ${ringClass}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs transition-colors duration-500 ${isAnswered ? "hidden" : isDark ? "bg-gray-800 text-gray-500 group-hover/opt:bg-cyan-500 group-hover/opt:text-white" : "bg-white text-gray-400 group-hover/opt:bg-cyan-500 group-hover/opt:text-white shadow-sm"}`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isAnswered && isCorrect && (
                          <div className="p-1.5 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-in zoom-in duration-300">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                        {isAnswered && isWrong && (
                          <div className="p-1.5 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 animate-in zoom-in duration-300">
                            <XCircle size={16} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isAnswered && (
                  <div className={`mt-6 p-8 rounded-[2.5rem] border animate-in fade-in slide-in-from-top-4 duration-700 shadow-inner ${isDark ? "bg-gray-900 border-gray-700/50 shadow-black/20" : "bg-indigo-50/30 border-indigo-100 shadow-indigo-100/10"
                    }`}>
                    <div className="flex gap-6">
                      <div className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl ${isDark ? "bg-cyan-500/10" : "bg-white shadow-sm"}`}>
                        <Lightbulb className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <p className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
                            Giải thích chi tiết
                          </p>
                        </div>
                        <p className={`text-base leading-relaxed font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIPractice;
