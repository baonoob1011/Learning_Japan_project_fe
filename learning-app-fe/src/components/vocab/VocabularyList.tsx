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
    ChevronDown,
    ChevronUp,
    Plus,
    Tag,
    StickyNote,
    Lightbulb,
    Sparkles,
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
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Edit form states
    const [editForm, setEditForm] = useState({
        customTranslated: "",
        personalNote: "",
        personalExample: "",
        personalTags: [] as string[],
        tempTag: ""
    });

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
            alert("Xóa thất bại.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const startEdit = (vocab: VocabResponse) => {
        setEditingId(vocab.id);
        setEditForm({
            customTranslated: vocab.customTranslated || vocab.translated,
            personalNote: vocab.personalNote || "",
            personalExample: vocab.personalExample || "",
            personalTags: vocab.personalTags || [],
            tempTag: ""
        });
        setExpandedId(vocab.id); // Expand when editing
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (vocab: VocabResponse) => {
        try {
            setIsActionLoading(vocab.id);
            await vocabService.updateMeaning({
                surface: vocab.surface,
                customTranslated: editForm.customTranslated.trim(),
                personalNote: editForm.personalNote.trim(),
                personalExample: editForm.personalExample.trim(),
                personalTags: editForm.personalTags
            });

            setVocabs(prev => prev.map(v =>
                v.id === vocab.id ? {
                    ...v,
                    customTranslated: editForm.customTranslated.trim(),
                    personalNote: editForm.personalNote.trim(),
                    personalExample: editForm.personalExample.trim(),
                    personalTags: editForm.personalTags
                } : v
            ));
            setEditingId(null);
        } catch (err) {
            console.error("Update failed", err);
            alert("Cập nhật thất bại.");
        } finally {
            setIsActionLoading(null);
        }
    };

    const addTag = () => {
        if (!editForm.tempTag.trim()) return;
        if (editForm.personalTags.includes(editForm.tempTag.trim())) return;
        setEditForm(prev => ({
            ...prev,
            personalTags: [...prev.personalTags, prev.tempTag.trim()],
            tempTag: ""
        }));
    };

    const removeTag = (tag: string) => {
        setEditForm(prev => ({
            ...prev,
            personalTags: prev.personalTags.filter(t => t !== tag)
        }));
    };

    const playSound = (surface: string, audioUrl?: string) => {
        if (audioUrl) {
            new Audio(audioUrl).play().catch(e => console.error(e));
        } else {
            const utterance = new SpeechSynthesisUtterance(surface);
            utterance.lang = "ja-JP";
            window.speechSynthesis.speak(utterance);
        }
    };

    const filteredVocabs = useMemo(() => {
        let result = vocabs;
        if (filter === "KNOWN") result = result.filter(v => v.status === LearningStatus.KNOWN);
        else if (filter === "UNLEARNED") result = result.filter(v => v.status !== LearningStatus.KNOWN);

        const query = searchQuery.toLowerCase().trim();
        if (query) {
            result = result.filter(v =>
                v.surface.toLowerCase().includes(query) ||
                (v.customTranslated || v.translated).toLowerCase().includes(query) ||
                v.reading?.toLowerCase().includes(query) ||
                v.personalTags?.some(t => t.toLowerCase().includes(query))
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
            {/* Search Bar */}
            <div className="relative w-full mb-4 group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDarkMode ? "text-gray-500 group-focus-within:text-cyan-400" : "text-gray-400 group-focus-within:text-cyan-500"}`} />
                <input
                    type="text"
                    placeholder="Tìm kiếm từ vựng, tag, ý nghĩa riêng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all duration-300 ${isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white focus:bg-gray-900 focus:ring-2 focus:ring-cyan-500/50 shadow-lg shadow-black/20"
                        : "bg-white border-gray-200 text-gray-800 shadow-sm focus:ring-2 focus:ring-cyan-500/20"
                        } border`}
                />
            </div>

            {/* Filter Bar */}
            <div className={`flex flex-wrap items-center justify-between gap-4 mb-8 p-4 rounded-3xl border ${isDarkMode ? "bg-gray-800/30 border-gray-700/50 backdrop-blur-md" : "bg-white/80 border-gray-200 shadow-sm"}`}>
                <div className={`flex p-1 rounded-2xl ${isDarkMode ? "bg-gray-900/50" : "bg-gray-100"}`}>
                    {(["ALL", "UNLEARNED", "KNOWN"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest transition-all duration-300 ${filter === f
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                                : (isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800")
                                }`}
                        >
                            {f === "ALL" ? "TẤT CẢ" : f === "KNOWN" ? "ĐÃ THUỘC" : "CHƯA THUỘC"}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-6">
                    <span className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        <span className={`text-lg ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>{filteredVocabs.length}</span> từ vựng
                    </span>
                    <button
                        onClick={() => onStartLearning?.("UNLEARNED")}
                        className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95"
                    >
                        HỌC NGAY ⚡
                    </button>
                </div>
            </div>

            {/* Vocabulary Cards */}
            <div className="space-y-4">
                {filteredVocabs.map((v) => (
                    <div
                        key={v.id}
                        className={`overflow-hidden rounded-[2rem] border transition-all duration-300 ${isDarkMode
                            ? `${expandedId === v.id ? "bg-gray-800 border-cyan-500/30" : "bg-gray-800/40 border-gray-700"} hover:bg-gray-800 shadow-xl shadow-black/10`
                            : `${expandedId === v.id ? "bg-white border-cyan-500/30" : "bg-white border-gray-100"} hover:shadow-2xl hover:shadow-cyan-500/5 shadow-sm`
                            }`}
                    >
                        {/* Main Item Header */}
                        <div className="flex flex-col md:flex-row items-stretch md:items-center p-6 gap-6">
                            {/* Word & Reading */}
                            <div className="flex-shrink-0 w-full md:w-52 space-y-1.5">
                                <h3 className={`text-2xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                    {v.surface}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-bold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                        {v.reading || v.romaji}
                                    </span>
                                    {v.partOfSpeech && (
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-tighter uppercase ${isDarkMode ? "bg-gray-700/50 text-gray-500" : "bg-gray-100 text-gray-400"}`}>
                                            {v.partOfSpeech}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Audio & Actions */}
                            <div className="flex items-center gap-2 md:order-last">
                                <button
                                    onClick={() => playSound(v.surface, v.audioUrl)}
                                    className={`p-3 rounded-full transition-all ${isDarkMode ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20" : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"}`}
                                >
                                    <Volume2 size={20} />
                                </button>
                                <button
                                    onClick={() => startEdit(v)}
                                    className={`p-3 rounded-full transition-all ${isDarkMode ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(v.surface, v.id)}
                                    className={`p-3 rounded-full transition-all ${isDarkMode ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                                    className={`p-3 rounded-full transition-all ${isDarkMode ? "text-gray-500 hover:text-white" : "text-gray-300 hover:text-gray-600"}`}
                                >
                                    {expandedId === v.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>

                            {/* Meaning Display */}
                            <div className="flex-1 min-w-0">
                                <div className="space-y-1.5">
                                    <h4 className={`text-lg font-bold leading-tight ${isDarkMode ? "text-cyan-400" : "text-cyan-700"}`}>
                                        {v.customTranslated || v.translated}
                                    </h4>
                                    {v.customTranslated && (
                                        <p className="text-[10px] text-gray-500 font-medium italic">
                                            Nghĩa gốc: {v.translated}
                                        </p>
                                    )}
                                    {/* Personal Tags Preview */}
                                    {v.personalTags && v.personalTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {v.personalTags.map(tag => (
                                                <span key={tag} className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${isDarkMode ? "bg-gray-700/50 text-gray-300" : "bg-gray-50 text-gray-400"}`}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Expandable Details Area */}
                        {expandedId === v.id && (
                            <div className={`p-6 pt-0 animate-in slide-in-from-top-4 duration-300 ${isDarkMode ? "bg-gray-900/20" : "bg-gray-50/30"}`}>
                                <div className={`${isDarkMode ? "border-t border-gray-700/50" : "border-t border-gray-100"} pt-6 space-y-6`}>

                                    {editingId === v.id ? (
                                        /* Edit Mode View */
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500">Nghĩa hiển thị riêng</label>
                                                    <input
                                                        className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                                                        value={editForm.customTranslated}
                                                        onChange={e => setEditForm(p => ({ ...p, customTranslated: e.target.value }))}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Ghi chú (Note)</label>
                                                    <input
                                                        className={`w-full px-4 py-2.5 rounded-xl border outline-none ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                                                        placeholder="Vd: Dễ nhầm với từ X..."
                                                        value={editForm.personalNote}
                                                        onChange={e => setEditForm(p => ({ ...p, personalNote: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-amber-500 text-center block">Ví dụ cá nhân</label>
                                                <textarea
                                                    className={`w-full px-4 py-2.5 rounded-xl border outline-none min-h-[80px] ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                                                    placeholder="Thêm câu ví dụ trực quan cho riêng bạn..."
                                                    value={editForm.personalExample}
                                                    onChange={e => setEditForm(p => ({ ...p, personalExample: e.target.value }))}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Tags cá nhân</label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {editForm.personalTags.map(tag => (
                                                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500 text-white rounded-full text-xs font-bold shadow-sm">
                                                            {tag}
                                                            <button onClick={() => removeTag(tag)}><X size={12} /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        className={`flex-1 px-4 py-2.5 rounded-xl border outline-none text-xs ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
                                                        placeholder="Thêm tag (Vd: N3, Khó nhớ...)"
                                                        value={editForm.tempTag}
                                                        onChange={e => setEditForm(p => ({ ...p, tempTag: e.target.value }))}
                                                        onKeyDown={e => e.key === "Enter" && addTag()}
                                                    />
                                                    <button onClick={addTag} className="p-2.5 bg-cyan-500 text-white rounded-xl"><Plus size={18} /></button>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6">
                                                <button onClick={cancelEdit} className="px-6 py-2.5 rounded-xl bg-gray-500 text-white font-bold text-sm">Hủy</button>
                                                <button onClick={() => saveEdit(v)} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center gap-2">
                                                    {isActionLoading === v.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                    Lưu thay đổi
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Static View Mode */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><StickyNote size={14} /></div>
                                                    <div>
                                                        <h5 className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1">Ghi chú</h5>
                                                        <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                                            {v.personalNote || "Không có ghi chú"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Tag size={14} /></div>
                                                    <div>
                                                        <h5 className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1">Tags của bạn</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {v.personalTags && v.personalTags.length > 0 ? v.personalTags.map(tag => (
                                                                <span key={tag} className={`px-3 py-1 rounded-lg text-xs font-bold ${isDarkMode ? "bg-gray-800 text-cyan-400" : "bg-cyan-50 text-cyan-700"}`}>#{tag}</span>
                                                            )) : <span className="text-xs text-gray-400 italic">Chưa có tag nào</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {/* AI Example (Global) */}
                                                {v.example && (
                                                    <div className="flex items-start gap-3 h-full mb-4">
                                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500"><Sparkles size={14} /></div>
                                                        <div className="flex-1">
                                                            <h5 className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1 flex items-center gap-1.5">
                                                                Ví dụ AI <span className="text-[8px] px-1 py-0.25 bg-orange-500 text-white rounded-sm">System</span>
                                                            </h5>
                                                            <p className={`text-sm leading-relaxed p-4 rounded-2xl border-l-4 border-orange-500/30 whitespace-pre-line ${isDarkMode ? "bg-orange-500/5 text-gray-300" : "bg-orange-50/50 text-gray-700"}`}>
                                                                {v.example}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Personal Example */}
                                                <div className="flex items-start gap-3 h-full">
                                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Lightbulb size={14} /></div>
                                                    <div className="flex-1">
                                                        <h5 className="text-[10px] font-black tracking-widest uppercase text-gray-500 mb-1">Ví dụ cá nhân</h5>
                                                        <p className={`text-sm leading-relaxed p-4 rounded-2xl border-l-4 border-amber-500/30 ${isDarkMode ? "bg-gray-800/50 text-gray-300" : "bg-amber-50/50 text-gray-700"}`}>
                                                            {v.personalExample || "Bạn chưa thêm ví dụ nào cho từ này."}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa từ "${deleteVocabItem?.surface}"? Hành động này sẽ xóa toàn bộ tiến trình học và ghi chú của bạn cho từ này.`}
                isDark={isDarkMode}
                isLoading={isActionLoading === deleteVocabItem?.id}
            />
        </div>
    );
}
