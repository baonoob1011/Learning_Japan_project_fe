"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Send, X, Loader2 } from "lucide-react";
import { useExamResultStore } from "@/stores/examResultStore";
import { chatbotService } from "@/services/chatbotService";
import BackButton from "@/components/backButton";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ─── MaziAIChat Component ─────────────────────────────────────────────────────
function MaziAIChat({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Xin chào! Tôi là NIBO AI. Tôi có thể giúp gì cho bạn?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatbotService.chat({ message: userMessage });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.reply },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999]">
        {/* Chat Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative transition-all duration-300 hover:scale-110"
          >
            <div className="relative w-16 h-16 drop-shadow-2xl animate-bounce-slow">
              <img
                src="/logo-cat.png"
                alt="NIBO AI"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-cyan-400 opacity-20 animate-ping" />
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-2xl shadow-2xl w-96 h-[600px] flex flex-col overflow-hidden ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            } border animate-slide-up`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 animate-bounce-slow">
                  <img
                    src="/logo-cat.png"
                    alt="NIBO AI"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold">NIBO AI</h3>
                  <p className="text-xs text-cyan-50">Trợ lý AI thông minh</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-cyan-600 rounded-full p-1 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div
              className={`flex-1 overflow-y-auto p-4 space-y-4 ${
                isDarkMode ? "bg-gray-900" : "bg-gray-50"
              }`}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-br-none shadow-md"
                        : `${
                            isDarkMode
                              ? "bg-gray-800 text-gray-100 border-gray-700"
                              : "bg-white text-gray-800 border-gray-200"
                          } shadow-sm rounded-bl-none border`
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start animate-fade-in">
                  <div
                    className={`${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-gray-200"
                    } text-gray-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border`}
                  >
                    <Loader2 className="animate-spin text-cyan-500" size={20} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className={`p-4 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } border-t`}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className={`flex-1 px-4 py-2 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900"
                  } border rounded-full focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all`}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-full p-2 transition-all disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

// ─── ExamResultPage ───────────────────────────────────────────────────────────
export default function ExamResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantId = searchParams.get("participantId");

  const result = useExamResultStore((state) => state.result);
  const [activeTab, setActiveTab] = useState<"answers" | "detail">("answers");
  const [currentSection, setCurrentSection] = useState(1);

  if (!result) {
    router.push("/");
    return null;
  }

  const sortedAnswers = [...result.answers].sort(
    (a, b) => a.questionOrder - b.questionOrder
  );

  const sections = Array.from(
    new Set(sortedAnswers.map((q) => q.sectionOrder ?? 1))
  ).sort((a, b) => a - b);

  const currentQuestions = sortedAnswers.filter(
    (q) => (q.sectionOrder ?? 1) === currentSection
  );

  const wrongAnswers = currentQuestions.filter(
    (q) => !q.isCorrect && q.answer !== null
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cyan-100 shadow-lg px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <BackButton to="/video" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
          Kết quả thi
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-40"></div>
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-md relative z-10">
              B
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 px-8 py-6">
                <h1 className="text-2xl font-bold text-white drop-shadow-md">
                  Kết quả luyện đề: {result.examCode}
                </h1>
              </div>

              {/* Score Circle */}
              <div className="px-8 py-10">
                <div className="flex flex-col items-center">
                  <h2 className="text-center text-cyan-500 font-bold text-xl mb-6 flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    Điểm số của bạn
                  </h2>
                  <div className="relative mb-8">
                    <div className="relative w-56 h-56">
                      <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                        <circle
                          cx="112"
                          cy="112"
                          r="100"
                          stroke="#f3f4f6"
                          strokeWidth="20"
                          fill="none"
                        />
                        <circle
                          cx="112"
                          cy="112"
                          r="100"
                          stroke="url(#gradient)"
                          strokeWidth="20"
                          fill="none"
                          strokeDasharray={`${(
                            (result.totalScore / (result.totalQuestions || 1)) *
                            628
                          ).toFixed(2)} 628`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
                          {result.totalScore}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          / {result.totalQuestions || currentQuestions.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-6 w-full max-w-2xl">
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border-2 border-cyan-200 p-6 text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="text-4xl mb-3 animate-bounce">✅</div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Số câu đúng
                      </div>
                      <div className="text-4xl font-bold text-cyan-500">
                        {currentQuestions.filter((q) => q.isCorrect).length}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200 p-6 text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="text-4xl mb-3">❌</div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Số câu sai
                      </div>
                      <div className="text-4xl font-bold text-red-500">
                        {wrongAnswers}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 p-6 text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="text-4xl mb-3">⊝</div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Bỏ qua
                      </div>
                      <div className="text-4xl font-bold text-gray-600">
                        {
                          currentQuestions.filter((q) => q.answer === null)
                            .length
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Navigation & Tabs Combined */}
            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-2 mb-6">
              <div className="flex items-center justify-between gap-2">
                {sections.length > 1 && (
                  <div className="flex gap-2">
                    {sections.map((section) => (
                      <button
                        key={section}
                        onClick={() => setCurrentSection(section)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          currentSection === section
                            ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-md"
                            : "text-gray-700 hover:bg-cyan-50"
                        }`}
                      >
                        Phần {section}
                      </button>
                    ))}
                  </div>
                )}
                {sections.length > 1 && (
                  <div className="h-10 w-px bg-gray-300"></div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("answers")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === "answers"
                        ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-cyan-50"
                    }`}
                  >
                    📋 Đáp án
                  </button>
                  <button
                    onClick={() => setActiveTab("detail")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === "detail"
                        ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-cyan-50"
                    }`}
                  >
                    📝 Đề & Đáp án
                  </button>
                </div>
              </div>
            </div>

            {/* Section Title */}
            <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-2xl px-8 py-5 mb-6 shadow-lg">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="text-2xl">📖</span>
                Phần {currentSection}:{" "}
                {currentSection === 1 ? "Kiến thức ngôn ngữ" : "Nghe hiểu"}
              </h2>
            </div>

            {/* Tab: Answers */}
            {activeTab === "answers" && (
              <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 p-8">
                <div className="grid grid-cols-10 gap-4">
                  {currentQuestions.map((q) => (
                    <div
                      key={q.questionId}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all group-hover:scale-110 ${
                          q.isCorrect
                            ? "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-600 border-2 border-cyan-300"
                            : q.answer === null
                            ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-300"
                            : "bg-gradient-to-br from-red-100 to-red-200 text-red-600 border-2 border-red-300"
                        }`}
                      >
                        {q.questionOrder}
                      </div>
                      <div className="flex items-center justify-center h-7">
                        {q.isCorrect ? (
                          <span className="text-cyan-500 text-2xl font-bold">
                            ✓
                          </span>
                        ) : q.answer === null ? (
                          <span className="text-gray-400 text-2xl">○</span>
                        ) : (
                          <span className="text-red-500 text-2xl font-bold">
                            ✗
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Detail */}
            {activeTab === "detail" && (
              <div className="space-y-6">
                {currentQuestions.map((q) => {
                  const options = JSON.parse(q.optionsJson || "[]");
                  return (
                    <div
                      key={q.questionId}
                      className="bg-white rounded-2xl border-2 border-cyan-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md ${
                                q.isCorrect
                                  ? "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-600 border-2 border-cyan-300"
                                  : q.answer === null
                                  ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-300"
                                  : "bg-gradient-to-br from-red-100 to-red-200 text-red-600 border-2 border-red-300"
                              }`}
                            >
                              {q.questionOrder}
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
                              {q.questionText}
                            </h3>
                          </div>
                        </div>

                        {q.audioUrl && (
                          <div className="mb-4 bg-gray-50 rounded-xl p-4">
                            <audio controls className="w-full">
                              <source src={q.audioUrl} type="audio/mpeg" />
                            </audio>
                          </div>
                        )}

                        {q.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={q.imageUrl}
                              alt="Question"
                              className="max-w-full h-auto rounded-xl shadow-md"
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          {options.map((option: string, idx: number) => {
                            const isUserAnswer = q.answer === option;
                            const isCorrectAnswer = q.correctAnswer === option;
                            return (
                              <div
                                key={idx}
                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                  isCorrectAnswer
                                    ? "border-cyan-300 bg-gradient-to-r from-cyan-50 to-cyan-100 shadow-md"
                                    : isUserAnswer && !q.isCorrect
                                    ? "border-red-300 bg-gradient-to-r from-red-50 to-red-100 shadow-md"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  checked={isUserAnswer}
                                  readOnly
                                  className="w-5 h-5"
                                />
                                <span
                                  className={`text-base flex-1 ${
                                    isCorrectAnswer
                                      ? "text-cyan-600 font-semibold"
                                      : isUserAnswer && !q.isCorrect
                                      ? "text-red-600 font-medium"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}. {option}
                                </span>
                                {isCorrectAnswer && (
                                  <span className="ml-auto text-cyan-500 font-bold flex items-center gap-1 bg-cyan-100 px-3 py-1 rounded-full">
                                    ✓ Đáp án đúng
                                  </span>
                                )}
                                {isUserAnswer && !q.isCorrect && (
                                  <span className="ml-auto text-red-500 font-bold flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full">
                                    ✗ Bạn đã chọn
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-5 p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-200 shadow-sm">
                            <p className="text-sm text-cyan-900 leading-relaxed">
                              <span className="font-bold text-cyan-600 flex items-center gap-2 mb-2">
                                💡 Giải thích:
                              </span>
                              {q.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar - Vocabulary */}
          <div className="w-80">
            <div className="bg-white rounded-2xl border-2 border-cyan-100 shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <span className="text-2xl">📚</span>
                Vocabulary
              </h3>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 rounded-xl p-4 mb-4 shadow-sm">
                <p className="text-sm text-cyan-800 leading-relaxed">
                  💡 <span className="font-semibold">Tips!</span> Bôi đen văn
                  bản để dịch và thêm vào phần từ vựng
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 py-10 border-2 border-dashed border-cyan-200 rounded-xl bg-cyan-50">
                <div className="w-20 h-20 flex items-center justify-center bg-cyan-100 rounded-full">
                  <span className="text-5xl text-cyan-400">📄</span>
                </div>
                <p className="text-sm text-gray-500 text-center px-4 leading-relaxed">
                  Bôi đen văn bản để thêm vào phần từ vựng
                </p>
              </div>
              <button className="mt-5 w-full text-cyan-500 hover:text-cyan-600 font-semibold text-sm flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 py-3 rounded-xl transition-all border-2 border-cyan-200">
                Nhập văn bản để dịch
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NIBO AI Chat - Floating */}
      <MaziAIChat />
    </div>
  );
}
