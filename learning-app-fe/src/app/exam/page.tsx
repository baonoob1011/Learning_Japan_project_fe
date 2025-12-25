"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { typeInstructionStyles } from "@/config/questionTypeMap";
import { questionService, QuestionApiResponse } from "@/services/question";
import { AssessmentType } from "@/enums/assessmentType";
import { useRouter, useSearchParams } from "next/navigation";
import { examService } from "@/services/exam";
import BackButton from "@/components/backButton";
import { QUESTION_TYPE_ORDER } from "@/components/questionTypeOrder";
import { LISTENING_TYPE_ORDER } from "@/components/listeningTypeOrder";

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
  LISTENING_1: AssessmentType.LISTENING_TASK,
  LISTENING_2: AssessmentType.LISTENING_CHOICE_PREVIEW,
  LISTENING_3: AssessmentType.LISTENING_MAIN_IDEA,
  LISTENING_4: AssessmentType.LISTENING_RESPONSE,
  LISTENING_5: AssessmentType.LISTENING_LONG,
};

interface Question {
  id: string;
  sectionOrder: number;
  questionOrder: number;
  questionType: string;
  text: string;
  options: { label: string; text: string }[];
  answer: string;
}

export default function ExamPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const participantId = searchParams.get("participantId");
  const sectionParam = searchParams.get("section");
  const sectionFromUrl = sectionParam ? Number(sectionParam) : 1;

  const TOTAL_SECTIONS = 2;

  const [currentSectionOrder, setCurrentSectionOrder] =
    useState(sectionFromUrl);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({});
  const mergedAnswers = { ...allAnswers, ...answers };

  const [timeLeft, setTimeLeft] = useState(170 * 60);
  const [mounted, setMounted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ------------------ SYNC SECTION ------------------ */
  useEffect(() => {
    setCurrentSectionOrder(sectionFromUrl);
  }, [sectionFromUrl]);

  /* ------------------ LOAD SAVED ANSWERS ------------------ */
  useEffect(() => {
    const saved = localStorage.getItem("examAllAnswers");
    if (saved) {
      setAllAnswers(JSON.parse(saved));
    }
  }, []);

  /* ------------------ TIMER ------------------ */
  useEffect(() => {
    const savedTime = localStorage.getItem("examTimeLeft");
    const savedParticipantId = localStorage.getItem("examParticipantId");
    const durationParam = searchParams.get("duration");
    const durationInSec = durationParam ? Number(durationParam) : 170 * 60;

    const isNewExam =
      !savedParticipantId ||
      (participantId && savedParticipantId !== participantId);

    const initialTime =
      savedTime && !isNewExam ? Number(savedTime) : durationInSec;

    if (participantId) {
      localStorage.setItem("examParticipantId", participantId);
    }

    if (isNewExam) {
      localStorage.setItem("examTimeLeft", initialTime.toString());
    }

    setTimeLeft(initialTime);
    setMounted(true);
  }, [participantId, searchParams]);

  useEffect(() => {
    if (!mounted || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const t = prev > 0 ? prev - 1 : 0;
        localStorage.setItem("examTimeLeft", t.toString());
        return t;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mounted, isSubmitting]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ------------------ FETCH QUESTIONS ------------------ */
  useEffect(() => {
    const fetchQuestions = async () => {
      const api: QuestionApiResponse[] = await questionService.getAll();
      const mapped: Question[] = api.map((q) => ({
        id: q.id,
        questionType: q.questionType,
        text: q.questionText,
        options: JSON.parse(q.options).map((text: string, i: number) => ({
          label: String(i + 1),
          text,
        })),
        answer: q.answer,
        questionOrder: q.questionOrder,
        sectionOrder: q.sectionOrder,
      }));
      setQuestions(mapped);
    };
    fetchQuestions();
  }, []);

  const currentQuestions = useMemo(
    () =>
      questions
        .filter((q) => q.sectionOrder === currentSectionOrder)
        .sort((a, b) => a.questionOrder - b.questionOrder),
    [questions, currentSectionOrder]
  );

  const answeredCount = currentQuestions.filter(
    (q) => mergedAnswers[q.id] !== undefined
  ).length;

  /* ------------------ GROUP QUESTIONS ------------------ */
  const questionGroups = useMemo(() => {
    const map: Record<string, Question[]> = {};
    currentQuestions.forEach((q) => {
      map[q.questionType] = map[q.questionType] || [];
      map[q.questionType].push(q);
    });

    const order =
      currentSectionOrder === 1 ? QUESTION_TYPE_ORDER : LISTENING_TYPE_ORDER;

    return order
      .filter((o) => map[o.key])
      .map((o) => ({
        key: o.key,
        label: o.label,
        questions: map[o.key],
      }));
  }, [currentQuestions, currentSectionOrder]);

  /* ------------------ SUBMIT ------------------ */
  const handleSubmitClick = () => {
    if (!participantId) {
      alert("Không tìm thấy participantId!");
      return;
    }
    const unanswered = currentQuestions.length - answeredCount;
    setUnansweredCount(unanswered);
    setShowConfirmModal(true);
  };

  const handleSubmit = async () => {
    setShowConfirmModal(false);
    if (!participantId) return;

    // Merge answers hiện tại với answers đã lưu
    const merged = { ...allAnswers, ...answers };
    localStorage.setItem("examAllAnswers", JSON.stringify(merged));
    setAllAnswers(merged);
    setAnswers({});

    if (currentSectionOrder < TOTAL_SECTIONS) {
      // Lưu section đã hoàn thành
      localStorage.setItem(
        "examCompletedSection",
        currentSectionOrder.toString()
      );

      // Chuyển sang trang break time với nextSection
      router.push(
        `/breakPage?participantId=${participantId}&nextSection=${
          currentSectionOrder + 1
        }`
      );
    } else {
      // Đây là section cuối → submit API
      setIsSubmitting(true);
      try {
        await examService.submitExam({
          participantId,
          answers: Object.entries(merged).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        });

        // Clear tất cả localStorage sau khi submit thành công
        localStorage.removeItem("examAllAnswers");
        localStorage.removeItem("examTimeLeft");
        localStorage.removeItem("examParticipantId");
        localStorage.removeItem("examCompletedSection");

        // Chuyển về trang chủ hoặc trang kết quả
        router.push("/");
      } catch (err) {
        console.error("Submit thất bại:", err);
        alert("Gửi bài thất bại, vui lòng thử lại.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const scrollToQuestion = (questionId: string) => {
    questionRefs.current[questionId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-xl font-semibold text-gray-800">
              Phần {currentSectionOrder}:{" "}
              {currentSectionOrder === 1 ? "Kiến thức ngôn ngữ" : "Nghe hiểu"}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              Đã làm:{" "}
              <span className="font-semibold text-gray-900">
                {answeredCount}/{currentQuestions.length}
              </span>
            </div>
            <div className="text-2xl font-mono font-semibold text-emerald-600">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: Content + Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-12 py-8">
          <div className="max-w-4xl mx-auto">
            {questionGroups.map((group, groupIndex) => {
              const typeKey =
                stringToAssessmentType[group.key] ?? AssessmentType.FILL_BLANK;

              return (
                <div key={group.key} className={groupIndex > 0 ? "mt-12" : ""}>
                  {/* Question Type Header */}
                  <div className="mb-6 pb-3 border-b-2 border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {group.label}
                    </h2>
                  </div>

                  {/* Instruction Box */}
                  <div className="bg-gray-900 text-white rounded-lg p-4 mb-6">
                    <p className="text-base">
                      {typeInstructionStyles[typeKey]?.instruction ??
                        "Chọn đáp án đúng."}
                    </p>
                  </div>

                  {/* Questions in this group */}
                  {group.questions.map((q, qIndex) => (
                    <div
                      key={q.id}
                      ref={(el) => {
                        questionRefs.current[q.id] = el;
                      }}
                      className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${
                        qIndex > 0 ? "mt-6" : ""
                      }`}
                    >
                      {/* Question Text */}
                      <div className="mb-5">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-full text-base font-bold mb-3">
                          {q.questionOrder}
                        </div>
                        <h3 className="text-lg font-normal text-gray-900 leading-relaxed">
                          {q.questionOrder}. {q.text}
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        {q.options.map((o) => (
                          <label
                            key={o.label}
                            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition ${
                              mergedAnswers[q.id] === o.text
                                ? "border-emerald-500 bg-emerald-50"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={mergedAnswers[q.id] === o.text}
                              onChange={() =>
                                setAnswers((p) => ({ ...p, [q.id]: o.text }))
                              }
                              className="w-5 h-5 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-base text-gray-900">
                              {o.label}. {o.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0">
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
                  {answeredCount}
                </span>{" "}
                / {currentQuestions.length}
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
                        mergedAnswers[q.id]
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {q.questionOrder}
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

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Nộp bài</h2>
              <p className="text-gray-600 text-base">
                {currentSectionOrder < TOTAL_SECTIONS
                  ? `Bạn có chắc chắn muốn nộp Phần ${currentSectionOrder} và chuyển sang thời gian nghỉ?`
                  : "Bạn có chắc chắn muốn nộp bài thi? Sau khi nộp bạn sẽ không thể chỉnh sửa câu trả lời."}
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
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">🎉</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Nộp bài thành công!
            </h3>
            <p className="text-gray-600 mb-6">
              Bài thi của bạn đã được nộp. Kết quả sẽ được thông báo sau.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full px-5 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 font-medium transition-colors shadow-lg"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
