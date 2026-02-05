import React, { useState, useEffect } from "react";
import {
  Volume2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { vocabService, VocabResponse } from "@/services/vocabService";
import { LearningStatus } from "@/enums/LearningStatus";

interface FlashcardProps {
  isDark: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ isDark }) => {
  const [vocabs, setVocabs] = useState<VocabResponse[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [markedVocabs, setMarkedVocabs] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<LearningStatus | null>(
    null
  );

  useEffect(() => {
    const loadStatus = async () => {
      const card = vocabs[currentCard];
      if (!card) return;

      try {
        const res = await vocabService.getStatus(card.id);
        setCurrentStatus(res.status);
      } catch (err) {
        console.error("Load vocab status failed", err);
        setCurrentStatus(null);
      }
    };

    loadStatus();
  }, [currentCard, vocabs]);
  const markVocab = async (remembered: boolean) => {
    const card = vocabs[currentCard];
    if (!card) return;

    try {
      await vocabService.markVocab({
        vocabId: card.id,
        remembered,
      });

      setMarkedVocabs((prev) => ({
        ...prev,
        [card.id]: remembered,
      }));

      setCurrentStatus(
        remembered ? LearningStatus.KNOWN : LearningStatus.FORGOTTEN
      );
    } catch (err) {
      console.error("Mark vocab failed:", err);
    }
  };

  // Load vocabs từ API khi component mount
  useEffect(() => {
    loadVocabs();
  }, []);

  // Cleanup: Xóa trạng thái khi component unmount (tắt app)
  useEffect(() => {
    return () => {
      setMarkedVocabs({});
    };
  }, []);

  const loadVocabs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await vocabService.getMyVocabs();

      if (data.length === 0) {
        setError("Bạn chưa có từ vựng nào. Hãy thêm từ vựng mới!");
      } else {
        setVocabs(data);
      }
    } catch (err) {
      console.error("Error loading vocabs:", err);
      setError("Không thể tải từ vựng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add custom scrollbar styles based on theme
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      ::-webkit-scrollbar {
        width: 12px;
      }
      ::-webkit-scrollbar-track {
        background: ${isDark ? "#1f2937" : "#f3f4f6"};
      }
      ::-webkit-scrollbar-thumb {
        background: ${isDark ? "#4b5563" : "#d1d5db"};
        border-radius: 6px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: ${isDark ? "#6b7280" : "#9ca3af"};
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, [isDark]);

  const handleNext = () => {
    if (currentCard < vocabs.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = [...vocabs].sort(() => Math.random() - 0.5);
    setVocabs(shuffled);
    setCurrentCard(0);
    setIsFlipped(false);
  };

  // Lấy thông tin trạng thái của vocab hiện tại
  const getStatusInfo = () => {
    if (currentStatus === null) {
      return {
        label: "Đang tải",
        icon: "⏳",
        isMarked: false,
        bgClass: "bg-gray-300/20 text-gray-400",
      };
    }

    if (currentStatus === LearningStatus.KNOWN) {
      return {
        label: "Đã thuộc",
        icon: "✓",
        isMarked: true,
        bgClass: "bg-emerald-400/20 text-emerald-400",
      };
    }

    if (currentStatus === LearningStatus.FORGOTTEN) {
      return {
        label: "Đã quên",
        icon: "⚠",
        isMarked: false,
        bgClass: "bg-red-400/20 text-red-400",
      };
    }

    return {
      label: "Đang học",
      icon: "📖",
      isMarked: false,
      bgClass: "bg-amber-400/20 text-amber-400",
    };
  };

  const playSound = () => {
    if (soundEnabled && vocabs[currentCard]) {
      const card = vocabs[currentCard];

      if (card.audioUrl) {
        const audio = new Audio(card.audioUrl);
        audio.play().catch((err) => console.error("Error playing audio:", err));
      } else {
        // Fallback: sử dụng Web Speech API
        const utterance = new SpeechSynthesisUtterance(card.surface);
        utterance.lang = "ja-JP";
        speechSynthesis.speak(utterance);
      }
    }
  };

  const copyWord = () => {
    if (vocabs[currentCard]) {
      navigator.clipboard.writeText(vocabs[currentCard].surface);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-1 pb-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <Loader2
            className={`w-12 h-12 animate-spin ${
              isDark ? "text-cyan-400" : "text-cyan-600"
            }`}
          />
          <p
            className={`mt-4 text-lg ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Đang tải từ vựng...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-1 pb-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <div className={`text-6xl mb-4`}>😿</div>
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            {error}
          </p>
          <button
            onClick={loadVocabs}
            className="mt-6 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (vocabs.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto pt-1 pb-8 px-4">
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <div className={`text-6xl mb-4`}>📚</div>
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Bạn chưa có từ vựng nào
          </p>
        </div>
      </div>
    );
  }

  const card = vocabs[currentCard];
  const statusInfo = getStatusInfo();

  return (
    <div className="w-full max-w-4xl mx-auto pt-1 pb-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Navigation buttons */}
        <div className="flex justify-center items-center gap-4 mb-4">
          <button
            onClick={handlePrev}
            disabled={currentCard === 0}
            className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <ChevronLeft
              className={`w-5 h-5 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            />
          </button>

          <div className="w-10 h-10 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-semibold shadow-md">
            {currentCard + 1}
          </div>

          <button
            onClick={handleNext}
            disabled={currentCard === vocabs.length - 1}
            className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <ChevronRight
              className={`w-5 h-5 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            />
          </button>
        </div>

        {/* Main card */}
        <div className="relative" style={{ perspective: "1000px" }}>
          <div
            onClick={handleFlip}
            className="relative cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.6s",
              transform: isFlipped ? "rotateX(180deg)" : "rotateX(0deg)",
              minHeight: "480px",
            }}
          >
            {/* Front Side */}
            <div
              className={`absolute inset-0 rounded-3xl border-4 border-cyan-400 p-6 shadow-xl flex flex-col ${
                isDark
                  ? "bg-gradient-to-br from-gray-800 to-gray-900"
                  : "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"
              }`}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* Status indicator */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo?.bgClass}`}
                >
                  <span className="text-lg">{statusInfo?.icon}</span>
                  <span>{statusInfo?.label}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound();
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    <Volume2
                      className={`w-4 h-4 ${
                        isDark ? "text-gray-300" : "text-cyan-600"
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyWord();
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    <Copy
                      className={`w-4 h-4 ${
                        isDark ? "text-gray-300" : "text-cyan-600"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Front Card content */}
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <div className="mb-6">
                  <img
                    src="/cat-front.png"
                    alt="Cat Front"
                    className="w-28 h-28 object-contain"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112'%3E%3Ctext x='50%25' y='50%25' font-size='64' text-anchor='middle' dy='.3em'%3E😺%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div
                  className={`px-10 py-8 rounded-2xl ${
                    isDark
                      ? "bg-gradient-to-br from-cyan-900/60 to-blue-900/60"
                      : "bg-gradient-to-br from-cyan-100 to-blue-100"
                  }`}
                >
                  <div
                    className={`text-4xl font-bold text-center ${
                      isDark ? "text-cyan-300" : "text-gray-800"
                    }`}
                  >
                    {card.surface}
                  </div>
                </div>
              </div>

              {/* Hint text */}
              <div
                className={`text-center text-sm mt-4 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Nhấn để xem nghĩa
              </div>
            </div>

            {/* Back Side */}
            <div
              className={`absolute inset-0 rounded-3xl border-4 border-cyan-400 p-6 shadow-xl flex flex-col ${
                isDark
                  ? "bg-gradient-to-br from-gray-800 to-gray-900"
                  : "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"
              }`}
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
              }}
            >
              {/* Status indicator */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo?.bgClass}`}
                >
                  <span className="text-lg">{statusInfo?.icon}</span>
                  <span>{statusInfo?.label}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSound();
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    <Volume2
                      className={`w-4 h-4 ${
                        isDark ? "text-gray-300" : "text-cyan-600"
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyWord();
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    <Copy
                      className={`w-4 h-4 ${
                        isDark ? "text-gray-300" : "text-cyan-600"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Back Card content */}
              <div className="flex-1 flex flex-col items-center justify-center py-8">
                <div className="mb-6">
                  <img
                    src="/cat-back.png"
                    alt="Cat Back"
                    className="w-28 h-28 object-contain"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112'%3E%3Ctext x='50%25' y='50%25' font-size='64' text-anchor='middle' dy='.3em'%3E😸%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="text-center space-y-4 px-4">
                  <div
                    className={`text-4xl font-bold ${
                      isDark ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    {card.translated}
                  </div>

                  <div
                    className={`text-base mt-4 p-4 rounded-lg ${
                      isDark
                        ? "bg-gray-700/80 text-gray-300"
                        : "bg-white/80 text-gray-600"
                    }`}
                  >
                    <div>{card.reading && `(${card.reading})`}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation hint */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentCard === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg transition text-sm font-medium ${
              currentCard === 0
                ? isDark
                  ? "text-gray-600"
                  : "text-gray-300"
                : isDark
                ? "text-cyan-400 hover:bg-gray-700"
                : "text-cyan-600 hover:bg-cyan-50"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentCard === vocabs.length - 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg transition text-sm font-medium ${
              currentCard === vocabs.length - 1
                ? isDark
                  ? "text-gray-600"
                  : "text-gray-300"
                : isDark
                ? "text-cyan-400 hover:bg-gray-700"
                : "text-cyan-600 hover:bg-cyan-50"
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Additional controls */}
        <div className="flex items-center justify-between mt-6 px-4">
          <button
            onClick={handleShuffle}
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-md transition text-sm font-medium ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                : "bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            <span>⚄</span>
            <span>Xáo trộn</span>
          </button>

          {/* Nút "Đánh dấu đã thuộc" - tối màu khi đã bấm hoặc status là KNOWN */}
          <button
            onClick={() => markVocab(true)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full shadow-md transition text-sm font-bold ${
              statusInfo?.isMarked
                ? isDark
                  ? "bg-gray-700 text-gray-400 opacity-60"
                  : "bg-gray-300 text-gray-500 opacity-60"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
            disabled={statusInfo?.isMarked}
          >
            <span className="text-lg">✓</span>
            <span>Đánh dấu đã thuộc</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center transition ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full ${
                soundEnabled ? "bg-cyan-500" : "bg-gray-300"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
