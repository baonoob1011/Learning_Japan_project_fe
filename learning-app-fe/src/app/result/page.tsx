"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useExamResultStore } from "@/stores/examResultStore";
import BackButton from "@/components/backButton";

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

  // Sắp xếp answers theo questionOrder
  const sortedAnswers = [...result.answers].sort(
    (a, b) => a.questionOrder - b.questionOrder
  );

  // Tạo danh sách sections từ backend
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-cyan-100 shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <BackButton to="/video" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
          Kết quả thi
        </h1>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            B
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg border border-cyan-100 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 px-8 py-6">
                <h1 className="text-2xl font-bold text-white drop-shadow-md">
                  Kết quả luyện đề: {result.examCode}
                </h1>
              </div>

              {/* Score Circle */}
              <div className="px-8 py-10">
                <div className="flex flex-col items-center">
                  <h2 className="text-center text-cyan-600 font-bold text-xl mb-6 flex items-center gap-2">
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
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#14b8a6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-bold bg-gradient-to-br from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
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
                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl border-2 border-cyan-300 p-6 text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="text-4xl mb-3 animate-bounce">✅</div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Số câu đúng
                      </div>
                      <div className="text-4xl font-bold text-cyan-600">
                        {currentQuestions.filter((q) => q.isCorrect).length}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-300 p-6 text-center hover:shadow-lg transition-all hover:scale-105">
                      <div className="text-4xl mb-3">❌</div>
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        Số câu sai
                      </div>
                      <div className="text-4xl font-bold text-red-600">
                        {wrongAnswers}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-300 p-6 text-center hover:shadow-lg transition-all hover:scale-105">
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
                {/* Section Navigation */}
                {sections.length > 1 && (
                  <div className="flex gap-2">
                    {sections.map((section) => (
                      <button
                        key={section}
                        onClick={() => setCurrentSection(section)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          currentSection === section
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                            : "text-gray-700 hover:bg-cyan-50"
                        }`}
                      >
                        Phần {section}
                      </button>
                    ))}
                  </div>
                )}

                {/* Divider */}
                {sections.length > 1 && (
                  <div className="h-10 w-px bg-gray-300"></div>
                )}

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("answers")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === "answers"
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-cyan-50"
                    }`}
                  >
                    📋 Đáp án
                  </button>
                  <button
                    onClick={() => setActiveTab("detail")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === "detail"
                        ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-cyan-50"
                    }`}
                  >
                    📝 Đề & Đáp án
                  </button>
                </div>
              </div>
            </div>

            {/* Section Title */}
            <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white rounded-2xl px-8 py-5 mb-6 shadow-lg">
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
                      {/* Question Number Circle */}
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all group-hover:scale-110 ${
                          q.isCorrect
                            ? "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-700 border-2 border-cyan-300"
                            : q.answer === null
                            ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-300"
                            : "bg-gradient-to-br from-red-100 to-red-200 text-red-700 border-2 border-red-300"
                        }`}
                      >
                        {q.questionOrder}
                      </div>

                      {/* Status Icon */}
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
                                  ? "bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-700 border-2 border-cyan-300"
                                  : q.answer === null
                                  ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-2 border-gray-300"
                                  : "bg-gradient-to-br from-red-100 to-red-200 text-red-700 border-2 border-red-300"
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
                                    ? "border-cyan-400 bg-gradient-to-r from-cyan-50 to-cyan-100 shadow-md"
                                    : isUserAnswer && !q.isCorrect
                                    ? "border-red-400 bg-gradient-to-r from-red-50 to-red-100 shadow-md"
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
                                      ? "text-cyan-700 font-semibold"
                                      : isUserAnswer && !q.isCorrect
                                      ? "text-red-700 font-medium"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}. {option}
                                </span>
                                {isCorrectAnswer && (
                                  <span className="ml-auto text-cyan-600 font-bold flex items-center gap-1 bg-cyan-100 px-3 py-1 rounded-full">
                                    ✓ Đáp án đúng
                                  </span>
                                )}
                                {isUserAnswer && !q.isCorrect && (
                                  <span className="ml-auto text-red-600 font-bold flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full">
                                    ✗ Bạn đã chọn
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {q.explanation && (
                          <div className="mt-5 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200 shadow-sm">
                            <p className="text-sm text-cyan-900 leading-relaxed">
                              <span className="font-bold text-cyan-700 flex items-center gap-2 mb-2">
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
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-300 rounded-xl p-4 mb-4 shadow-sm">
                <p className="text-sm text-cyan-800 leading-relaxed">
                  💡 <span className="font-semibold">Tips!</span> Bôi đen văn
                  bản để dịch và thêm vào phần từ vựng
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 py-10 border-2 border-dashed border-cyan-300 rounded-xl bg-cyan-50">
                <div className="w-20 h-20 flex items-center justify-center bg-cyan-100 rounded-full">
                  <span className="text-5xl text-cyan-400">📄</span>
                </div>
                <p className="text-sm text-gray-500 text-center px-4 leading-relaxed">
                  Bôi đen văn bản để thêm vào phần từ vựng
                </p>
              </div>
              <button className="mt-5 w-full text-cyan-600 hover:text-cyan-700 font-semibold text-sm flex items-center justify-center gap-2 bg-cyan-50 hover:bg-cyan-100 py-3 rounded-xl transition-all border-2 border-cyan-200">
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
    </div>
  );
}
