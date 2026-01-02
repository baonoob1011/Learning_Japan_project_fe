"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Lightbulb, Check, X } from "lucide-react";
import SegmentPlaybackButton from "./SegmentPlaybackButton";

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
   * STOP PLAYBACK
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
      "🔧 Dictation: Setting up callback, playerRef.current:",
      playerRef.current
    );

    if (playerRef.current) {
      const player = playerRef.current as YoutubePlayerHandle & {
        onDictationSegmentEnd?: () => void;
      };
      player.onDictationSegmentEnd = handleSegmentEnd;
      console.log("✅ Dictation: Callback assigned successfully!");
    } else {
      console.log("❌ Dictation: playerRef.current is null!");
    }

    return () => {
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
  const normalizeText = (text: string) => {
    return text
      .replace(/[\s、。！？「」『』（）.,!?;:'"()\[\]{}]/g, "")
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
            <span className="inline-flex items-center justify-center w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full shadow-md hover:shadow-xl hover:from-yellow-400 hover:via-amber-400 hover:to-orange-400 transition-all duration-300"></span>
          )}
        </span>
      );
    });

  const revealHint = () => {
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
    <div className="w-96 bg-white/90 backdrop-blur-sm border-l border-cyan-100 flex flex-col flex-shrink-0 shadow-xl">
      {/* Header */}
      <div className="p-5 border-b border-cyan-100 bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 bg-clip-text text-transparent text-lg">
            Chép chính tả
          </h3>
          <button className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-cyan-700">
          (Câu hỏi {currentIndex + 1}/{totalQuestions})
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-xs font-medium shadow-sm">
            {correctCount}/{totalAnswered} đúng
          </div>
          <div className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full text-xs font-medium shadow-sm">
            {totalAnswered > 0
              ? Math.round((correctCount / totalAnswered) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Question navigation */}
      <div className="p-4 border-b border-cyan-50 bg-gradient-to-r from-white via-cyan-50/30 to-white flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 disabled:opacity-30 disabled:cursor-not-allowed border border-cyan-200 bg-white transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-cyan-600" />
        </button>

        <div className="flex-1 flex gap-2 overflow-x-auto">
          {transcripts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleQuestionSelect(idx)}
              className={`min-w-[68px] h-11 rounded-lg font-medium text-sm px-3 flex-shrink-0 transition-all ${
                idx === currentIndex
                  ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-md"
                  : results[idx]
                  ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-white"
                  : idx < currentIndex
                  ? "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-500 border border-gray-200"
                  : "bg-white text-gray-700 border border-cyan-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
              }`}
            >
              Câu {idx + 1}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === totalQuestions - 1}
          className="p-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 disabled:opacity-30 disabled:cursor-not-allowed border border-cyan-200 bg-white transition-all"
        >
          <ChevronRight className="w-5 h-5 text-cyan-600" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-white via-cyan-50/20 to-blue-50/30">
        <p className="text-sm text-cyan-700 mb-3">
          Nhập những gì bạn nghe được (không cần gõ dấu câu)...
        </p>

        {/* Playback Button Component */}
        <SegmentPlaybackButton
          transcript={currentTranscript}
          playerRef={playerRef}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
        />

        <div className="mb-4 p-5 bg-gradient-to-r from-cyan-50/50 via-blue-50/50 to-indigo-50/50 rounded-2xl border border-cyan-100/50 shadow-sm">
          <p className="text-center text-lg font-medium text-gray-900 tracking-wide leading-relaxed">
            {maskText(currentTranscript.text, revealedChars)}
          </p>
        </div>

        {!showAnswer && (
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Gõ câu trả lời của bạn ở đây..."
            className="w-full h-32 p-4 border-2 border-cyan-200 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 resize-none outline-none transition text-gray-900 bg-white"
          />
        )}

        {showAnswer && (
          <div className="space-y-3">
            <div className="flex items-center justify-center mb-3">
              {results[currentIndex] ? (
                <div className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 rounded-full shadow-sm">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Chính xác!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-600 rounded-full">
                  <X className="w-5 h-5" />
                  <span className="font-semibold">Chưa chính xác</span>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-cyan-50/50 via-blue-50/50 to-indigo-50/50 border border-cyan-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-medium text-cyan-700 mb-2">
                Đáp án đúng:
              </p>
              <p className="text-base text-gray-900">
                {currentTranscript.text}
              </p>
            </div>

            {!results[currentIndex] && (
              <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                <p className="text-xs font-medium text-red-600 mb-2">
                  Câu trả lời của bạn:
                </p>
                <p className="text-base text-gray-900">{userInput}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div className="p-4 border-t border-cyan-100 bg-white space-y-2 flex-shrink-0">
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
              className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Kiểm tra
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Thử lại
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 disabled:bg-gray-300 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none flex items-center justify-center gap-2"
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
