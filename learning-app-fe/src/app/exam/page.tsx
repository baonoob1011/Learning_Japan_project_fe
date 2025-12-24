"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { typeInstructionStyles } from "@/config/questionTypeMap";
import { questionService, QuestionApiResponse } from "@/services/question";
import { AssessmentType } from "@/enums/assessmentType";
import { useRouter, useSearchParams } from "next/navigation";
import { examService } from "@/services/exam";
import BackButton from "@/components/backButton";

const stringToAssessmentType: Record<string, AssessmentType> = {
  KANJI_READING: AssessmentType.KANJI_READING,
  KANJI_MEMORY: AssessmentType.KANJI_MEMORY,
  VOCAB_CONTEXT: AssessmentType.VOCAB_CONTEXT,
  GRAMMAR_SELECT: AssessmentType.FILL_BLANK,
  SENTENCE_ORDER: AssessmentType.SENTENCE_ORDER,
  PARAPHRASE: AssessmentType.FILL_BLANK,
  TEXT_COMPLETION: AssessmentType.FILL_BLANK,
  READING_SHORT: AssessmentType.READING_SHORT,
  READING_MEDIUM: AssessmentType.READING_SHORT,
};

interface Question {
  id: string;
  questionType: string;
  text: string;
  options: { label: string; text: string }[];
  answer: string;
  orderNum: number;
}

export default function ExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(170 * 60);
  const [mounted, setMounted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);

  const [examResult, setExamResult] = useState<{
    score: number;
    answeredCount: number;
    totalQuestions: number;
    finishedAt: string;
  } | null>(null);
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const participantId = searchParams.get("participantId");

  useEffect(() => {
    const savedTime = localStorage.getItem("examTimeLeft");
    const savedParticipantId = localStorage.getItem("examParticipantId");
    const durationParam = searchParams.get("duration");
    const durationInSec = durationParam ? Number(durationParam) : 170 * 60;

    // Nếu participantId thay đổi (đề mới) hoặc chưa có savedParticipantId, reset time
    const isNewExam =
      !savedParticipantId ||
      (participantId && savedParticipantId !== participantId);

    const initialTime =
      savedTime && !isNewExam ? Number(savedTime) : durationInSec;

    // Lưu participantId hiện tại
    if (participantId) {
      localStorage.setItem("examParticipantId", participantId);
    }

    // Reset time về giá trị mới nếu là đề mới
    if (isNewExam) {
      localStorage.setItem("examTimeLeft", initialTime.toString());
    }

    Promise.resolve().then(() => {
      setTimeLeft(initialTime);
      setMounted(true);
    });
  }, [searchParams, participantId]);

  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev <= 0 ? 0 : prev - 1;
        localStorage.setItem("examTimeLeft", newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const apiResult: QuestionApiResponse[] = await questionService.getAll();
        apiResult.sort((a, b) => a.orderNum - b.orderNum);

        const mappedQuestions: Question[] = apiResult.map((q) => ({
          id: q.id,
          questionType: q.questionType,
          text: q.questionText,
          options: JSON.parse(q.options).map((text: string, i: number) => ({
            label: String(i + 1),
            text,
          })),
          answer: q.answer,
          orderNum: q.orderNum,
        }));

        setQuestions(mappedQuestions);
      } catch (err) {
        console.error("Lỗi khi lấy câu hỏi:", err);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerChange = (questionId: string, answerText: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerText }));
  };

  const handleSubmitClick = () => {
    if (!participantId) {
      alert("Không tìm thấy participantId!");
      return;
    }

    const unanswered = questions.length - Object.keys(answers).length;
    setUnansweredCount(unanswered);
    setShowConfirmModal(true);
  };

  const handleSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    if (!participantId) {
      alert("Không tìm thấy participantId!");
      setIsSubmitting(false);
      return;
    }

    try {
      const answersArray = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      console.log("Payload gửi đi:", {
        participantId,
        answers: answersArray,
      });

      const payload = {
        participantId,
        answers: answersArray,
      };

      const result = await examService.submitExam(payload);
      console.log("Submit result:", result);

      // Xóa dữ liệu localStorage
      localStorage.removeItem("examTimeLeft");
      localStorage.removeItem("examParticipantId");

      // Cập nhật trạng thái result
      setExamResult({
        score: result.score,
        answeredCount: answersArray.length,
        totalQuestions: questions.length,
        finishedAt: result.finishedAt,
      });

      // --- Redirect sang /breakTime ---
      router.push("/breakPage");
    } catch (err) {
      console.error("Submit thất bại:", err);

      if (err instanceof Error) {
        alert(`Gửi bài thất bại: ${err.message}`);
      } else {
        alert("Gửi bài thất bại, vui lòng thử lại.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToQuestion = (questionId: string) => {
    questionRefs.current[questionId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const questionGroups = React.useMemo(() => {
    const typeMap: { [key: string]: Question[] } = {};
    questions.forEach((q) => {
      if (!typeMap[q.questionType]) typeMap[q.questionType] = [];
      typeMap[q.questionType].push(q);
    });

    const typeOrder = [
      {
        key: "KANJI_READING",
        label: "問題1",
        assessmentType: AssessmentType.KANJI_READING,
      },
      {
        key: "KANJI_MEMORY",
        label: "問題2",
        assessmentType: AssessmentType.KANJI_MEMORY,
      },
      {
        key: "VOCAB_CONTEXT",
        label: "問題3",
        assessmentType: AssessmentType.VOCAB_CONTEXT,
      },
      {
        key: "GRAMMAR_SELECT",
        label: "問題4",
        assessmentType: AssessmentType.FILL_BLANK,
      },
      {
        key: "SENTENCE_ORDER",
        label: "問題5",
        assessmentType: AssessmentType.SENTENCE_ORDER,
      },
      {
        key: "PARAPHRASE",
        label: "問題6",
        assessmentType: AssessmentType.FILL_BLANK,
      },
      {
        key: "TEXT_COMPLETION",
        label: "問題7",
        assessmentType: AssessmentType.FILL_BLANK,
      },
      {
        key: "READING_SHORT",
        label: "問題8",
        assessmentType: AssessmentType.READING_SHORT,
      },
      {
        key: "READING_MEDIUM",
        label: "問題9",
        assessmentType: AssessmentType.READING_SHORT,
      },
    ];

    return typeOrder
      .filter((type) => typeMap[type.key] && typeMap[type.key].length > 0)
      .map((type) => ({
        key: type.key,
        label: type.label,
        assessmentType: type.assessmentType,
        questions: typeMap[type.key].sort((a, b) => a.orderNum - b.orderNum),
      }));
  }, [questions]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Confirm Submit Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Nộp bài</h2>
              <p className="text-gray-600 text-base">
                Bạn có chắc chắn muốn nộp bài không?
              </p>
              {unansweredCount > 0 && (
                <p className="text-gray-500 text-sm mt-2">
                  Bạn còn{" "}
                  <span className="font-bold text-amber-600">
                    {unansweredCount} câu
                  </span>{" "}
                  chưa trả lời
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-full font-medium hover:bg-emerald-600 transition shadow-lg"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && examResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all">
            <div className="mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Nộp bài thành công!
              </h2>
              <p className="text-gray-600">
                Chúc mừng bạn đã hoàn thành bài thi
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 mb-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Điểm số của bạn</p>
                <p className="text-5xl font-bold text-emerald-600">
                  {examResult.score}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-600 mb-1">Số câu đã làm</p>
                  <p className="text-xl font-bold text-gray-900">
                    {examResult.answeredCount}/{examResult.totalQuestions}
                  </p>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-600 mb-1">Hoàn thành lúc</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(examResult.finishedAt).toLocaleTimeString(
                      "vi-VN",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/practice")}
              className="w-full bg-emerald-500 text-white py-3 rounded-full font-medium hover:bg-emerald-600 transition shadow-lg"
            >
              Về trang luyện tập
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <BackButton to="/practice" />
        <div className="text-2xl">🐸</div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            🛍️ Sản phẩm
          </button>
          <button className="text-xl">🍜</button>
          <button className="text-xl">🎮</button>
          <button className="flex items-center gap-1 text-gray-600">
            🇻🇳 VN
          </button>
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            B
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white border-b border-gray-200 px-12 py-4 sticky top-0 z-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              JLPT N5 ÔN TẬP 11
            </h1>
            <p className="text-base text-gray-600">
              言語知識（文字・漢字・文法）・読解
            </p>
          </div>

          <div className="px-12 py-6 max-w-6xl">
            {questions.map((question, idx) => {
              const typeKey =
                stringToAssessmentType[question.questionType] ??
                AssessmentType.FILL_BLANK;
              const showTypeChange =
                idx === 0 ||
                questions[idx - 1].questionType !== question.questionType;

              const currentGroup = questionGroups.find(
                (g) => g.key === question.questionType
              );

              return (
                <div
                  key={question.id}
                  ref={(el) => {
                    questionRefs.current[question.id] = el ?? null;
                  }}
                  className="mb-8"
                >
                  {showTypeChange && (
                    <>
                      <div className="mb-4 pb-2 border-b-2 border-gray-300">
                        <h2 className="text-lg font-bold text-gray-800">
                          {currentGroup?.label}
                        </h2>
                      </div>
                      <div className="bg-gray-900 text-white rounded-lg p-4 mb-6">
                        <p className="text-base">
                          {typeInstructionStyles[typeKey]?.instruction ??
                            "Chọn đáp án đúng."}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="mb-5">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-full text-base font-bold mb-3">
                        {question.orderNum}
                      </div>
                      <h3 className="text-lg font-normal text-gray-900">
                        {question.orderNum}. {question.text}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <label
                          key={option.label}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition ${
                            answers[question.id] === option.text
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.text}
                            checked={answers[question.id] === option.text}
                            onChange={() =>
                              handleAnswerChange(question.id, option.text)
                            }
                            className="w-5 h-5 text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className="text-base text-gray-900">
                            {option.label} {option.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="text-center mb-4">
              <span className="font-mono text-3xl font-bold text-emerald-500">
                {mounted ? formatTime(timeLeft) : "02:50:00"}
              </span>
            </div>

            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                Đã làm:{" "}
                <span className="font-bold text-emerald-600">
                  {Object.keys(answers).length}
                </span>{" "}
                / {questions.length}
              </p>
            </div>

            {questionGroups.map((group, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  {group.label}:
                </h3>
                <div className="grid grid-cols-6 gap-1.5">
                  {group.questions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(q.id)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition ${
                        answers[q.id]
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {q.orderNum}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-center">
            <button
              className={`px-10 py-2.5 rounded-full font-medium text-sm shadow-lg transition ${
                isSubmitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
              disabled={isSubmitting}
              onClick={handleSubmitClick}
            >
              {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
