"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
  BookOpen,
  Headphones,
  PenTool,
  Type,
  Zap,
  ArrowRight,
  type LucideIcon,
  SearchX,
  Info,
  AlertCircle,
  X,
} from "lucide-react";
import { vocabService, VocabResponse, StudyMode, Skill } from "@/services/vocabService";

interface SmartStudyProps {
  isDarkMode: boolean;
  vocabs: VocabResponse[];
  onFinish: () => void;
}

// Skill is imported from vocabService

type QuestionItem = {
  id: string; // `${vocabId}:${skill}`
  vocabId: string;
  skill: Skill;
  round: number; // main=1, retry>=2
};

const SKILL_ICONS: Record<Skill, LucideIcon> = {
  READING: BookOpen,
  LISTENING: Headphones,
  TRANSLATION: Type,
  WRITING: Zap,
};

const SKILL_LABELS: Record<Skill, string> = {
  READING: "Nhận diện",
  LISTENING: "Nghe hiểu",
  TRANSLATION: "Chuyển ngữ",
  WRITING: "Thành thạo",
};

const SKILL_COLORS: Record<Skill, string> = {
  READING: "bg-blue-500",
  LISTENING: "bg-cyan-500",
  TRANSLATION: "bg-purple-500",
  WRITING: "bg-emerald-500",
};

const ORDERED_SKILLS: Skill[] = ["READING", "LISTENING", "TRANSLATION", "WRITING"];
const STORAGE_KEY = "smart_study_session_v3";

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const normalize = (value?: string | null) => (value ?? "").trim().toLowerCase();

type PersistedSmartSession = {
  mainQuestionQueue: QuestionItem[];
  retryQuestionQueue: QuestionItem[];
  currentQuestionIndex: number;
  round: number;
  wrongCountByWord: Record<string, number>;
  failedSkillsByWord: Record<string, Skill[]>;
  passedSkillsByWord: Record<string, Skill[]>;
  pendingIds: string[];
  sessionStartIds: string[];
  knownIds: string[];
  isCompleted: boolean;
};

export default function SmartStudy({ isDarkMode, vocabs: initialVocabs, onFinish }: SmartStudyProps) {
  const [isSessionHydrated, setIsSessionHydrated] = useState(false);
  const [mainQuestionQueue, setMainQuestionQueue] = useState<QuestionItem[]>([]);
  const [retryQuestionQueue, setRetryQuestionQueue] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  const [wrongCountByWord, setWrongCountByWord] = useState<Record<string, number>>({});
  const [failedSkillsByWord, setFailedSkillsByWord] = useState<Record<string, Set<Skill>>>({});
  const [passedSkillsByWord, setPassedSkillsByWord] = useState<Record<string, Set<Skill>>>({});

  const [userInput, setUserInput] = useState("");
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [currentOptions, setCurrentOptions] = useState<VocabResponse[]>([]);
  const [hasCopiedCorrectAnswer, setHasCopiedCorrectAnswer] = useState(false);
  const [showSrsNote, setShowSrsNote] = useState(false);

  const [pendingNewWords, setPendingNewWords] = useState<VocabResponse[]>([]);
  const [sessionStartVocabIds, setSessionStartVocabIds] = useState<Set<string>>(new Set());
  const [knownVocabIds, setKnownVocabIds] = useState<Set<string>>(new Set());

  const isActionableForSmartStudy = useCallback((vocab: VocabResponse) => {
    if (vocab.status === "NEW" || vocab.status === "OVERDUE" || vocab.status === "FORGOTTEN") return true;
    if (!vocab.nextReviewAt) return true;
    const ts = Date.parse(vocab.nextReviewAt);
    if (Number.isNaN(ts)) return true;
    return ts <= Date.now();
  }, []);

  const getActionableVocabs = useCallback((vocabs: VocabResponse[]) => {
    const actionable = vocabs.filter(isActionableForSmartStudy);
    // Fallback only when payload has no SRS fields at all (legacy/raw vocab list).
    const hasNoSrsFields = vocabs.length > 0 && vocabs.every((v) => !v.status && !v.nextReviewAt);
    if (actionable.length === 0 && hasNoSrsFields) {
      return vocabs;
    }
    return actionable;
  }, [isActionableForSmartStudy]);

  const createBatchQuestions = useCallback((vocabs: VocabResponse[], currentRound: number) => {
    const items: QuestionItem[] = [];
    vocabs.forEach((v) => {
      ORDERED_SKILLS.forEach((skill) => {
        items.push({
          id: `${v.id}:${skill}`,
          vocabId: v.id,
          skill,
          round: currentRound,
        });
      });
    });
    return shuffle(items);
  }, []);

  useEffect(() => {
    const allIds = initialVocabs.map((v) => v.id);

    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) {
      const actionable = getActionableVocabs(initialVocabs);
      const queue = createBatchQuestions(actionable, 1);

      setMainQuestionQueue(queue);
      setRetryQuestionQueue([]);
      setCurrentQuestionIndex(0);
      setRound(1);
      setIsCompleted(false);
      setWrongCountByWord({});
      setFailedSkillsByWord({});
      setPassedSkillsByWord({});
      setPendingNewWords([]);
      setSessionStartVocabIds(new Set(actionable.map(v => v.id)));
      setKnownVocabIds(new Set(allIds));
      setIsSessionHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as PersistedSmartSession;
      const known = new Set(parsed.knownIds || []);
      const sessionStartIds = new Set(parsed.sessionStartIds || allIds);
      const freshNewIds = allIds.filter((id) => !known.has(id));
      const mergedPendingIds = [...new Set([...(parsed.pendingIds || []), ...freshNewIds])];
      freshNewIds.forEach((id) => known.add(id));

      if (parsed.isCompleted) {
        localStorage.removeItem(STORAGE_KEY);
        const actionable = getActionableVocabs(initialVocabs);
        setMainQuestionQueue(createBatchQuestions(actionable, 1));
        setIsCompleted(false);
      } else {
        setMainQuestionQueue(parsed.mainQuestionQueue || []);
        setRetryQuestionQueue(parsed.retryQuestionQueue || []);
        setCurrentQuestionIndex(parsed.currentQuestionIndex || 0);
        setRound(parsed.round || 1);
        setIsCompleted(false);
      }

      setWrongCountByWord(parsed.wrongCountByWord || {});

      const failed: Record<string, Set<Skill>> = {};
      Object.entries(parsed.failedSkillsByWord || {}).forEach(([k, v]) => failed[k] = new Set(v as Skill[]));
      setFailedSkillsByWord(failed);

      const passed: Record<string, Set<Skill>> = {};
      Object.entries(parsed.passedSkillsByWord || {}).forEach(([k, v]) => passed[k] = new Set(v as Skill[]));
      setPassedSkillsByWord(passed);

      const restoredPending = initialVocabs.filter(v => mergedPendingIds.includes(v.id) && !sessionStartIds.has(v.id));
      setPendingNewWords(restoredPending);
      setSessionStartVocabIds(sessionStartIds);
      setKnownVocabIds(known);
      setIsSessionHydrated(true);
    } catch (e) {
      console.error("Failed to restore session", e);
      const actionable = getActionableVocabs(initialVocabs);
      setMainQuestionQueue(createBatchQuestions(actionable, 1));
      setIsSessionHydrated(true);
    }
  }, [initialVocabs, getActionableVocabs, createBatchQuestions]);

  useEffect(() => {
    if (!isSessionHydrated || knownVocabIds.size === 0) return;

    const nextIds = initialVocabs.map((v) => v.id);
    const newIds = nextIds.filter((id) => !knownVocabIds.has(id) && !sessionStartVocabIds.has(id));
    if (newIds.length === 0) return;

    const newVocabs = initialVocabs.filter((v) => newIds.includes(v.id));
    setPendingNewWords((prev) => {
      const existing = new Set(prev.map((v) => v.id));
      const filtered = newVocabs.filter((v) => !existing.has(v.id));
      return [...prev, ...filtered];
    });
    setKnownVocabIds((prev) => {
      const next = new Set(prev);
      newIds.forEach((id) => next.add(id));
      return next;
    });
  }, [initialVocabs, knownVocabIds, sessionStartVocabIds, isSessionHydrated]);

  useEffect(() => {
    if (!isSessionHydrated) return;

    const failedArr: Record<string, Skill[]> = {};
    Object.entries(failedSkillsByWord).forEach(([k, v]) => failedArr[k] = Array.from(v));

    const passedArr: Record<string, Skill[]> = {};
    Object.entries(passedSkillsByWord).forEach(([k, v]) => passedArr[k] = Array.from(v));

    const session: PersistedSmartSession = {
      mainQuestionQueue,
      retryQuestionQueue,
      currentQuestionIndex,
      round,
      wrongCountByWord,
      failedSkillsByWord: failedArr,
      passedSkillsByWord: passedArr,
      pendingIds: pendingNewWords.map(v => v.id),
      sessionStartIds: Array.from(sessionStartVocabIds),
      knownIds: Array.from(knownVocabIds),
      isCompleted,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [
    isSessionHydrated,
    mainQuestionQueue,
    retryQuestionQueue,
    currentQuestionIndex,
    round,
    wrongCountByWord,
    failedSkillsByWord,
    passedSkillsByWord,
    pendingNewWords,
    sessionStartVocabIds,
    knownVocabIds,
    isCompleted
  ]);

  const currentQuestion = mainQuestionQueue[currentQuestionIndex];
  const currentWord = useMemo(() =>
    currentQuestion ? initialVocabs.find(v => v.id === currentQuestion.vocabId) : null
    , [currentQuestion, initialVocabs]);

  useEffect(() => {
    if (!currentWord || !currentQuestion) return;
    if (["READING", "TRANSLATION", "LISTENING"].includes(currentQuestion.skill)) {
      const distractors = initialVocabs
        .filter((v) => v.id !== currentWord.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setCurrentOptions(shuffle([currentWord, ...distractors]));
    }
  }, [currentWord, currentQuestion, initialVocabs]);

  const playAudio = useCallback(() => {
    if (!currentWord) return;
    if (currentWord.audioUrl) {
      new Audio(currentWord.audioUrl).play().catch((e) => console.error(e));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(currentWord.surface);
    utterance.lang = "ja-JP";
    window.speechSynthesis.speak(utterance);
  }, [currentWord]);

  const skillToMode = (skill: Skill): StudyMode => {
    if (skill === "LISTENING") return StudyMode.LISTEN;
    if (skill === "WRITING") return StudyMode.WRITE;
    return StudyMode.QUIZ;
  };

  const handleNext = async (success: boolean) => {
    if (!currentQuestion) return;

    setIsLoading(true);
    try {
      // Backend attempt record
      await vocabService.smartAttemptSkill({
        vocabId: currentQuestion.vocabId,
        skill: currentQuestion.skill,
        studyMode: skillToMode(currentQuestion.skill),
        success,
      });

      if (success) {
        setPassedSkillsByWord(prev => {
          const next = { ...prev };
          const set = new Set(next[currentQuestion.vocabId] || []);
          set.add(currentQuestion.skill);
          next[currentQuestion.vocabId] = set;
          return next;
        });
      } else {
        setFailedSkillsByWord(prev => {
          const next = { ...prev };
          const set = new Set(next[currentQuestion.vocabId] || []);
          set.add(currentQuestion.skill);
          next[currentQuestion.vocabId] = set;
          return next;
        });
        setRetryQuestionQueue(prev => {
          if (prev.some(q => q.id === currentQuestion.id && q.round === round + 1)) return prev;
          return [...prev, { ...currentQuestion, round: round + 1 }];
        });
      }

      const isLastInQueue = currentQuestionIndex === mainQuestionQueue.length - 1;

      if (!isLastInQueue) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        const finalRetryQueue = [...retryQuestionQueue];
        if (!success) {
          const alreadyIn = finalRetryQueue.some(q => q.id === currentQuestion.id && q.round === round + 1);
          if (!alreadyIn) {
            finalRetryQueue.push({ ...currentQuestion, round: round + 1 });
          }
        }

        if (finalRetryQueue.length > 0) {
          setMainQuestionQueue(shuffle(finalRetryQueue));
          setRetryQuestionQueue([]);
          setCurrentQuestionIndex(0);
          setRound(prev => prev + 1);
        } else {
          // Finalize All words that were started in this session
          for (const vid of Array.from(sessionStartVocabIds)) {
            const wc = wrongCountByWord[vid] || 0;
            const failedInRetry = round > 1 && (failedSkillsByWord[vid]?.size > 0);
            await vocabService.smartFinalizeWord({
              vocabId: vid,
              wrongCount: wc,
              failedInRetry: !!failedInRetry
            });
          }

          if (pendingNewWords.length > 0) {
            const ok = window.confirm(`Bạn có ${pendingNewWords.length} từ mới. Học luôn không?`);
            if (ok) {
              const queue = createBatchQuestions(pendingNewWords, 1);
              setMainQuestionQueue(queue);
              setRetryQuestionQueue([]);
              setCurrentQuestionIndex(0);
              setRound(1);
              setPendingNewWords([]);
              setSessionStartVocabIds(prev => new Set([...Array.from(prev), ...pendingNewWords.map(v => v.id)]));
              setWrongCountByWord({});
              setFailedSkillsByWord({});
              setPassedSkillsByWord({});
              return;
            }
          }
          setIsCompleted(true);
        }
      }

      setIsFeedbackVisible(false);
      setUserInput("");
      setHasCopiedCorrectAnswer(false);
      setWrongGuesses([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAnswer = (answer?: string) => {
    if (!currentWord || !currentQuestion || isFeedbackVisible) return;

    let correct = false;
    if (["READING", "TRANSLATION", "LISTENING"].includes(currentQuestion.skill)) {
      correct = answer === currentWord.id;
    } else {
      const val = normalize(userInput);
      correct = val === normalize(currentWord.surface) || val === normalize(currentWord.reading);
    }

    if (correct) {
      setIsCorrect(true);
      setIsFeedbackVisible(true);
      setTimeout(() => handleNext(wrongGuesses.length === 0), 1200);
    } else {
      setWrongCountByWord(prev => ({ ...prev, [currentWord.id]: (prev[currentWord.id] || 0) + 1 }));
      if (currentQuestion.skill !== "WRITING") {
        if (answer) setWrongGuesses(prev => [...prev, answer]);
        return;
      }
      setIsCorrect(false);
      setIsFeedbackVisible(true);
    }
  };

  if (!isSessionHydrated) return null;

  if (mainQuestionQueue.length === 0 && !isCompleted) {
    return (
      <div className={`flex flex-col items-center justify-center p-20 rounded-[40px] text-center space-y-6 ${isDarkMode ? "bg-gray-800/40 border-gray-700" : "bg-white border-blue-50 shadow-blue-500/5"
        } border shadow-xl animate-in fade-in duration-700 mx-auto max-w-2xl`}>
        <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center ${isDarkMode ? "bg-gray-700/50" : "bg-cyan-50"}`}>
          <SearchX className={`w-12 h-12 ${isDarkMode ? "text-cyan-400" : "text-cyan-500"}`} />
        </div>
        <div className="space-y-2">
          <h2 className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>Chưa có từ cần học</h2>
          <p className={`max-w-xs mx-auto text-lg leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Tuyệt vời! Bạn đã hoàn thành hết các từ vựng cần ôn tập hoặc học mới.
          </p>
        </div>
        <button
          onClick={onFinish}
          className="px-10 py-4 bg-cyan-500 text-white rounded-2xl font-black shadow-lg shadow-cyan-500/20 hover:scale-[1.05] active:scale-95 transition"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (isCompleted) {
    const masteredCount = Object.keys(passedSkillsByWord).filter(id => passedSkillsByWord[id]?.size === 4).length;
    return (
      <div className={`flex flex-col items-center justify-center p-12 rounded-[40px] text-center space-y-8 ${isDarkMode ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-100"
        } border shadow-2xl animate-in zoom-in duration-500 max-w-2xl mx-auto`}>
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
          <div className="w-28 h-28 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-yellow-400/20 relative">
            <Trophy className="w-14 h-14 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className={`text-4xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>Khám phá hoàn tất!</h2>
          <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Bạn đã hoàn thành phiên học trộn lẫn sau {round} vòng luyện.
          </p>
        </div>
        <div className={`w-full px-8 py-6 rounded-[32px] ${isDarkMode ? "bg-gray-700/50" : "bg-cyan-50"} space-y-2`}>
          <p className={`text-xl font-black ${isDarkMode ? "text-cyan-300" : "text-cyan-700"}`}>
            Đạt chuẩn (4/4 skill): {masteredCount} từ
          </p>
          <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            Dữ liệu SRS đã được cập nhật tự động lên hệ thống.
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            onFinish();
          }}
          className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition shadow-cyan-500/20"
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  if (!currentQuestion || !currentWord) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Progress */}
      <div className="flex flex-col gap-5 px-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${round > 1
              ? "bg-amber-400 text-gray-900"
              : isDarkMode ? "bg-cyan-500/20 text-cyan-400" : "bg-cyan-100 text-cyan-700"
              }`}>
              {round > 1 ? `Vòng Retry ${round - 1}` : "Vòng Chính"}
            </div>
            <h3 className={`text-xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Câu {currentQuestionIndex + 1} / {mainQuestionQueue.length}
            </h3>
          </div>
          <div className={`px-3 py-1 rounded-lg text-xs font-black ${isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
            {Math.round(((currentQuestionIndex) / mainQuestionQueue.length) * 100)}%
          </div>
          <button
            onClick={() => setShowSrsNote(!showSrsNote)}
            title="Cơ chế học thông minh"
            className={`p-1.5 rounded-lg transition-all ${showSrsNote
              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
              : isDarkMode ? "bg-gray-800 text-cyan-400 hover:bg-gray-700" : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
              }`}
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden ${isDarkMode ? "bg-gray-800" : "bg-gray-100 shadow-inner"}`}>
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
            style={{ width: `${((currentQuestionIndex) / mainQuestionQueue.length) * 100}%` }}
          />
        </div>

        {/* SRS Mechanism Note: Shown only when requested */}
        {showSrsNote && (
          <div className={`p-5 rounded-3xl border shadow-xl animate-in slide-in-from-top-2 duration-300 relative ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-cyan-100"}`}>
            <button
              onClick={() => setShowSrsNote(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-50" />
            </button>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${isDarkMode ? "bg-cyan-500/10" : "bg-cyan-50"}`}>
                <Zap className={`w-6 h-6 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} />
              </div>
              <div className="space-y-3 pr-6">
                <h4 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? "text-cyan-400" : "text-cyan-700"}`}>Cơ chế lặp lại ngắt quãng (SRS)</h4>
                <div className={`text-xs space-y-2 leading-relaxed font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <p>Hệ thống sử dụng thuật toán thông minh để tối ưu hóa việc ghi nhớ:</p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><b>Từ khó (Trả lời sai)</b>: Sẽ được xuất hiện liên tục trong vòng chính cho đến khi bạn học thuộc.</li>
                    <li><b>Nhắc nhở ôn tập</b>: Sau khi thuộc, hệ thống sẽ tự động nhắc bạn ôn lại vào các mốc <b>1 ngày, 3 ngày, 7 ngày, 1 tháng...</b></li>
                    <li><b>Mục tiêu</b>: Giúp chuyển kiến thức từ trí nhớ ngắn hạn sang <b>trí nhớ dài hạn</b> vĩnh viễn với nỗ lực ít nhất.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="min-h-[480px] flex flex-col items-center">
        <div className="text-center mb-10 space-y-4">
          {/* Small spacer or nothing here to clean up the UI as requested */}
          <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            {currentQuestion.skill === "LISTENING" ? "Nghe và tìm nghĩa tiếng Việt" :
              currentQuestion.skill === "WRITING" ? "Dịch từ này sang tiếng Nhật" :
                "Chọn câu trả lời chính xác"}
          </h2>
        </div>

        <div className={`w-full p-10 rounded-[48px] border-[3px] shadow-2xl transition-all duration-500 ${isDarkMode ? "bg-gray-800/60 border-gray-700" : "bg-white border-blue-50 shadow-blue-500/5"
          }`}>
          <div className="flex flex-col items-center justify-center min-h-[160px] mb-12">
            {currentQuestion.skill === "READING" && (
              <h2 className={`text-8xl font-black tracking-tighter animate-in zoom-in-50 duration-500 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {currentWord.surface}
              </h2>
            )}
            {currentQuestion.skill === "TRANSLATION" && (
              <h2 className={`text-6xl font-black animate-in fade-in duration-700 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                {currentWord.translated}
              </h2>
            )}
            {currentQuestion.skill === "LISTENING" && (
              <button
                onClick={playAudio}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-cyan-500/30 group"
              >
                <Volume2 className="w-14 h-14 group-hover:animate-pulse" />
              </button>
            )}
            {currentQuestion.skill === "WRITING" && (
              <div className="text-center space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                <span className="text-xs font-black text-cyan-500 uppercase tracking-[0.3em]">Bản dịch tiếng Việt</span>
                <h2 className={`text-6xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {currentWord.translated}
                </h2>
              </div>
            )}
          </div>

          {["READING", "TRANSLATION", "LISTENING"].includes(currentQuestion.skill) ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {currentOptions.map((opt) => {
                const isWrong = wrongGuesses.includes(opt.id);
                const isCorrectOption = opt.id === currentWord.id;
                return (
                  <button
                    key={opt.id}
                    disabled={isFeedbackVisible || isWrong}
                    onClick={() => checkAnswer(opt.id)}
                    className={`p-7 rounded-[24px] border-2 font-black text-lg text-left transition-all duration-300 ${isFeedbackVisible
                      ? isCorrectOption
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 scale-[1.03] shadow-lg shadow-emerald-500/10"
                        : "opacity-20 grayscale border-gray-200"
                      : isWrong
                        ? "border-red-500/40 bg-red-500/5 text-red-500 opacity-50 line-through"
                        : isDarkMode
                          ? "bg-gray-900 border-gray-700 hover:border-cyan-500 hover:bg-gray-800 text-white hover:shadow-lg"
                          : "bg-gray-50 border-gray-200 hover:border-cyan-500 hover:bg-white text-gray-700 shadow-sm hover:shadow-xl"
                      }`}
                  >
                    {currentQuestion.skill === "TRANSLATION" ? opt.surface : opt.translated}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <input
                autoFocus
                type="text"
                placeholder="Nhập bằng tiếng Nhật hoặc Romaji..."
                value={userInput}
                disabled={isFeedbackVisible}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                className={`w-full p-8 bg-transparent border-b-[6px] text-center text-5xl font-black outline-none transition-all duration-300 ${isFeedbackVisible
                  ? isCorrect
                    ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
                    : "border-red-500 text-red-500 bg-red-500/5"
                  : `border-cyan-500/20 focus:border-cyan-500 ${isDarkMode ? "text-white" : "text-gray-900"}`
                  }`}
              />
              {!isFeedbackVisible && (
                <button
                  onClick={() => checkAnswer()}
                  className="w-full py-6 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  Xác nhận kết quả
                </button>
              )}
            </div>
          )}

          {isFeedbackVisible && (
            <div className={`mt-10 p-8 rounded-[40px] flex flex-col gap-8 animate-in slide-in-from-top-8 duration-500 ${isCorrect ? "bg-emerald-500/5 text-emerald-600 border border-emerald-500/20" : "bg-red-500/5 text-red-500 border border-red-500/20"
              }`}>
              <div className="flex items-center gap-4 font-black text-2xl">
                {isCorrect ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                <span>{isCorrect ? "Bạn đã làm đúng!" : "Hãy xem lại từ này"}</span>
              </div>

              {!isCorrect && (
                <div className="space-y-8">
                  <div className={`p-7 rounded-[32px] ${isDarkMode ? "bg-black/30" : "bg-white shadow-xl shadow-red-500/5"}`}>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Đáp án chính xác là</span>
                    <p className="text-5xl font-black mt-2 text-red-500">{currentWord.surface}</p>
                    <div className="flex flex-wrap gap-x-4 mt-2">
                      <p className="text-lg font-bold text-gray-500">{currentWord.reading}</p>
                      <p className="text-lg font-medium text-gray-400">— {currentWord.translated}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-base font-black flex items-center gap-3">
                      <PenTool className="w-5 h-5 text-red-500" /> Nhập lại để ghi nhớ sâu hơn:
                    </p>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Gõ lại chính xác từ này..."
                      value={userInput}
                      onChange={(e) => {
                        setUserInput(e.target.value);
                        const val = normalize(e.target.value);
                        if (val === normalize(currentWord.surface) || val === normalize(currentWord.reading)) {
                          setHasCopiedCorrectAnswer(true);
                        }
                      }}
                      onKeyDown={(e) => e.key === "Enter" && hasCopiedCorrectAnswer && handleNext(false)}
                      className={`w-full p-6 rounded-[24px] border-[3px] text-3xl font-black transition-all outline-none ${hasCopiedCorrectAnswer
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-600"
                        : "border-red-500/20 bg-red-500/5 focus:border-red-500 text-red-500"
                        }`}
                    />
                  </div>

                  <button
                    onClick={() => handleNext(false)}
                    disabled={!hasCopiedCorrectAnswer}
                    className={`w-full py-6 text-white rounded-[24px] font-black text-lg transition-all shadow-2xl flex items-center justify-center gap-3 ${!hasCopiedCorrectAnswer
                      ? "bg-gray-700/50 cursor-not-allowed opacity-50 grayscale"
                      : "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:scale-105 active:scale-95 shadow-orange-500/30"
                      }`}
                  >
                    <span>{!hasCopiedCorrectAnswer ? "Chép lại từ đúng để tiếp tục" : "Đã nhớ, học tiếp thôi!"}</span>
                    <ArrowRight className={`w-6 h-6 transition-transform ${hasCopiedCorrectAnswer ? "translate-x-2" : ""}`} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400 blur-3xl opacity-20 animate-pulse"></div>
            <div className="bg-white/10 p-10 rounded-[48px] border border-white/20 relative">
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
