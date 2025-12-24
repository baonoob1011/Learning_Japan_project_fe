"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { typeInstructionStyles } from "@/config/questionTypeMap";
import { questionService, QuestionApiResponse } from "@/services/question";
import { AssessmentType } from "@/enums/assessmentType";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const durationParam = searchParams.get("duration");
  const duration = durationParam ? Number(durationParam) : 170; // phút

  const [timeLeft, setTimeLeft] = useState(duration * 60); // giây
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const questionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Reset timer nếu duration thay đổi
  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Fetch questions
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

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
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
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Trở về</span>
        </button>
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
                    questionRefs.current[question.id] = el;
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
                            answers[question.id] === option.label
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.label}
                            checked={answers[question.id] === option.label}
                            onChange={() =>
                              handleAnswerChange(question.id, option.label)
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

        {/* Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-screen">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="text-center mb-4">
              <span className="font-mono text-3xl font-bold text-emerald-500">
                {formatTime(timeLeft)}
              </span>
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
            <button className="px-10 py-2.5 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition text-sm shadow-lg">
              Nộp bài
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
