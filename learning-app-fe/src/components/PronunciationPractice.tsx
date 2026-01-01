"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  Play,
  Pause,
  Volume2,
  RotateCcw,
  CheckCircle2,
  XCircle,
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

interface PronunciationPracticeProps {
  transcripts: TranscriptDTO[];
  videoId: string;
  playerRef: React.RefObject<YoutubePlayerHandle | null>;
}

export default function PronunciationPractice({
  transcripts,
  videoId,
  playerRef,
}: PronunciationPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(
    null
  );
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [results, setResults] = useState<
    Array<{ score: number; accuracy: number; completion: number } | null>
  >(new Array(transcripts.length).fill(null));

  const currentTranscript = transcripts[currentIndex];
  const totalQuestions = transcripts.length;

  /** ======================
   * HANDLE SEGMENT END
   ====================== */
  const handleSegmentEnd = () => {
    console.log("=== Pronunciation: Segment ended ===");
    setIsPlaying(false);
  };

  /** ======================
   * PLAY SEGMENT
   ====================== */
  const handlePlaySegment = () => {
    console.log("=== Pronunciation: handlePlaySegment called ===");
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
   * STOP PLAYBACK
   ====================== */
  const stopPlayback = () => {
    if (playerRef.current) {
      playerRef.current.stopSegment();
    }
    setIsPlaying(false);
  };

  /** ======================
   * RECORDING FUNCTIONS
   ====================== */
  const startRecording = () => {
    setIsRecording(true);
    // Simulate recording - in real app, you'd use Web Speech API or similar
    setTimeout(() => {
      stopRecording();
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Simulate scoring - in real app, you'd send audio to pronunciation API
    const mockScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const mockCompletion = Math.floor(Math.random() * 20) + 80; // 80-100
    const mockAccuracy = Math.floor(Math.random() * 25) + 75; // 75-100

    setPronunciationScore(mockScore);
    setCompletionRate(mockCompletion);
    setAccuracyScore(mockAccuracy);

    const newResults = [...results];
    newResults[currentIndex] = {
      score: mockScore,
      accuracy: mockAccuracy,
      completion: mockCompletion,
    };
    setResults(newResults);
  };

  /** ======================
   * NAVIGATION
   ====================== */
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      stopPlayback();
      setCurrentIndex(currentIndex + 1);
      resetScores();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      stopPlayback();
      setCurrentIndex(currentIndex - 1);
      resetScores();
    }
  };

  const handleQuestionSelect = (idx: number) => {
    stopPlayback();
    setCurrentIndex(idx);
    resetScores();
  };

  const resetScores = () => {
    setPronunciationScore(null);
    setCompletionRate(null);
    setAccuracyScore(null);
  };

  const handleRetry = () => {
    resetScores();
  };

  /** ======================
   * CLEANUP on unmount or transcript change
   ====================== */
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.stopSegment();
      }
      setIsPlaying(false);
    };
  }, [currentIndex, playerRef]);

  /** ======================
   * SETUP CALLBACK for segment end
   ====================== */
  useEffect(() => {
    console.log(
      "🔧 Pronunciation: Setting up callback, playerRef.current:",
      playerRef.current
    );

    if (playerRef.current) {
      const player = playerRef.current as YoutubePlayerHandle & {
        onPronunciationSegmentEnd?: () => void;
      };
      player.onPronunciationSegmentEnd = handleSegmentEnd;
      console.log("✅ Pronunciation: Callback assigned successfully!");
    } else {
      console.log("❌ Pronunciation: playerRef.current is null!");
    }

    return () => {
      if (playerRef.current) {
        const player = playerRef.current as YoutubePlayerHandle & {
          onPronunciationSegmentEnd?: () => void;
        };
        player.onPronunciationSegmentEnd = undefined;
      }
    };
  }, []);

  /** ======================
   * HELPERS
   ====================== */
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 75) return "bg-blue-50 border-blue-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const completedCount = results.filter((r) => r !== null).length;
  const avgScore =
    completedCount > 0
      ? Math.round(
          results
            .filter((r) => r !== null)
            .reduce((sum, r) => sum + r!.score, 0) / completedCount
        )
      : 0;

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-5 border-b bg-gradient-to-r from-green-50 to-emerald-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-600" />
            Luyện phát âm
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          (Câu {currentIndex + 1}/{totalQuestions})
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            {completedCount}/{totalQuestions} hoàn thành
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            TB: {avgScore} điểm
          </div>
        </div>
      </div>

      {/* Question Navigation */}
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
                  ? results[idx]!.score >= 75
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-yellow-100 text-yellow-700 border border-yellow-300"
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
        {/* Current Sentence Display */}
        <div className="mb-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium mb-2">
            Câu hiện tại:
          </p>
          <p className="text-center text-lg font-bold text-gray-900 tracking-wide leading-relaxed">
            {currentTranscript.text}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <button
                onClick={stopPlayback}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors shadow-sm bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Pause className="w-5 h-5 fill-white" />
                Dừng phát
              </button>
            ) : (
              <button
                onClick={handlePlaySegment}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors shadow-sm bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Play className="w-5 h-5 fill-white" />
                Nghe mẫu
              </button>
            )}
          </div>
          <p className="text-xs text-center text-gray-500">
            Thời gian: {Math.floor(currentTranscript.startOffset / 1000)}s -{" "}
            {Math.floor(currentTranscript.endOffset / 1000)}s
          </p>
        </div>

        {/* Recording Section */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-emerald-200">
            {isRecording ? (
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Đang ghi âm...
                </p>
                <p className="text-xs text-gray-500">Hãy đọc theo câu mẫu</p>
              </div>
            ) : (
              <button
                onClick={startRecording}
                disabled={pronunciationScore !== null}
                className="w-full"
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {pronunciationScore !== null
                    ? "Đã ghi âm"
                    : "Nhấn để bắt đầu"}
                </p>
              </button>
            )}
          </div>
        </div>

        {/* Results Display */}
        {pronunciationScore !== null && (
          <div className="space-y-3 animate-fadeIn">
            {/* Overall Score */}
            <div
              className={`p-4 rounded-xl border-2 ${getScoreBgColor(
                pronunciationScore
              )}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Điểm phát âm
                </span>
                {pronunciationScore >= 75 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-600" />
                )}
              </div>
              <p
                className={`text-4xl font-bold ${getScoreColor(
                  pronunciationScore
                )}`}
              >
                {pronunciationScore}
                <span className="text-lg">/100</span>
              </p>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  Độ chính xác
                </p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    accuracyScore!
                  )}`}
                >
                  {accuracyScore}
                  <span className="text-sm">/100</span>
                </p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-xs text-green-700 font-medium mb-1">
                  Độ hoàn thiện
                </p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    completionRate!
                  )}`}
                >
                  {completionRate}
                  <span className="text-sm">/100</span>
                </p>
              </div>
            </div>

            {/* Feedback */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs font-medium text-gray-700 mb-2">
                Đánh giá:
              </p>
              <p className="text-sm text-gray-600">
                {pronunciationScore >= 90
                  ? "Xuất sắc! Phát âm của bạn rất tốt."
                  : pronunciationScore >= 75
                  ? "Tốt! Tiếp tục luyện tập để hoàn thiện hơn."
                  : "Cần cải thiện. Hãy nghe kỹ mẫu và thử lại."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="p-4 border-t bg-gradient-to-b from-gray-50 to-white space-y-2 flex-shrink-0">
        {pronunciationScore === null ? (
          <div className="flex gap-3">
            <button
              onClick={handlePlaySegment}
              disabled={isPlaying}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              Nghe lại
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Thử lại
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex-1 px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
