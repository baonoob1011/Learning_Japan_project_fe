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

  // Xác định các section dựa trên questionOrder
  const sections = Array.from(
    new Set(result.answers.map((q) => Math.ceil(q.questionOrder / 50)))
  );
  const currentQuestions = result.answers.filter(
    (q) => Math.ceil(q.questionOrder / 50) === currentSection
  );

  const wrongAnswers = result.answers.filter(
    (q) => !q.isCorrect && q.answer !== null
  ).length;

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <BackButton to="/video" />
        <div className="text-2xl">🐸</div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            🛍️ <span className="text-sm">Sản phẩm</span>
          </button>
          <button className="text-xl">🍜</button>
          <button className="text-xl">🎮</button>
          <button className="flex items-center gap-1 text-emerald-600">
            🇻🇳 <span className="text-sm font-medium">VN</span>
          </button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            B
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Content */}
          <div className="flex-1">
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Kết quả luyện đề: {result.examCode}
            </h1>

            {/* Score Circle */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <h2 className="text-center text-yellow-600 font-semibold text-lg mb-4">
                  Điểm số của bạn
                </h2>
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#e5e7eb"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#10b981"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${(
                        (result.totalScore / (result.totalQuestions || 1)) *
                        553
                      ).toFixed(2)} 553`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-emerald-500">
                      {result.totalScore}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border-2 border-emerald-400 p-6 text-center">
                <div className="text-emerald-500 text-3xl mb-2">☀️</div>
                <div className="text-sm text-gray-600 mb-1">Số câu đúng</div>
                <div className="text-3xl font-bold text-emerald-600">
                  {result.correctCount}
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-red-300 p-6 text-center">
                <div className="text-red-500 text-3xl mb-2">✖️</div>
                <div className="text-sm text-gray-600 mb-1">Số câu sai</div>
                <div className="text-3xl font-bold text-red-600">
                  {wrongAnswers}
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-gray-300 p-6 text-center">
                <div className="text-gray-400 text-3xl mb-2">⭘</div>
                <div className="text-sm text-gray-600 mb-1">Bỏ qua</div>
                <div className="text-3xl font-bold text-gray-600">
                  {result.skippedCount}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("answers")}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  activeTab === "answers"
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Đáp án
              </button>
              <button
                onClick={() => setActiveTab("detail")}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  activeTab === "detail"
                    ? "bg-teal-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                Đề & Đáp án
              </button>
            </div>

            {/* Section Title */}
            <div className="bg-teal-500 text-white rounded-lg px-6 py-4 mb-6">
              <h2 className="text-lg font-semibold">
                Phần {currentSection}:{" "}
                {currentSection === 1 ? "Từ vựng / Ngữ pháp" : "Nghe hiểu"}
              </h2>
            </div>

            {/* Tab: Answers */}
            {activeTab === "answers" && (
              <div className="bg-white rounded-lg p-6">
                <div className="grid grid-cols-10 gap-2">
                  {currentQuestions.map((q) => (
                    <div
                      key={q.questionId}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {q.questionOrder}
                      </div>
                      <div className="flex items-center gap-1">
                        {q.isCorrect ? (
                          <>
                            <span className="text-emerald-600 font-semibold text-sm">
                              {q.questionOrder}
                            </span>
                            <span className="text-emerald-500">✓</span>
                          </>
                        ) : q.answer === null ? (
                          <span className="text-gray-400 font-medium text-sm">
                            {q.questionOrder}
                          </span>
                        ) : (
                          <>
                            <span className="text-red-600 font-semibold text-sm">
                              {q.questionOrder}
                            </span>
                            <span className="text-red-500">✗</span>
                          </>
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
                      className="bg-white rounded-lg border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                            {q.questionOrder}
                          </div>
                          <h3 className="text-lg font-normal text-gray-900">
                            {q.questionText}
                          </h3>
                        </div>
                        <button className="text-teal-500 hover:text-teal-600 font-medium text-sm">
                          Chi tiết
                        </button>
                      </div>

                      {q.audioUrl && (
                        <div className="mb-4">
                          <audio controls className="w-full">
                            <source src={q.audioUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}

                      <div className="space-y-2">
                        {options.map((option: string, idx: number) => {
                          const isUserAnswer = q.answer === option;
                          const isCorrectAnswer = q.correctAnswer === option;

                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                isCorrectAnswer
                                  ? "border-emerald-500 bg-emerald-50"
                                  : isUserAnswer && !q.isCorrect
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200"
                              }`}
                            >
                              <input
                                type="radio"
                                checked={isUserAnswer}
                                readOnly
                                className="w-5 h-5"
                              />
                              <span
                                className={`text-base ${
                                  isCorrectAnswer
                                    ? "text-emerald-600 font-medium"
                                    : isUserAnswer && !q.isCorrect
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {idx + 1}. {option}
                              </span>
                              {isCorrectAnswer && (
                                <span className="ml-auto text-emerald-500">
                                  ✓ Đáp án đúng
                                </span>
                              )}
                              {isUserAnswer && !q.isCorrect && (
                                <span className="ml-auto text-red-500">
                                  ✗ Bạn đã chọn
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">Giải thích:</span>{" "}
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar - Vocabulary */}
          <div className="w-80">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📚</span>
                Vocabulary
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-emerald-800">
                  💡 Tips! Bôi đen văn bản để dịch và thêm vào phần từ vựng
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="w-16 h-16 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">📄</span>
                </div>
                <p className="text-sm text-gray-500 max-w-[180px]">
                  Bôi đen văn bản để thêm vào phần từ vựng
                </p>
              </div>
              <button className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
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
