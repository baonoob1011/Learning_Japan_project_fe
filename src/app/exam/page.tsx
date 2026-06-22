"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  examService,
  SectionWithQuestionsResponse,
} from "@/services/examService";
import { questionService, PassageResponse } from "@/services/questionService";
import { QUESTION_TYPE_ORDER } from "@/config/questionTypeOrder";
import { LISTENING_TYPE_ORDER } from "@/config/listeningTypeOrder";
import { useExamResultStore } from "@/stores/examResultStore";
import { AssessmentType } from "@/enums/assessmentType";
import { instructionMap } from "@/config/instructionMap";
import BreakComponent from "@/components/BreakComponent";

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
  passage?: PassageResponse;
  passageTitle?: string;
  passageContent?: string;
  sectionId?: string; // Link to specific section
  displayOrder?: number; // Sequential order for UI
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

function ExamContent() {
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
  const [showBreak, setShowBreak] = useState(false);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ------------------ PREVENT BACK NAVIGATION ------------------ */
  useEffect(() => {
    const completedSectionStr = localStorage.getItem("examCompletedSection");
    const completedSection = completedSectionStr
      ? Number(completedSectionStr)
      : 0;

    if (currentSectionOrder <= completedSection) {
      const nextSection = completedSection + 1;
      setShowBreak(true);
      return;
    }

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

  /* ------------------ PREVENT PAGE REFRESH ------------------ */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "Bạn có chắc muốn rời khỏi trang? Tiến trình làm bài có thể bị mất.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

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

  /* ------------------ JLPT TIMER LOGIC ------------------ */
  const calculateInferredDuration = (
    level: string,
    title: string,
    totalDuration: number,
    numSections: number
  ) => {
    if (numSections <= 1) return totalDuration;

    // Durations based on JLPT standard tables (in minutes)
    // lkr: Language Knowledge & Reading (combined)
    // vkg: Vocabulary, Kanji, Grammar (part 1)
    // gr: Grammar & Reading (part 2)
    // listening: Listening (part 3)
    const standards: Record<string, { lkr?: number; vkg?: number; gr?: number; listening: number }> = {
      N1: { lkr: 110, listening: 55 },
      N2: { lkr: 105, listening: 50 },
      N3: { vkg: 30, gr: 70, listening: 40 },
      N4: { vkg: 25, gr: 55, listening: 35 },
      N5: { vkg: 20, gr: 40, listening: 30 },
    };

    const std = standards[level] || standards["N4"];
    const stdTotal = (std.lkr || ((std.vkg || 0) + (std.gr || 0))) + std.listening;
    const lowerTitle = title.toLowerCase();

    // 1. Listening
    if (lowerTitle.includes("listening") || lowerTitle.includes("nghe")) {
      return Math.floor((std.listening / stdTotal) * totalDuration);
    }

    // 2. Vocabulary/Kanji (if separate)
    if (lowerTitle.includes("vocabulary") || lowerTitle.includes("từ vựng") || lowerTitle.includes("chữ hán")) {
      if (std.vkg) return Math.floor((std.vkg / stdTotal) * totalDuration);
    }

    // 3. Grammar/Reading (if separate)
    if (lowerTitle.includes("grammar") || lowerTitle.includes("reading") || lowerTitle.includes("đọc hiểu") || lowerTitle.includes("ngữ pháp")) {
      if (std.gr) return Math.floor((std.gr / stdTotal) * totalDuration);
    }

    // Fallback for combined Language Knowledge & Reading
    const lkrBase = std.lkr || ((std.vkg || 0) + (std.gr || 0));
    return Math.ceil((lkrBase / stdTotal) * totalDuration);
  };

  /* ------------------ FETCH QUESTIONS & SECTIONS ------------------ */
  useEffect(() => {
    if (!examId) return;

    const fetchQuestions = async () => {
      try {
        // Fetch sections and exam details in parallel
        const [sectionsData, examInfo] = await Promise.all([
          examService.getSections(examId),
          examService.getById(examId)
        ]);

        console.log("📦 Sections data from API:", sectionsData);
        console.log("🏆 Exam data from API:", examInfo);

        const sectionsInfo: Section[] = sectionsData.map((s) => {
          let duration = s.sectionDuration;

          // If duration is 0, infer it from JLPT standards
          if (duration === 0) {
            duration = calculateInferredDuration(
              examInfo.level,
              s.title,
              examInfo.duration,
              sectionsData.length
            );
          }

          return {
            id: s.id,
            examId: s.examId,
            title: s.title,
            sectionDuration: duration,
            sectionOrder: s.sectionOrder,
          };
        });

        setSections(sectionsInfo);
        console.log("✅ Sections info (with durations):", sectionsInfo);

        const allQuestions: any[] = [];
        sectionsData.forEach((section) => {
          if (section.questions) {
            section.questions.forEach((q: any) => {
              allQuestions.push({
                ...q,
                sectionId: section.id,
                sectionOrder: section.sectionOrder
              });
            });
          }
        });

        const rawQuestions = allQuestions.length > 0 ? allQuestions : await questionService.getByExamId(examId);

        const mapped = rawQuestions.map((q, index) => {
          let parsedOptions: { label: string; text: string }[] = [];
          const optionsArray: string[] = Array.isArray(q.options) ? q.options : [];

          parsedOptions = optionsArray.map((text, idx) => {
            let cleanedText = text || "";
            if (typeof cleanedText === "string") {
              // Remove [ at start and ] at end
              cleanedText = cleanedText.replace(/^\[|\]$/g, "").trim();
            }
            return {
              label: String(idx + 1),
              text: cleanedText,
            };
          });

          const recoveredSectionOrder = q.sectionOrder || 1;

          const finalPassage = q.passage || (q.passageTitle ? {
            id: `p-${q.id}`,
            title: q.passageTitle,
            content: q.passageContent || "",
            passageOrder: "0"
          } : undefined);

          return {
            id: q.id,
            sectionId: q.sectionId,
            sectionOrder: recoveredSectionOrder,
            questionOrder: q.questionOrder || (index + 1),
            questionType: q.questionType,
            text: q.questionText,
            options: parsedOptions,
            answer: q.answer,
            imageUrl: q.imageUrl,
            audioUrl: q.audioUrl,
            passage: finalPassage,
            passageTitle: q.passageTitle,
            passageContent: q.passageContent
          };
        });

        console.log("📝 All mapped questions ready:", mapped);
        setQuestions(mapped);
      } catch (err) {
        console.error("Lỗi fetch questions hoặc exam:", err);
      }
    };

    fetchQuestions();
  }, [examId]);

  /* ------------------ TIMER BLOCKS (SHARED TIMER) ------------------ */
  const getBlockOriginOrder = useCallback((sectionsList: Section[], currentOrder: number) => {
    if (sectionsList.length === 0) return currentOrder;
    let origin = currentOrder;
    // Walk back to find the first section with same duration (shared timer block)
    for (let i = currentOrder - 1; i >= 1; i--) {
      const prev = sectionsList.find((s) => s.sectionOrder === i);
      const curr = sectionsList.find((s) => s.sectionOrder === i + 1);
      if (prev && curr && prev.sectionDuration === curr.sectionDuration) {
        origin = i;
      } else {
        break;
      }
    }
    return origin;
  }, []);

  /* ------------------ TIMER - Reset khi đổi section ------------------ */
  useEffect(() => {
    if (sections.length === 0) return;

    const currentSection = sections.find(
      (s) => s.sectionOrder === currentSectionOrder
    );
    if (!currentSection) return;

    // Use block origin as the persistent key for shared timer
    const blockOrigin = getBlockOriginOrder(sections, currentSectionOrder);
    const storageKey = `examTimeLeft_block_${blockOrigin}`;

    const savedTime = localStorage.getItem(storageKey);
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
      localStorage.setItem(storageKey, initialTime.toString());
    }

    setTimeLeft(initialTime);
    setMounted(true);
  }, [sections, currentSectionOrder, participantId, getBlockOriginOrder]);

  /* ------------------ COUNTDOWN TIMER ------------------ */
  useEffect(() => {
    if (!mounted || isSubmitting || sections.length === 0) return;

    const blockOrigin = getBlockOriginOrder(sections, currentSectionOrder);
    const storageKey = `examTimeLeft_block_${blockOrigin}`;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const t = prev > 0 ? prev - 1 : 0;
        localStorage.setItem(storageKey, t.toString());
        return t;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted, isSubmitting, currentSectionOrder, sections, getBlockOriginOrder]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  /* ------------------ CURRENT QUESTIONS - SORTED BY questionOrder ------------------ */
  /* ------------------ CURRENT QUESTIONS - With Sequential displayOrder ------------------ */
  const currentQuestions = useMemo(() => {
    const activeSection = sections.find(s => s.sectionOrder === currentSectionOrder);
    if (!activeSection) return [];

    const filtered = questions.filter(
      (q) => (q.sectionId ? q.sectionId === activeSection.id : q.sectionOrder === currentSectionOrder)
    );

    const sorted = [...filtered].sort((a, b) => a.questionOrder - b.questionOrder);

    // Assign sequential displayOrder (1, 2, 3...) for current section
    return sorted.map((q, idx) => ({
      ...q,
      displayOrder: idx + 1
    }));
  }, [questions, currentSectionOrder, sections]);

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
      let assessmentType = typeToAssessmentMap.get(question.questionType);

      if (!assessmentType) {
        console.warn(`Unknown question type: ${question.questionType}`);
        // Cố gắng ánh xạ trực tiếp nếu khớp với enum
        if (Object.values(AssessmentType).includes(question.questionType as AssessmentType)) {
          assessmentType = question.questionType as AssessmentType;
        } else {
          assessmentType = AssessmentType.VOCAB_CONTEXT;
        }
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

  const TOTAL_SECTIONS = useMemo(() => {
    const orders = [
      ...sections.map((s) => s.sectionOrder),
      ...questions.map((q) => q.sectionOrder),
    ];
    if (orders.length === 0) return 1;
    return Math.max(...orders);
  }, [sections, questions]);

  /* ------------------ HANDLE BREAK END ------------------ */
  const handleBreakEnd = () => {
    setShowBreak(false);
    const completedSectionStr = localStorage.getItem("examCompletedSection");
    const completedSection = completedSectionStr
      ? Number(completedSectionStr)
      : 0;
    const nextSection = completedSection + 1;
    setCurrentSectionOrder(nextSection);
    router.replace(
      `/exam?participantId=${participantId}&section=${nextSection}&examId=${examId}`
    );
  };

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

    const nextOrder = currentSectionOrder + 1;
    const currentBlockOrigin = getBlockOriginOrder(sections, currentSectionOrder);
    const nextBlockOrigin =
      nextOrder <= TOTAL_SECTIONS
        ? getBlockOriginOrder(sections, nextOrder)
        : -1;

    if (nextOrder <= TOTAL_SECTIONS && nextBlockOrigin === currentBlockOrigin) {
      // Cùng block -> Chuyển trực tiếp không nghỉ
      localStorage.setItem(
        "examCompletedSection",
        currentSectionOrder.toString()
      );
      setCurrentSectionOrder(nextOrder);
      setAnswers({});
      router.replace(
        `/exam?participantId=${participantId}&section=${nextOrder}&examId=${examId}`
      );
      window.scrollTo(0, 0);
    } else if (currentSectionOrder < TOTAL_SECTIONS) {
      localStorage.setItem(
        "examCompletedSection",
        currentSectionOrder.toString()
      );

      setShowBreak(true);
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

  // Show break component if needed
  if (showBreak && participantId && examId) {
    const completedSectionStr = localStorage.getItem("examCompletedSection");
    const completedSection = completedSectionStr
      ? Number(completedSectionStr)
      : 0;
    const nextSection = completedSection + 1;

    return (
      <BreakComponent
        participantId={participantId}
        nextSection={nextSection}
        examId={examId}
        onBreakEnd={handleBreakEnd}
      />
    );
  }

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-cyan-100 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
              Phần {currentSectionOrder}: {currentSection?.title || ""}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              Đã làm:{" "}
              <span className="font-semibold text-cyan-600">
                {answeredCount}/{currentQuestions.length}
              </span>
            </div>
            <div className="text-2xl font-mono font-semibold text-cyan-600">
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
                <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-6 py-4 rounded-t-lg mb-0 shadow-md">
                  <p className="text-base font-medium">
                    {group.mondaiLabel}
                    {instructionMap[group.assessmentType]?.replace(
                      "問題",
                      ""
                    ) || ""}
                  </p>
                </div>

                {/* Questions in this group, grouped by passage if exists */}
                {(() => {
                  const subGroups: { passage?: PassageResponse; questions: Question[] }[] = [];
                  let lastPassageId: string | undefined = undefined;

                  group.questions.forEach((q) => {
                    const currentPassageId = q.passage?.id;
                    if (subGroups.length === 0 || currentPassageId !== lastPassageId) {
                      subGroups.push({ passage: q.passage, questions: [q] });
                      lastPassageId = currentPassageId;
                    } else {
                      subGroups[subGroups.length - 1].questions.push(q);
                    }
                  });

                  return subGroups.map((sub, sIndex) => (
                    <div key={sub.passage?.id ? `sub-group-${sub.passage.id}-${sIndex}` : `no-passage-${sIndex}`} className="mb-4">
                      {sub.passage && (
                        <div className="bg-white border-2 border-cyan-100 p-8 rounded-lg mb-4 shadow-sm relative italic leading-relaxed text-gray-800 animate-in fade-in slide-in-from-top-2 duration-500">
                          {sub.passage.title && (
                            <h4 className="text-center font-bold mb-6 text-xl text-cyan-800">
                              {sub.passage.title}
                            </h4>
                          )}
                          <div className="whitespace-pre-wrap text-lg font-medium leading-loose">
                            {sub.passage.content}
                          </div>
                        </div>
                      )}

                      {sub.questions.map((q, qIndex) => {
                        const isLastInSubGroup = qIndex === sub.questions.length - 1;
                        const isLastOverall = sIndex === subGroups.length - 1 && isLastInSubGroup;

                        return (
                          <div
                            key={q.id}
                            ref={(el) => {
                              questionRefs.current[q.id] = el;
                            }}
                            className={`bg-white/90 backdrop-blur-sm border-x border-b border-cyan-100 p-6 shadow-sm ${isLastOverall ? "rounded-b-lg mb-8" : ""
                              }`}
                          >
                            {/* Question Text */}
                            <div className="mb-5">
                              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-full text-base font-bold mb-3 shadow-md">
                                {q.displayOrder || q.questionOrder}
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
                              <div className="mb-6 flex justify-center">
                                <img
                                  src={q.imageUrl}
                                  alt="Question image"
                                  className="max-w-[300px] h-auto rounded-xl shadow-md border border-cyan-100 animate-in zoom-in-95 duration-500"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            {/* Options */}
                            <div className="space-y-3">
                              {q.options.map((o) => (
                                <label
                                  key={o.label}
                                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition ${mergedAnswers[q.id] === o.text
                                    ? "border-cyan-400 bg-cyan-50"
                                    : "border-cyan-200 hover:bg-cyan-50/50"
                                    }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${q.id}`}
                                    checked={mergedAnswers[q.id] === o.text}
                                    onChange={() =>
                                      setAnswers((p) => ({ ...p, [q.id]: o.text }))
                                    }
                                    className="w-5 h-5 text-cyan-500 focus:ring-cyan-400"
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
                  ));
                })()}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white/80 backdrop-blur-sm border-l border-cyan-100 flex flex-col h-screen sticky top-0">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="text-center mb-4">
              <span className="font-mono text-3xl font-bold text-cyan-600">
                {mounted ? formatTime(timeLeft) : "00:00:00"}
              </span>
            </div>

            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                Đã làm:{" "}
                <span className="font-bold text-cyan-600">{answeredCount}</span>{" "}
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
                          className={`w-10 h-10 rounded-full text-sm font-medium transition shadow-sm ${mergedAnswers[q.id]
                            ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-md transform hover:scale-105"
                            : "bg-white text-gray-700 border-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300"
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

          <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-cyan-100 flex justify-center">
            <button
              className={`px-10 py-2.5 rounded-full font-medium text-sm shadow-lg transition ${isSubmitting
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white hover:shadow-xl hover:scale-105"
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
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent mb-3">
                Nộp bài
              </h2>
              <p className="text-gray-600 text-base">
                {currentSectionOrder < TOTAL_SECTIONS
                  ? (() => {
                    const nextOrder = currentSectionOrder + 1;
                    const currentBlockOrigin = getBlockOriginOrder(sections, currentSectionOrder);
                    const nextBlockOrigin = getBlockOriginOrder(sections, nextOrder);
                    return nextBlockOrigin === currentBlockOrigin
                      ? `Bạn có chắc chắn muốn nộp Phần ${currentSectionOrder} và chuyển sang phần tiếp theo?`
                      : `Bạn có chắc chắn muốn nộp Phần ${currentSectionOrder} và chuyển sang thời gian nghỉ?`;
                  })()
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
                className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white py-3 rounded-full font-medium hover:shadow-xl transition transform hover:scale-105"
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

export default function ExamPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-cyan-600">Đang tải dữ liệu...</div>}>
      <ExamContent />
    </React.Suspense>
  );
}
