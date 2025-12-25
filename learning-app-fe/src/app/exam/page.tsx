"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { examService, SectionWithQuestionsResponse } from "@/services/exam";
import BackButton from "@/components/backButton";
import { QUESTION_TYPE_ORDER } from "@/config/questionTypeOrder";
import { LISTENING_TYPE_ORDER } from "@/config/listeningTypeOrder";
import { useExamResultStore } from "@/stores/examResultStore";
import { AssessmentType } from "@/enums/assessmentType";
import { instructionMap } from "@/config/instructionMap";

interface Question {
  id: string;
  sectionOrder: number;
  questionOrder: number;
  questionType: string;
  text: string;
  options: { label: string; text: string }[];
  answer: string;
  imageUrl?: string;
  audioUrl?: string;
}

interface Section {
  id: string;
  examId: string;
  title: string;
  sectionDuration: number;
  sectionOrder: number;
}

interface QuestionGroup {
  mondaiLabel: string;
  questionType: string;
  assessmentType: AssessmentType;
  questions: Question[];
}

export default function ExamPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const participantId = searchParams.get("participantId");
  const sectionParam = searchParams.get("section");
  const sectionFromUrl = sectionParam ? Number(sectionParam) : 1;
  const examId = searchParams.get("examId");

  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionOrder, setCurrentSectionOrder] =
    useState(sectionFromUrl);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [allAnswers, setAllAnswers] = useState<Record<string, string>>({});
  const mergedAnswers = { ...allAnswers, ...answers };
  const setResult = useExamResultStore((state) => state.setResult);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ------------------ PREVENT BACK NAVIGATION ------------------ */
  useEffect(() => {
    const completedSectionStr = localStorage.getItem("examCompletedSection");
    const completedSection = completedSectionStr
      ? Number(completedSectionStr)
      : 0;

    // If user tries to access a section they've already completed, redirect forward
    if (currentSectionOrder <= completedSection) {
      const nextSection = completedSection + 1;
      router.replace(
        `/breakPage?participantId=${participantId}&examId=${examId}&nextSection=${nextSection}`
      );
      return;
    }

    // Prevent browser back button
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentSectionOrder, participantId, examId, router]);

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

  /* ------------------ FETCH QUESTIONS & SECTIONS ------------------ */
  useEffect(() => {
    if (!examId) return;

    const fetchQuestions = async () => {
      try {
        const sectionsData: SectionWithQuestionsResponse[] =
          await examService.getSections(examId);

        console.log("📦 Sections data from API:", sectionsData);

        const sectionsInfo: Section[] = sectionsData.map((s) => ({
          id: s.id,
          examId: s.examId,
          title: s.title,
          sectionDuration: s.sectionDuration,
          sectionOrder: s.sectionOrder,
        }));
        setSections(sectionsInfo);
        console.log("✅ Sections info:", sectionsInfo);

        const mapped = sectionsData.flatMap((section) =>
          section.questions.map((q) => {
            let parsedOptions: { label: string; text: string }[] = [];
            try {
              const optionsArray: string[] = JSON.parse(q.options);
              parsedOptions = optionsArray.map((text, index) => ({
                label: String(index + 1),
                text: text,
              }));
            } catch (err) {
              console.error("Error parsing options for question:", q.id, err);
              parsedOptions = [];
            }

            return {
              id: q.id,
              sectionOrder: section.sectionOrder,
              questionOrder: q.questionOrder,
              questionType: q.questionType,
              text: q.questionText,
              options: parsedOptions,
              answer: q.answer,
              imageUrl: q.imageUrl,
              audioUrl: q.audioUrl,
            };
          })
        );

        console.log("📝 All mapped questions:", mapped);
        console.log("📊 Questions by section:", {
          section1: mapped.filter((q) => q.sectionOrder === 1).length,
          section2: mapped.filter((q) => q.sectionOrder === 2).length,
        });

        setQuestions(mapped);
      } catch (err) {
        console.error("Lỗi fetch questions:", err);
      }
    };

    fetchQuestions();
  }, [examId]);

  /* ------------------ TIMER - Reset khi đổi section ------------------ */
  useEffect(() => {
    if (sections.length === 0) return;

    const currentSection = sections.find(
      (s) => s.sectionOrder === currentSectionOrder
    );
    if (!currentSection) return;

    const savedTime = localStorage.getItem(
      `examTimeLeft_section_${currentSectionOrder}`
    );
    const savedParticipantId = localStorage.getItem("examParticipantId");

    const isNewExam =
      !savedParticipantId ||
      (participantId && savedParticipantId !== participantId);

    const durationInSec = currentSection.sectionDuration * 60;

    const initialTime =
      savedTime && !isNewExam ? Number(savedTime) : durationInSec;

    if (participantId) {
      localStorage.setItem("examParticipantId", participantId);
    }

    if (isNewExam || !savedTime) {
      localStorage.setItem(
        `examTimeLeft_section_${currentSectionOrder}`,
        initialTime.toString()
      );
    }

    setTimeLeft(initialTime);
    setMounted(true);
  }, [sections, currentSectionOrder, participantId]);

  /* ------------------ COUNTDOWN TIMER ------------------ */
  useEffect(() => {
    if (!mounted || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const t = prev > 0 ? prev - 1 : 0;
        localStorage.setItem(
          `examTimeLeft_section_${currentSectionOrder}`,
          t.toString()
        );
        return t;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, isSubmitting, currentSectionOrder]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ------------------ CURRENT QUESTIONS - SORTED BY questionOrder ------------------ */
  const currentQuestions = useMemo(() => {
    const filtered = questions.filter(
      (q) => q.sectionOrder === currentSectionOrder
    );
    const sorted = filtered.sort((a, b) => a.questionOrder - b.questionOrder);
    console.log(
      `🔍 Questions for section ${currentSectionOrder} sorted by questionOrder:`,
      sorted.map((q) => ({ order: q.questionOrder, type: q.questionType }))
    );
    return sorted;
  }, [questions, currentSectionOrder]);

  /* ------------------ GROUP QUESTIONS - Maintain questionOrder ------------------ */
  const groupedQuestions = useMemo((): QuestionGroup[] => {
    const currentSection = sections.find(
      (s) => s.sectionOrder === currentSectionOrder
    );

    const orderList = currentSection?.title.toLowerCase().includes("listening")
      ? LISTENING_TYPE_ORDER
      : QUESTION_TYPE_ORDER;

    const typeToAssessmentMap = new Map(
      orderList.map((item) => [item.key, item.assessmentType])
    );

    const groups: QuestionGroup[] = [];
    let currentGroup: QuestionGroup | null = null;
    let mondaiIndex = 1;

    currentQuestions.forEach((question) => {
      const assessmentType = typeToAssessmentMap.get(question.questionType);

      if (!assessmentType) {
        console.warn(`Unknown question type: ${question.questionType}`);
        return;
      }

      if (
        !currentGroup ||
        currentGroup.questionType !== question.questionType
      ) {
        if (currentGroup) {
          groups.push(currentGroup);
          mondaiIndex++;
        }

        currentGroup = {
          mondaiLabel: `問題${mondaiIndex}`,
          questionType: question.questionType,
          assessmentType: assessmentType,
          questions: [question],
        };
      } else {
        currentGroup.questions.push(question);
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    console.log(
      "📋 Final grouped questions:",
      groups.map((g) => ({
        label: g.mondaiLabel,
        type: g.questionType,
        count: g.questions.length,
        orders: g.questions.map((q) => q.questionOrder),
      }))
    );

    return groups;
  }, [currentQuestions, currentSectionOrder, sections]);

  const answeredCount = currentQuestions.filter(
    (q) => mergedAnswers[q.id] !== undefined
  ).length;

  const TOTAL_SECTIONS = sections.length;

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
    if (!participantId || !examId) {
      alert("Thiếu thông tin participantId hoặc examId!");
      return;
    }

    const merged = { ...allAnswers, ...answers };
    localStorage.setItem("examAllAnswers", JSON.stringify(merged));
    setAllAnswers(merged);

    if (currentSectionOrder < TOTAL_SECTIONS) {
      localStorage.setItem(
        "examCompletedSection",
        currentSectionOrder.toString()
      );

      router.push(
        `/breakPage?participantId=${participantId}&examId=${examId}&nextSection=${
          currentSectionOrder + 1
        }`
      );
    } else {
      setIsSubmitting(true);
      try {
        const response = await examService.submitExam({
          participantId,
          answers: Object.entries(merged).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        });

        if (response) {
          setResult(response);
        }

        localStorage.removeItem("examAllAnswers");
        sections.forEach((s) => {
          localStorage.removeItem(`examTimeLeft_section_${s.sectionOrder}`);
        });
        localStorage.removeItem("examParticipantId");
        localStorage.removeItem("examCompletedSection");

        router.push(`/result?participantId=${participantId}`);
      } catch (err) {
        console.error("Submit thất bại:", err);
        alert("Gửi bài thất bại, vui lòng thử lại.");
      } finally {
        setIsSubmitting(false);
        setAnswers({});
      }
    }
  };

  const scrollToQuestion = (questionId: string) => {
    questionRefs.current[questionId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const currentSection = sections.find(
    (s) => s.sectionOrder === currentSectionOrder
  );

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentSectionOrder === 1 && <BackButton />}
            <h1 className="text-xl font-semibold text-gray-800">
              Phần {currentSectionOrder}: {currentSection?.title || ""}
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
            {groupedQuestions.map((group) => (
              <div
                key={`${group.questionType}-${group.mondaiLabel}`}
                className="mb-8"
              >
                {/* Instruction Banner */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-6 py-4 rounded-t-lg mb-0">
                  <p className="text-base font-medium">
                    {group.mondaiLabel}
                    {instructionMap[group.assessmentType]?.replace(
                      "問題",
                      ""
                    ) || ""}
                  </p>
                </div>

                {/* Questions in this group */}
                {group.questions.map((q, index) => {
                  const isLastInGroup = index === group.questions.length - 1;
                  return (
                    <div
                      key={q.id}
                      ref={(el) => {
                        questionRefs.current[q.id] = el;
                      }}
                      className={`bg-white border-x border-b border-gray-200 p-6 shadow-sm ${
                        isLastInGroup ? "rounded-b-lg mb-8" : ""
                      }`}
                    >
                      {/* Question Text */}
                      <div className="mb-5">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-500 text-white rounded-full text-base font-bold mb-3">
                          {q.questionOrder}
                        </div>
                        <h3 className="text-lg font-normal text-gray-900 leading-relaxed">
                          {q.text}
                        </h3>
                      </div>

                      {/* Audio nếu có */}
                      {q.audioUrl && (
                        <div className="mb-4">
                          <audio controls className="w-full">
                            <source src={q.audioUrl} type="audio/mpeg" />
                            Trình duyệt không hỗ trợ audio.
                          </audio>
                        </div>
                      )}

                      {/* Image nếu có */}
                      {q.imageUrl && (
                        <div className="mb-4">
                          <img
                            src={q.imageUrl}
                            alt="Question image"
                            className="max-w-full h-auto rounded-lg"
                          />
                        </div>
                      )}

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
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="text-center mb-4">
              <span className="font-mono text-3xl font-bold text-emerald-500">
                {mounted ? formatTime(timeLeft) : "00:00:00"}
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

            {/* Grouped Question Navigation */}
            <div className="space-y-6">
              {groupedQuestions.map((group) => (
                <div key={`${group.questionType}-${group.mondaiLabel}`}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    {group.mondaiLabel}:
                  </h3>
                  <div className="grid grid-cols-6 gap-1.5">
                    {group.questions.map((q) => {
                      return (
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
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  );
}
