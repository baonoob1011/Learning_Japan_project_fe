"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    Brain, Volume2, CheckCircle2, XCircle, Trophy, ChevronRight, Loader2,
    BookOpen, Headphones, PenTool, Type, Zap, ArrowRight
} from "lucide-react";
import { vocabService, VocabResponse, StudyMode } from "@/services/vocabService";
import { reviewService } from "@/services/reviewService";

interface SmartStudyProps {
    isDarkMode: boolean;
    vocabs: VocabResponse[];
    onFinish: () => void;
}

type StudyStage = "READING" | "LISTENING" | "TRANSLATION" | "WRITING" | "COMPLETED";

const STAGES: { id: StudyStage; label: string; icon: any; color: string }[] = [
    { id: "READING", label: "Nhận diện", icon: BookOpen, color: "bg-blue-500" },
    { id: "LISTENING", label: "Nghe hiểu", icon: Headphones, color: "bg-cyan-500" },
    { id: "TRANSLATION", label: "Chuyển ngữ", icon: Type, color: "bg-purple-500" },
    { id: "WRITING", label: "Thành thạo", icon: Zap, color: "bg-emerald-500" }
];

export default function SmartStudy({ isDarkMode, vocabs: initialVocabs, onFinish }: SmartStudyProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentStage, setCurrentStage] = useState<StudyStage>("READING");
    const [userInput, setUserInput] = useState("");
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
    const [currentOptions, setCurrentOptions] = useState<VocabResponse[]>([]);
    const [studyList, setStudyList] = useState<VocabResponse[]>([]);
    const [isFetchingQueue, setIsFetchingQueue] = useState(true);

    const [hasCopiedCorrectAnswer, setHasCopiedCorrectAnswer] = useState(false);

    useEffect(() => {
        const fetchAndFilter = async () => {
            setIsFetchingQueue(true);
            try {
                const data = await reviewService.getToday();
                const incompleteItems = data.todayQueue.filter((x: any) => !x.completed);
                const mapped = incompleteItems.map((q: any) =>
                    initialVocabs.find(v => v.id === q.vocabId)
                ).filter(Boolean) as VocabResponse[];

                setStudyList(mapped);
            } catch (err) {
                console.error(err);
            } finally {
                setIsFetchingQueue(false);
            }
        };
        if (initialVocabs.length > 0) {
            fetchAndFilter();
        } else {
            setIsFetchingQueue(false);
        }
    }, [initialVocabs]);

    const currentWord = studyList[currentWordIndex];

    // Generate options based on stage
    useEffect(() => {
        if (!currentWord) return;
        if (currentStage === "READING" || currentStage === "TRANSLATION" || currentStage === "LISTENING") {
            const distractors = initialVocabs
                .filter(v => v.id !== currentWord.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
            const options = [currentWord, ...distractors].sort(() => Math.random() - 0.5);
            setCurrentOptions(options);
        }
    }, [currentWord, currentStage, initialVocabs]);

    const playAudio = () => {
        if (!currentWord) return;
        if (currentWord.audioUrl) {
            new Audio(currentWord.audioUrl).play().catch(e => console.error(e));
        } else {
            const utterance = new SpeechSynthesisUtterance(currentWord.surface);
            utterance.lang = "ja-JP";
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleNext = async (remembered: boolean) => {
        if (!currentWord) return;
        setIsLoading(true);
        try {
            let mode = StudyMode.FLASHCARD;
            if (currentStage === "LISTENING") mode = StudyMode.LISTEN;
            if (currentStage === "WRITING") mode = StudyMode.WRITE;
            if (currentStage === "READING" || currentStage === "TRANSLATION") mode = StudyMode.QUIZ;

            await vocabService.markVocab({
                vocabId: currentWord.id,
                remembered,
                studyMode: mode
            });

            const stageOrder: StudyStage[] = ["READING", "LISTENING", "TRANSLATION", "WRITING", "COMPLETED"];
            const nextIdx = stageOrder.indexOf(currentStage) + 1;
            const nextStage = stageOrder[nextIdx];

            if (nextStage === "WRITING") playAudio(); // Auto play audio on the last writing stage

            if (nextStage === "COMPLETED") {
                if (currentWordIndex < studyList.length - 1) {
                    setCurrentWordIndex(prev => prev + 1);
                    setCurrentStage("READING");
                } else {
                    setCurrentStage("COMPLETED");
                }
            } else {
                setCurrentStage(nextStage);
            }

            setIsFeedbackVisible(false);
            setUserInput("");
            setHasCopiedCorrectAnswer(false);
            setWrongGuesses([]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFailureContinue = () => {
        // Just move to the next stage of the SAME word
        handleNext(false);
    };

    const checkAnswer = (answer?: string) => {
        if (isFeedbackVisible) return;

        let correct = false;
        if (currentStage === "READING" || currentStage === "TRANSLATION" || currentStage === "LISTENING") {
            correct = answer === currentWord.id;
        } else {
            const normalizedInput = userInput.trim().toLowerCase();
            const normalizedTarget = currentWord.surface.trim().toLowerCase();
            const normalizedReading = currentWord.reading?.trim().toLowerCase();
            correct = normalizedInput === normalizedTarget || normalizedInput === normalizedReading;
        }

        if (correct) {
            setIsCorrect(true);
            setIsFeedbackVisible(true);
            setTimeout(() => handleNext(wrongGuesses.length === 0), 1200);
        } else {
            if (currentStage !== "WRITING") {
                if (answer) {
                    setWrongGuesses(prev => [...prev, answer]);
                }
            } else {
                setIsCorrect(false);
                setIsFeedbackVisible(true);
            }
        }
    };

    if (isFetchingQueue) {
        return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>;
    }

    if ((studyList.length === 0 && !isFetchingQueue) || currentStage === "COMPLETED") {
        return (
            <div className={`flex flex-col items-center justify-center p-12 rounded-3xl text-center space-y-6 ${isDarkMode ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-100"
                } border shadow-2xl animate-in zoom-in duration-500`}>
                <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-yellow-400/20">
                    <Trophy className="w-12 h-12 text-white" />
                </div>
                <h2 className={`text-3xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>Khám phá hoàn tất!</h2>
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                    Bạn đã hoàn thành xuất sắc toàn bộ thử thách hôm nay! (Tự động cập nhật SRS)
                </p>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-cyan-500 text-white rounded-2xl font-bold shadow-lg">Làm mới quá trình</button>
            </div>
        );
    }

    if (!currentWord) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>;

    const currentStageInfo = STAGES.find(s => s.id === currentStage)!;

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Steps Progress */}
            <div className="flex items-center gap-1.5 px-2">
                {STAGES.map((s, idx) => {
                    const isPassed = STAGES.findIndex(st => st.id === currentStage) > idx;
                    const isActive = s.id === currentStage;
                    const Icon = s.icon;
                    return (
                        <div key={s.id} className="flex-1 flex flex-col items-center gap-2">
                            <div className={`w-full h-1.5 rounded-full transition-all duration-500 ${isPassed ? "bg-emerald-500" : isActive ? s.color : isDarkMode ? "bg-gray-700" : "bg-gray-200"
                                }`} />
                            <Icon className={`w-4 h-4 transition-all ${isPassed ? "text-emerald-500" : isActive ? "text-cyan-500 scale-125" : "text-gray-400"}`} />
                        </div>
                    );
                })}
            </div>

            <div className="min-h-[450px] flex flex-col items-center">
                {/* Header Information */}
                <div className="text-center mb-8 space-y-2">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${isDarkMode ? "bg-gray-800 text-cyan-400" : "bg-cyan-100 text-cyan-700"}`}>
                        {currentStageInfo.label} :: Từ {currentWordIndex + 1}/{studyList.length}
                    </span>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        {currentStage === "LISTENING" ? "Nghe và thực hiện" : "Chọn hoặc gõ đáp án đúng"}
                    </h3>
                </div>

                {/* Challenge UI */}
                <div className={`w-full p-8 rounded-[40px] border-2 shadow-2xl transition-all ${isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-blue-50 shadow-blue-500/5"
                    }`}>

                    {/* Visual Prompts */}
                    <div className="flex flex-col items-center justify-center min-h-[120px] mb-8">
                        {currentStage === "READING" && (
                            <h2 className={`text-6xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>{currentWord.surface}</h2>
                        )}
                        {currentStage === "TRANSLATION" && (
                            <h2 className={`text-4xl font-black ${isDarkMode ? "text-cyan-500" : "text-cyan-700"}`}>{currentWord.translated}</h2>
                        )}
                        {currentStage === "LISTENING" && (
                            <button onClick={playAudio} className="w-24 h-24 rounded-full bg-cyan-500 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-xl cursor-pointer">
                                <Volume2 className="w-10 h-10" />
                            </button>
                        )}
                        {currentStage === "WRITING" && (
                            <div className="text-center space-y-1">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Dịch từ này</p>
                                <h2 className={`text-4xl font-black ${isDarkMode ? "text-white" : "text-gray-900"}`}>{currentWord.translated}</h2>
                            </div>
                        )}
                    </div>

                    {/* Interaction Fields */}
                    {["READING", "TRANSLATION", "LISTENING"].includes(currentStage) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentOptions.map(opt => {
                                const isWrong = wrongGuesses.includes(opt.id);
                                return (
                                    <button
                                        key={opt.id}
                                        disabled={isFeedbackVisible || isWrong}
                                        onClick={() => checkAnswer(opt.id)}
                                        className={`p-5 rounded-2xl border-2 font-bold text-left transition-all ${isFeedbackVisible
                                            ? opt.id === currentWord.id
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                : "opacity-30 border-gray-200"
                                            : isWrong
                                                ? "border-red-500 bg-red-50/50 text-red-500 opacity-60"
                                                : isDarkMode ? "bg-gray-900 border-gray-700 hover:border-cyan-500 hover:bg-gray-800 text-white" : "bg-gray-50 border-gray-100 hover:border-cyan-500 hover:bg-cyan-50/50 text-gray-700"
                                            }`}
                                    >
                                        {currentStage === "READING" || currentStage === "LISTENING" ? opt.translated : opt.surface}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Gõ bằng tiếng Nhật..."
                                value={userInput}
                                disabled={isFeedbackVisible}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                                className={`w-full p-6 bg-transparent border-b-4 text-center text-3xl font-black outline-none transition-all ${isFeedbackVisible
                                    ? isCorrect ? "border-emerald-500 text-emerald-500" : "border-red-500 text-red-500 animate-shake"
                                    : "border-cyan-500/30 focus:border-cyan-500 " + (isDarkMode ? "text-white" : "text-gray-900")
                                    }`}
                            />
                            {!isFeedbackVisible && (
                                <button onClick={() => checkAnswer()} className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-bold hover:bg-cyan-700 transition shadow-lg">Xác nhận</button>
                            )}
                        </div>
                    )}

                    {/* Global Feedback */}
                    {isFeedbackVisible && (
                        <div className={`mt-6 p-5 rounded-3xl flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300 ${isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}>
                            <div className="flex items-center gap-3 font-bold">
                                {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                <span className={isCorrect ? "text-lg" : "text-base"}>
                                    {isCorrect ? "Chính xác! Đang chuyển tiếp..." : `Chưa chính xác!`}
                                </span>
                            </div>

                            {!isCorrect && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-2xl">
                                        <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Đáp án đúng là</p>
                                        <p className="text-3xl font-black">{currentWord.surface}</p>
                                        <p className="text-sm opacity-80">({currentWord.reading} - {currentWord.translated})</p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-red-400 flex items-center gap-2">
                                            <PenTool className="w-4 h-4" /> Chép lại từ này để ghi nhớ:
                                        </p>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Gõ lại bằng tiếng Nhật hoặc Romaji..."
                                            value={userInput}
                                            onChange={(e) => {
                                                const val = e.target.value.trim().toLowerCase();
                                                setUserInput(e.target.value);

                                                const targetSurface = currentWord.surface.trim().toLowerCase();
                                                const targetReading = currentWord.reading?.trim().toLowerCase();

                                                if (val === targetSurface || val === targetReading) {
                                                    setHasCopiedCorrectAnswer(true);
                                                }
                                            }}
                                            onKeyDown={(e) => e.key === "Enter" && hasCopiedCorrectAnswer && handleFailureContinue()}
                                            className={`w-full p-4 rounded-2xl border-2 text-xl font-bold transition-all outline-none shadow-inner ${hasCopiedCorrectAnswer
                                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                                                : "border-red-500/30 bg-red-500/5 focus:border-red-500 text-red-500"
                                                }`}
                                        />
                                    </div>

                                    <button
                                        onClick={handleFailureContinue}
                                        disabled={!hasCopiedCorrectAnswer}
                                        className={`w-full py-4 text-white rounded-2xl font-black transition-all shadow-xl flex items-center justify-center gap-3 ${!hasCopiedCorrectAnswer
                                            ? "bg-gray-600 cursor-not-allowed opacity-30"
                                            : "bg-gradient-to-r from-red-500 to-orange-600 hover:scale-[1.02] active:scale-95 shadow-red-500/20"
                                            }`}
                                    >
                                        {!hasCopiedCorrectAnswer
                                            ? "Vui lòng chép lại từ đúng"
                                            : "TUYỆT VỜI, HỌC TIẾP THÔI!"}
                                        <ArrowRight className={`w-5 h-5 transition-transform ${hasCopiedCorrectAnswer ? "translate-x-1" : ""}`} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[100] flex items-center justify-center rounded-3xl">
                    <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                </div>
            )}
        </div>
    );
}
