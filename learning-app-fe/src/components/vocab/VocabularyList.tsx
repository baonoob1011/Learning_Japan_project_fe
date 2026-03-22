"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    Volume2,
    Edit2,
    Trash2,
    Check,
    X,
    Loader2,
    BookOpen,
} from "lucide-react";
import { vocabService, VocabResponse, StudyMode } from "@/services/vocabService";
import { LearningStatus } from "@/enums/LearningStatus";
import ConfirmModal from "../ConfirmModal";

interface VocabularyListProps {
    isDarkMode: boolean;
    onStartLearning?: (filter: "ALL" | "KNOWN" | "UNLEARNED") => void;
}

export default function VocabularyList({ isDarkMode, onStartLearning }: VocabularyListProps) {
    const [vocabs, setVocabs] = useState<VocabResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<"ALL" | "KNOWN" | "UNLEARNED">("ALL");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteVocabItem, setDeleteVocabItem] = useState<{ surface: string; id: string } | null>(null);

    useEffect(() => {
        loadVocabs();
    }, []);

    const loadVocabs = async () => {
        try {
            setIsLoading(true);
            const data = await vocabService.getMyVocabs();
            setVocabs(data);
        } catch (err) {
            console.error("Failed to load vocabs", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (surface: string, id: string) => {
        setDeleteVocabItem({ surface, id });
        setIsConfirmOpen(true);
    };


    const confirmDelete = async () => {
        if (!deleteVocabItem) return;

        try {
            setIsActionLoading(deleteVocabItem.id);
            await vocabService.remove(deleteVocabItem.surface);
            setVocabs(prev => prev.filter(v => v.id !== deleteVocabItem.id));
            setIsConfirmOpen(false);
            setDeleteVocabItem(null);
        } catch (err) {
            console.error("Delete failed", err);
            alert("Xóa thất bại. Vui lòng thử lại.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const startEdit = (vocab: VocabResponse) => {
        setEditingId(vocab.id);
        setEditValue(vocab.translated);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveEdit = async (vocab: VocabResponse) => {
        if (!editValue.trim() || editValue === vocab.translated) {
            cancelEdit();
            return;
        }

        try {
            setIsActionLoading(vocab.id);
            await vocabService.updateMeaning({
                surface: vocab.surface,
                translated: editValue.trim()
            });
            setVocabs(prev => prev.map(v =>
                v.id === vocab.id ? { ...v, translated: editValue.trim() } : v
            ));
            setEditingId(null);
        } catch (err) {
            console.error("Update failed", err);
            alert("Cập nhật thất bại.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleToggleStatus = async (vocab: VocabResponse) => {
        const isCurrentlyKnown = vocab.status === LearningStatus.KNOWN;
        const willMarkAsKnown = !isCurrentlyKnown;
        const newStatus = willMarkAsKnown ? LearningStatus.KNOWN : LearningStatus.FORGOTTEN;

        try {
            setIsActionLoading(vocab.id);
            // Gọi API markVocab đồng bộ với Flashcard
            await vocabService.markVocab({
                vocabId: vocab.id,
                remembered: willMarkAsKnown,
                studyMode: StudyMode.FLASHCARD
            });

            console.log(`[VocabList] Toggling ${vocab.surface} to ${newStatus}`);

            setVocabs(prev => prev.map(v =>
                v.id.toString() === vocab.id.toString() ? { ...v, status: newStatus } : v
            ));
        } catch (err) {
            console.error("Status update failed", err);
            alert("Cập nhật trạng thái thất bại.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const playSound = (surface: string, audioUrl?: string) => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play().catch(e => console.error(e));
        } else {
            const utterance = new SpeechSynthesisUtterance(surface);
            utterance.lang = "ja-JP";
            window.speechSynthesis.speak(utterance);
        }
    };


    const formatReviewMeta = (nextReviewAt?: string) => {
        if (!nextReviewAt) return null;

        const reviewDate = new Date(nextReviewAt);
        if (Number.isNaN(reviewDate.getTime())) {
            return {
                isOverdue: false,
                message: `Ôn lại: ${nextReviewAt}`,
                tooltip: "Thời gian ôn tập kế tiếp",
            };
        }

        const now = Date.now();
        const diffMs = now - reviewDate.getTime();
        const absoluteMinutes = Math.floor(Math.abs(diffMs) / 60000);
        const hours = Math.floor(absoluteMinutes / 60);
        const minutes = absoluteMinutes % 60;
        const distanceText = hours > 0 ? `${hours}h ${minutes}p` : `${minutes}p`;
        const scheduledAt = reviewDate.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

        if (diffMs >= 60000) {
            return {
                isOverdue: true,
                message: `⚠️ Quá hạn ${distanceText} (hẹn ${scheduledAt})`,
                tooltip: "Từ này đã quá thời điểm ôn lại",
            };
        }

        if (Math.abs(diffMs) < 60000) {
            return {
                isOverdue: false,
                message: `🕐 Đến giờ ôn rồi (${scheduledAt})`,
                tooltip: "Đang đến thời điểm ôn tập",
            };
        }

        return {
            isOverdue: false,
            message: `⏳ Ôn lại sau ${distanceText} (lúc ${scheduledAt})`,
            tooltip: "Thời gian còn lại đến lịch ôn",
        };
    };

    const filteredVocabs = useMemo(() => {
        let result = vocabs;

        if (filter === "KNOWN") {
            result = result.filter(v => v.status === LearningStatus.KNOWN);
        } else if (filter === "UNLEARNED") {
            result = result.filter(v => v.status !== LearningStatus.KNOWN);
        }

        const query = searchQuery.toLowerCase().trim();
        if (query) {
            result = result.filter(v =>
                v.surface.toLowerCase().includes(query) ||
                v.translated.toLowerCase().includes(query) ||
                v.reading?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [vocabs, searchQuery, filter]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
                <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Đang tải danh sách từ vựng...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Search Bar - Full Width */}
            <div className="relative w-full mb-4">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                <input
                    type="text"
                    placeholder="Tìm kiếm từ vựng, ý nghĩa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl outline-none transition-all ${isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-cyan-500/50"
                        : "bg-white border-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-cyan-500/20"
                        } border`}
                />
            </div>

            {/* Filter Tabs & Stats Bar Toolbar */}
            <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-3xl border ${isDarkMode ? "bg-gray-800/30 border-gray-700" : "bg-gray-50/50 border-gray-200"}`}>
                {/* Left: Filter Tabs */}
                <div className={`flex p-1 rounded-2xl border ${isDarkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"}`}>
                    {(["ALL", "UNLEARNED", "KNOWN"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${filter === f
                                ? (isDarkMode ? "bg-cyan-500 text-white shadow-lg shadow-cyan-400/20" : "bg-cyan-600 text-white shadow-sm")
                                : (isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700")
                                }`}
                        >
                            {f === "ALL" ? "TẤT CẢ" : f === "KNOWN" ? "ĐÃ THUỘC" : "CHƯA THUỘC"}
                        </button>
                    ))}
                </div>

                {/* Right: Count + Learn button */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-sm font-bold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Tổng cộng:{" "}
                            <span className={`text-base ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                                {filteredVocabs.length}
                            </span>{" "}
                            từ
                        </span>

                        {filteredVocabs.length > 0 && (
                            <button
                                onClick={() => onStartLearning?.("UNLEARNED")}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap ${isDarkMode
                                    ? "bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
                                    : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md hover:shadow-lg shadow-amber-200"
                                    }`}
                            >
                                <span>HỌC NGAY</span>
                                <span className="animate-pulse">⚡</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* List Container */}
            <div className="space-y-4">
                {filteredVocabs.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>Không tìm thấy từ vựng nào</p>
                    </div>
                ) : (
                    filteredVocabs.map((v) => {
                        const reviewMeta = formatReviewMeta(v.nextReviewAt);
                        return (
                            <div
                                key={v.id}
                                className={`group flex flex-col md:flex-row items-stretch md:items-center gap-6 p-6 rounded-3xl border transition-all duration-500 hover:shadow-2xl ${isDarkMode
                                    ? "bg-gray-800/40 border-gray-700 hover:bg-gray-800 hover:border-cyan-500/30 shadow-black/40"
                                    : "bg-white border-gray-100 hover:shadow-cyan-100/50 hover:border-cyan-200"
                                    }`}
                            >
                                {/* Section 1: Japanese Word */}
                                <div className="flex-shrink-0 w-full md:w-56 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-black"}`}>
                                            {v.surface}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                        <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                                            {v.reading || v.romaji}
                                        </span>
                                        {v.partOfSpeech && (
                                            <span className={`px-2 py-0.5 rounded uppercase tracking-widest text-[9px] ${isDarkMode ? "bg-gray-700/50 text-gray-400 border border-gray-600" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {v.partOfSpeech}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Section 2: Audio Action */}
                                <div className="hidden md:flex flex-col flex-shrink-0 items-center justify-center w-24 px-2 gap-2">
                                    <button
                                        onClick={() => playSound(v.surface, v.audioUrl)}
                                        className="p-3 rounded-full hover:bg-cyan-500/10 text-cyan-500 transition-transform active:scale-90"
                                        title="Nghe từ"
                                    >
                                        <Volume2 size={24} />
                                    </button>
                                </div>

                                {/* Section 3: Meaning (Editable) */}
                                <div className="flex-1 min-w-0 py-2 md:py-0">
                                    {editingId === v.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveEdit(v);
                                                    if (e.key === "Escape") cancelEdit();
                                                }}
                                                className={`flex-1 px-4 py-2.5 rounded-xl border outline-none font-medium transition-all ${isDarkMode
                                                    ? "bg-gray-700 border-gray-600 text-white focus:border-cyan-500"
                                                    : "bg-white border-gray-300 text-gray-900 shadow-inner focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20"
                                                    }`}
                                            />
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => saveEdit(v)}
                                                    disabled={isActionLoading === v.id}
                                                    className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/20"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="p-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition shadow-lg shadow-gray-500/20"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <p className={`text-lg font-bold leading-tight ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                                                    {v.translated}
                                                </p>
                                                <div className="md:hidden flex items-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playSound(v.surface, v.audioUrl);
                                                        }}
                                                        className="p-1.5 rounded-full bg-cyan-500/10 text-cyan-500"
                                                    >
                                                        <Volume2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Section 4: Actions */}
                                <div className="flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {editingId !== v.id && (
                                        <>
                                            <button
                                                onClick={() => startEdit(v)}
                                                className="p-2.5 rounded-xl hover:bg-cyan-500/10 text-cyan-500 transition-all hover:scale-110 active:scale-90"
                                                title="Sửa nghĩa"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(v.surface, v.id)}
                                                disabled={isActionLoading === v.id}
                                                className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-all hover:scale-110 active:scale-90"
                                                title="Xóa từ"
                                            >
                                                {isActionLoading === v.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa từ "${deleteVocabItem?.surface}"? Hành động này không thể hoàn tác.`}
                isDark={isDarkMode}
                isLoading={isActionLoading === deleteVocabItem?.id}
            />
        </div>
    );
}
