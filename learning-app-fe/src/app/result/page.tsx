"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { examService } from "@/services/exam";

interface ExamResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedAnswers: number;
  sections: {
    sectionOrder: number;
    sectionName: string;
    questions: {
      questionOrder: number;
      questionText: string;
      userAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
    }[];
  }[];
}

export default function ExamResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantId = searchParams.get("participantId");

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "correct" | "wrong">(
    "all"
  );
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  useEffect(() => {
    const fetchResult = async () => {
      if (!participantId) {
        router.push("/");
        return;
      }

      try {
        // Giả sử có API để lấy kết quả
        const data = await examService.getResult(participantId);
        setResult(data);
      } catch (err) {
        console.error("Lỗi khi lấy kết quả:", err);
        // Mock data for demo
        setResult({
          score: 1,
          totalQuestions: 96,
          correctAnswers: 1,
          wrongAnswers: 0,
          skippedAnswers: 95,
          sections: [
            {
              sectionOrder: 1,
              sectionName: "Phần 1: Từ vựng / Ngữ pháp",
              questions: [
                {
                  questionOrder: 1,
                  questionText:
                    "問題1__の言葉の読み方として最もよいものを、1から一つ選びなさい。",
                  userAnswer: "正解",
                  correctAnswer: "正解",
                  isCorrect: true,
                },
                {
                  questionOrder: 2,
                  questionText:
                    "問題2__の言葉の読み方として最もよいものを、1から一つ選びなさい。",
                  userAnswer: "",
                  correctAnswer: "正解",
                  isCorrect: false,
                },
                {
                  questionOrder: 3,
                  questionText:
                    "問題3__の言葉の読み方として最もよいものを、1から一つ選びなさい。",
                  userAnswer: "間違い",
                  correctAnswer: "正解",
                  isCorrect: false,
                },
              ],
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [participantId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Không tìm thấy kết quả</p>
      </div>
    );
  }

  const filteredQuestions = result.sections.flatMap((section) =>
    section.questions.filter((q) => {
      if (activeTab === "correct") return q.isCorrect;
      if (activeTab === "wrong") return !q.isCorrect && q.userAnswer !== "";
      return true;
    })
  );

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Trở về</span>
        </button>

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
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Kết quả luyện đề: JLPT-N1 07 2024
        </h1>

        {/* Score Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <h2 className="text-center text-yellow-600 font-semibold text-lg mb-4">
              Điểm số của bạn
            </h2>
            <div className="relative w-48 h-48">
              {/* Background Circle */}
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
                  strokeDasharray={`${
                    (result.score / result.totalQuestions) * 553
                  } 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold text-emerald-500">
                  {result.score}
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
              {result.correctAnswers}
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-red-300 p-6 text-center">
            <div className="text-red-500 text-3xl mb-2">✖️</div>
            <div className="text-sm text-gray-600 mb-1">Số câu sai</div>
            <div className="text-3xl font-bold text-red-600">
              {result.wrongAnswers}
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-300 p-6 text-center">
            <div className="text-gray-400 text-3xl mb-2">⭘</div>
            <div className="text-sm text-gray-600 mb-1">Bỏ qua</div>
            <div className="text-3xl font-bold text-gray-600">
              {result.skippedAnswers}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === "all"
                ? "bg-teal-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Đáp án
          </button>
          <button
            onClick={() => setActiveTab("correct")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              activeTab === "correct"
                ? "bg-teal-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Đề & Đáp án
          </button>
        </div>

        {/* Section Title */}
        <div className="bg-teal-500 text-white rounded-lg px-6 py-4 mb-6">
          <h2 className="text-lg font-semibold">Phần 1: Từ vựng / Ngữ pháp</h2>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {result.sections.map((section) => (
            <div key={section.sectionOrder}>
              {/* Section Header */}
              <div className="bg-gray-700 text-white px-6 py-4 rounded-t-lg">
                <p className="text-base">
                  問題1__の言葉の読み方として最もよいものを、1から一つ選びなさい。
                </p>
              </div>

              {/* Questions */}
              <div className="bg-white rounded-b-lg divide-y divide-gray-200">
                {section.questions.map((question) => (
                  <div
                    key={question.questionOrder}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                        {question.questionOrder}
                      </div>
                      <div className="flex items-center gap-2">
                        {question.isCorrect ? (
                          <>
                            <span className="text-2xl">✅</span>
                            <span className="text-emerald-600 font-medium">
                              {question.questionOrder}
                            </span>
                          </>
                        ) : question.userAnswer === "" ? (
                          <>
                            <span className="text-2xl">⭘</span>
                            <span className="text-gray-400 font-medium">
                              {question.questionOrder}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl">❌</span>
                            <span className="text-red-600 font-medium">
                              {question.questionOrder}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {!question.isCorrect && question.userAnswer && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Bạn chọn:
                          </span>
                          <span className="text-red-600 font-medium">
                            {question.userAnswer}
                          </span>
                        </div>
                      )}
                      {!question.isCorrect && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Đáp án:</span>
                          <span className="text-emerald-600 font-medium">
                            {question.correctAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Vocabulary Sidebar Preview */}
        <div className="mt-8 bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Vocabulary</h3>
              <p className="text-sm text-gray-600 mb-3">
                Tips! Bồi đen vấn bản để dịch và thêm vào phần từ vựng
              </p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">📄</span>
                </div>
                <p className="text-sm text-gray-500">
                  Bôi đen vấn bản để thêm vào phần từ vựng
                </p>
              </div>
              <button className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                Nhập vẫn bản để dịch
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
