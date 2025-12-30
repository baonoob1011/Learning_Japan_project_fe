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

// YouTube Player Type
interface YTPlayer {
  getCurrentTime: () => number | undefined;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

interface DictationPracticeProps {
  transcripts: TranscriptDTO[];
  videoId: string;
  playerRef: React.RefObject<YTPlayer | null>;
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTranscript = transcripts[currentIndex];
  const totalQuestions = transcripts.length;

  /** ======================
   * STOP PLAYBACK - Cleanup function
   ====================== */
  const stopPlayback = () => {
    // Clear interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Then pause video
    if (playerRef.current) {
      try {
        playerRef.current.pauseVideo();
      } catch (error) {
        console.warn("Error stopping playback:", error);
      }
    }

    setIsPlaying(false);
  };

  /** ======================
   * PLAY SEGMENT - Fixed version
   ====================== */
  const handlePlaySegment = () => {
    if (!playerRef.current || !currentTranscript) return;

    const startSec = currentTranscript.startOffset / 1000;
    const endSec = currentTranscript.endOffset / 1000;

    // Stop any existing playback first
    stopPlayback();

    try {
      // Seek to start position
      playerRef.current.seekTo(startSec, true);

      // Small delay to ensure seek completes
      setTimeout(() => {
        if (!playerRef.current) return;

        playerRef.current.playVideo();
        setIsPlaying(true);

        // Set up interval to monitor playback
        intervalRef.current = setInterval(() => {
          if (!playerRef.current) {
            stopPlayback();
            return;
          }

          try {
            const currentTime = playerRef.current.getCurrentTime();

            // Check if we've reached the end or passed it
            if (typeof currentTime === "number" && currentTime >= endSec) {
              stopPlayback();
            }
          } catch (error) {
            console.warn("Error checking playback time:", error);
            stopPlayback();
          }
        }, 100);
      }, 100);
    } catch (error) {
      console.warn("Error starting playback:", error);
      stopPlayback();
    }
  };

  /** ======================
   * CLEANUP on unmount or transcript change
   ====================== */
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [currentIndex]);

  /** ======================
   * HELPER FUNCTIONS
   ====================== */
  const maskText = (text: string, revealed: Set<number>) =>
    text
      .split("")
      .map((char, idx) =>
        revealed.has(idx) || /[\s、。！？「」『』（）]/.test(char) ? char : "•"
      )
      .join("");

  const revealHint = () => {
    const text = currentTranscript.text;
    const unrevealedIndices = text
      .split("")
      .map((_, i) => i)
      .filter(
        (i) =>
          !revealedChars.has(i) && !/[\s、。！？「」『』（）]/.test(text[i])
      );
    if (unrevealedIndices.length) {
      const randomIndex =
        unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      setRevealedChars(new Set([...revealedChars, randomIndex]));
    }
  };

  const checkAnswer = () => {
    const isCorrect =
      userInput.trim().toLowerCase() ===
      currentTranscript.text.trim().toLowerCase();
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
          Nhập những gì bạn nghe được...
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
      <div className="p-4 border-t bg-gray-50 space-y-2 flex-shrink-0">
        {!showAnswer ? (
          <div className="flex gap-2">
            <button
              onClick={revealHint}
              className="p-3 border rounded-xl hover:border-yellow-400 transition"
              title="Gợi ý"
            >
              <Lightbulb className="w-5 h-5 text-gray-600 hover:text-yellow-500 transition" />
            </button>
            <button
              onClick={checkAnswer}
              disabled={!userInput.trim()}
              className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Kiểm tra
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold transition"
            >
              Thử lại
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-semibold disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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
