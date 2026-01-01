"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Check,
  X,
  Play,
  Pause,
} from "lucide-react";

// TranscriptDTO interface
interface TranscriptDTO {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  createdAt: string;
}

interface YoutubePlayerHandle {
  playSegment: (start: number, end: number) => void;
  stopSegment: () => void;
}

interface DictationPracticeProps {
  transcripts: TranscriptDTO[];
  videoId: string;
  playerRef: React.RefObject<YoutubePlayerHandle | null>;
}

export default function DictationPractice({
  transcripts,
  videoId,
  playerRef,
}: DictationPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [revealedChars, setRevealedChars] = useState<Set<number>>(new Set());
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState<boolean[]>(
    new Array(transcripts.length).fill(false)
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTranscript = transcripts[currentIndex];
  const totalQuestions = transcripts.length;

  /** ======================
   * HANDLE SEGMENT END - Tự động chuyển về nút "Phát lại"
   ====================== */
  const handleSegmentEnd = () => {
    console.log("=== Segment ended - switching back to Play button ===");
    setIsPlaying(false);
  };

  /** ======================
   * PLAY SEGMENT - Call YouTube component method
   ====================== */
  const handlePlaySegment = () => {
    console.log("=== handlePlaySegment called ===");
    console.log("playerRef.current:", playerRef.current);
    console.log("currentTranscript:", currentTranscript);

    if (!playerRef.current || !currentTranscript) {
      console.error("Missing playerRef or currentTranscript!");
      return;
    }

    console.log("Calling playSegment with:", {
      start: currentTranscript.startOffset,
      end: currentTranscript.endOffset,
    });

    setIsPlaying(true);

    playerRef.current.playSegment(
      currentTranscript.startOffset,
      currentTranscript.endOffset
    );
  };

  /** ======================
   * STOP PLAYBACK - Call YouTube component method
   ====================== */
  const stopPlayback = () => {
    if (playerRef.current) {
      playerRef.current.stopSegment();
    }
    setIsPlaying(false);
  };

  /** ======================
   * CLEANUP on unmount or transcript change
   ====================== */
  useEffect(() => {
    // Cleanup when switching questions
    return () => {
      if (playerRef.current) {
        playerRef.current.stopSegment();
      }
      setIsPlaying(false);
    };
  }, [currentIndex]);

  /** ======================
   * SETUP CALLBACK for segment end
   ====================== */
  useEffect(() => {
    console.log(
      "🔧 Setting up callback, playerRef.current:",
      playerRef.current
    );

    // Gán callback vào playerRef để YoutubePlayer có thể gọi
    if (playerRef.current) {
      const player = playerRef.current as YoutubePlayerHandle & {
        onDictationSegmentEnd?: () => void;
      };
      player.onDictationSegmentEnd = handleSegmentEnd;
      console.log("✅ Callback assigned successfully!");
    } else {
      console.log("❌ playerRef.current is null!");
    }

    return () => {
      // Cleanup
      if (playerRef.current) {
        const player = playerRef.current as YoutubePlayerHandle & {
          onDictationSegmentEnd?: () => void;
        };
        player.onDictationSegmentEnd = undefined;
      }
    };
  }, []);

  /** ======================
   * HELPER FUNCTIONS
   ====================== */

  // Normalize text: loại bỏ dấu câu và khoảng trắng thừa để so sánh
  const normalizeText = (text: string) => {
    return text
      .replace(/[\s、。！？「」『』（）.,!?;:'"()\[\]{}]/g, "") // Loại bỏ tất cả dấu câu
      .toLowerCase()
      .trim();
  };

  const maskText = (text: string, revealed: Set<number>) =>
    text.split("").map((char, idx) => {
      const isPunctuation = /[\s、。！？「」『』（）.,!?;:'"()\[\]{}]/.test(
        char
      );
      const isRevealed = revealed.has(idx) || isPunctuation;

      return (
        <span
          key={idx}
          onClick={() => {
            if (!isRevealed && !showAnswer) {
              setRevealedChars(new Set([...revealedChars, idx]));
            }
          }}
          className={`inline-block transition-all duration-200 ${
            !isRevealed && !showAnswer
              ? "cursor-pointer hover:bg-gradient-to-br hover:from-yellow-100 hover:to-amber-100 hover:scale-125 hover:shadow-lg rounded-lg px-1 mx-0.5 hover:-translate-y-0.5"
              : ""
          }`}
          style={{ minWidth: char === " " ? "0.5em" : "auto" }}
        >
          {isRevealed ? (
            char
          ) : (
            <span className="inline-flex items-center justify-center w-3 h-3 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-full shadow-md hover:shadow-xl hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400 transition-all duration-300 animate-pulse"></span>
          )}
        </span>
      );
    });

  const revealHint = () => {
    // Hiện tất cả chữ cái, giữ lại dấu câu luôn hiện
    const text = currentTranscript.text;
    const allIndices = new Set(
      text
        .split("")
        .map((_, i) => i)
        .filter(
          (i) => !/[\s、。！？「」『』（）.,!?;:'"()\[\]{}]/.test(text[i])
        )
    );
    setRevealedChars(allIndices);
  };

  const checkAnswer = () => {
    const normalizedInput = normalizeText(userInput);
    const normalizedAnswer = normalizeText(currentTranscript.text);

    const isCorrect = normalizedInput === normalizedAnswer;
    const newResults = [...results];
    newResults[currentIndex] = isCorrect;
    setResults(newResults);
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      stopPlayback();
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setRevealedChars(new Set());
      setShowAnswer(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      stopPlayback();
      setCurrentIndex(currentIndex - 1);
      setUserInput("");
      setRevealedChars(new Set());
      setShowAnswer(false);
    }
  };

  const handleReset = () => {
    stopPlayback();
    setUserInput("");
    setRevealedChars(new Set());
    setShowAnswer(false);
  };

  const handleQuestionSelect = (idx: number) => {
    stopPlayback();
    setCurrentIndex(idx);
    setUserInput("");
    setRevealedChars(new Set());
    setShowAnswer(false);
  };

  const correctCount = results.filter(Boolean).length;
  const totalAnswered = results.filter((_, i) => i <= currentIndex).length;

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-5 border-b bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-lg">Chép chính tả</h3>
          <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          (Câu hỏi {currentIndex + 1}/{totalQuestions})
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            {correctCount}/{totalAnswered} đúng
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {totalAnswered > 0
              ? Math.round((correctCount / totalAnswered) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Question navigation */}
      <div className="p-4 border-b bg-gray-50 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed border bg-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex gap-2 overflow-x-auto">
          {transcripts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleQuestionSelect(idx)}
              className={`min-w-[68px] h-11 rounded-lg font-medium text-sm px-3 flex-shrink-0 ${
                idx === currentIndex
                  ? "bg-green-500 text-white shadow-md"
                  : results[idx]
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : idx < currentIndex
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              Câu {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === totalQuestions - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed border bg-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-5">
        <p className="text-sm text-gray-600 mb-3">
          Nhập những gì bạn nghe được (không cần gõ dấu câu)...
        </p>

        {/* Play/Pause button for current transcript */}
        <div className="mb-4 flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={stopPlayback}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Pause className="w-4 h-4 fill-white" />
              Dừng
            </button>
          ) : (
            <button
              onClick={handlePlaySegment}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Play className="w-4 h-4 fill-white" />
              Phát lại
            </button>
          )}
          <span className="text-xs text-gray-500">
            ({Math.floor(currentTranscript.startOffset / 1000)}s -{" "}
            {Math.floor(currentTranscript.endOffset / 1000)}s)
          </span>
        </div>

        <div className="mb-4 p-4 bg-gray-100 rounded-xl border border-gray-200">
          <p className="text-center text-lg font-medium text-gray-900 tracking-wide leading-relaxed">
            {maskText(currentTranscript.text, revealedChars)}
          </p>
        </div>

        {!showAnswer && (
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Gõ câu trả lời của bạn ở đây..."
            className="w-full h-32 p-4 border rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none outline-none transition text-gray-900"
          />
        )}

        {showAnswer && (
          <div className="space-y-3">
            <div className="flex items-center justify-center mb-3">
              {results[currentIndex] ? (
                <div className="flex items-center gap-2 px-5 py-2 bg-green-100 text-green-700 rounded-full">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Chính xác!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2 bg-red-100 text-red-700 rounded-full">
                  <X className="w-5 h-5" />
                  <span className="font-semibold">Chưa chính xác</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-xs font-medium text-blue-700 mb-2">
                Đáp án đúng:
              </p>
              <p className="text-base text-gray-900">
                {currentTranscript.text}
              </p>
            </div>

            {!results[currentIndex] && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-xs font-medium text-red-700 mb-2">
                  Câu trả lời của bạn:
                </p>
                <p className="text-base text-gray-900">{userInput}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="p-4 border-t bg-gradient-to-b from-gray-50 to-white space-y-2 flex-shrink-0">
        {!showAnswer ? (
          <div className="flex gap-3">
            <button
              onClick={revealHint}
              className="group relative p-3.5 bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden"
              title="Gợi ý"
            >
              <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
              <Lightbulb className="w-5 h-5 text-white relative z-10 drop-shadow-sm" />
            </button>
            <button
              onClick={checkAnswer}
              disabled={!userInput.trim()}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Kiểm tra
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Thử lại
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none flex items-center justify-center gap-2"
            >
              Tiếp
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
