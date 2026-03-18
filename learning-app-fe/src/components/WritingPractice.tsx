"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Keyboard, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  Eye, 
  EyeOff,
  Trophy,
  Loader2,
  AlertCircle
} from "lucide-react";
import { vocabService, VocabResponse } from "@/services/vocabService";

interface WritingPracticeProps {
  isDark: boolean;
}

const WritingPractice: React.FC<WritingPracticeProps> = ({ isDark }) => {
  const [vocabs, setVocabs] = useState<VocabResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "WRONG">("IDLE");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVocabs();
  }, []);

  const loadVocabs = async () => {
    try {
      setIsLoading(true);
      const data = await vocabService.getMyVocabs();
      // Shuffle vocabs
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setVocabs(shuffled);
    } catch (err) {
      console.error("Failed to load vocabs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentVocab = vocabs[currentIndex];

  const handleCheck = () => {
    if (!currentVocab || !userInput.trim()) return;

    const isMatch = userInput.trim() === currentVocab.surface || 
                   userInput.trim() === currentVocab.reading;

    if (isMatch) {
      setStatus("SUCCESS");
      setScore(prev => prev + 1);
      setShowAnswer(true);
      // Auto move to next after 1.5s
      setTimeout(() => {
        handleNext();
      }, 1500);
    } else {
      setStatus("WRONG");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput("");
      setStatus("IDLE");
      setShowAnswer(false);
      inputRef.current?.focus();
    } else {
      // Finished all
      setStatus("IDLE");
      alert(`Chúc mừng! Bạn đã hoàn thành bài tập viết với điểm số ${score}/${vocabs.length}`);
      handleReset();
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setUserInput("");
    setStatus("IDLE");
    setShowAnswer(false);
    setScore(0);
    loadVocabs();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>Đang chuẩn bị bài tập viết...</p>
      </div>
    );
  }

  if (vocabs.length === 0) {
    return (
      <div className="text-center py-20 opacity-50">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>Bạn chưa có từ vựng nào để luyện viết.</p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / vocabs.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Progress Header */}
      <div className="mb-10 space-y-4">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
          <span className={isDark ? "text-gray-500" : "text-gray-400"}>
            Tiến trình: {currentIndex + 1} / {vocabs.length}
          </span>
          <span className="flex items-center gap-1.5 text-cyan-500">
            <Trophy className="w-4 h-4" />
            Điểm: {score}
          </span>
        </div>
        <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Practice Card */}
      <div 
        className={`relative overflow-hidden p-10 rounded-[3rem] border transition-all duration-500 ${
          shake ? "animate-shake" : ""
        } ${
          isDark 
            ? "bg-gray-800/40 border-gray-700 shadow-2xl shadow-black/50" 
            : "bg-white border-gray-100 shadow-2xl shadow-cyan-100/50"
        }`}
      >
        <div className="space-y-8 text-center">
          {/* Meaning Prompt */}
          <div className="space-y-3">
            <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Dịch sang tiếng Nhật
            </span>
            <h2 className={`text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              {currentVocab.translated}
            </h2>
            {currentVocab.partOfSpeech && (
              <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"
              }`}>
                {currentVocab.partOfSpeech}
              </span>
            )}
          </div>

          {/* Input Section */}
          <div className="space-y-6">
            <div className="relative group">
              <input
                ref={inputRef}
                type="text"
                autoFocus
                placeholder="Nhập từ vựng..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    status === "SUCCESS" ? handleNext() : handleCheck();
                  }
                }}
                className={`w-full px-8 py-6 rounded-[2rem] text-2xl font-bold text-center outline-none transition-all duration-300 border-2 ${
                  status === "SUCCESS"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                    : status === "WRONG"
                    ? "bg-red-500/10 border-red-500 text-red-500"
                    : isDark
                    ? "bg-gray-900/50 border-gray-700 text-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                    : "bg-white border-gray-200 text-gray-900 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                }`}
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20">
                <Keyboard className="w-6 h-6" />
              </div>
            </div>

            {/* Hint/Answer */}
            <div className={`min-h-[24px] transition-all duration-300 ${showAnswer ? "opacity-100" : "opacity-0"}`}>
              <div className="flex flex-col items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  Đáp án đúng
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-cyan-500">{currentVocab.surface}</span>
                  <span className={`text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    ({currentVocab.reading})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                isDark 
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {showAnswer ? <EyeOff size={18} /> : <Eye size={18} />}
              {showAnswer ? "Ẩn đáp án" : "Xem đáp án"}
            </button>
            
            <button
              onClick={status === "SUCCESS" ? handleNext : handleCheck}
              className={`flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-lg active:scale-95 ${
                status === "SUCCESS"
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                  : "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20"
              }`}
            >
              {status === "SUCCESS" ? (
                <>
                  <span>Tiếp tục</span>
                  <ChevronRight size={18} />
                </>
              ) : (
                <>
                  <span>Kiểm tra</span>
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Tools */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleReset}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
            isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <RotateCcw size={14} />
          Luyện tập lại
        </button>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default WritingPractice;
