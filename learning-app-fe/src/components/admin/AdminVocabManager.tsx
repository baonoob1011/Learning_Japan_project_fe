"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    Languages,
    AudioLines,
    BookOpen,
    Info,
    RefreshCw,
    Shield
} from "lucide-react";
import { adminVocabService, PageResponse } from "@/services/adminVocabService";
import { VocabResponse } from "@/services/vocabService";
import { useDarkMode } from "@/hooks/useDarkMode";
import ConfirmModal from "../ConfirmModal";

export default function AdminVocabManager() {
    const { isDarkMode: isDark } = useDarkMode();
    const [vocabs, setVocabs] = useState<VocabResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const size = 10;

    // CRUD state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingVocab, setEditingVocab] = useState<Partial<VocabResponse> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingVocab, setDeletingVocab] = useState<VocabResponse | null>(null);

    const fetchVocabs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminVocabService.getAllVocabsManager(page, size, search);
            setVocabs(res.data);
            setTotalPages(res.totalPages);
            setTotalElements(res.totalElements);
        } catch (error) {
            console.error("Failed to fetch vocabs:", error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchVocabs();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchVocabs]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVocab?.surface) return;

        try {
            if (editingVocab.id) {
                await adminVocabService.updateVocab(editingVocab.id, editingVocab);
            } else {
                await adminVocabService.createVocab(editingVocab);
            }
            setIsEditModalOpen(false);
            fetchVocabs();
        } catch (error) {
            console.error("Failed to save vocab:", error);
            alert("Lưu thất bại!");
        }
    };

    const handleDelete = async () => {
        if (!deletingVocab) return;
        try {
            await adminVocabService.deleteVocab(deletingVocab.id);
            setIsDeleteModalOpen(false);
            fetchVocabs();
        } catch (error) {
            console.error("Failed to delete vocab:", error);
            alert("Xóa thất bại!");
        }
    };

    // UI tokens
    const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const headerBg = isDark ? "bg-gray-800/80" : "bg-gray-50";
    const textMain = isDark ? "text-gray-100" : "text-gray-900";
    const textSub = isDark ? "text-gray-400" : "text-gray-500";
    const inputCls = `w-full px-3 py-2 rounded-xl border outline-none transition-all ${isDark ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:border-indigo-500" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-500"}`;

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-center justify-between ${cardBg}`}>
                <div className="relative w-full md:w-96">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textSub}`} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm từ vựng (kanji, hiragana, nghĩa)..."
                        className={`${inputCls} pl-10`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingVocab({});
                        setIsEditModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Thêm từ mới
                </button>
            </div>

            {/* Table */}
            <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={headerBg}>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Từ vựng</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Cách đọc (Hiragana)</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Nghĩa tiếng Việt</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Loại từ</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Phát âm (Audio)</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/10">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className={`h-8 rounded ${isDark ? "bg-gray-700" : "bg-gray-100"}`} />
                                        </td>
                                    </tr>
                                ))
                            ) : vocabs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <Info className={`w-12 h-12 mx-auto mb-4 opacity-20 ${textSub}`} />
                                        <p className={textSub}>Không tìm thấy từ vựng nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                vocabs.map((vocab) => (
                                    <tr key={vocab.id} className={`hover:bg-indigo-50/5 transition-colors ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-lg font-bold ${textMain}`}>{vocab.surface}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm ${textSub}`}>{vocab.reading || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-medium ${textMain}`}>{vocab.translated}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-500`}>
                                                {vocab.partOfSpeech || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {vocab.audioUrl ? (
                                                <div className="flex items-center gap-1 text-emerald-500">
                                                    <AudioLines className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase">Có Audio</span>
                                                </div>
                                            ) : (
                                                <span className={`text-[10px] font-bold uppercase ${textSub}`}>Chưa có</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingVocab(vocab);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeletingVocab(vocab);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={`px-6 py-4 border-t flex items-center justify-between ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                        <span className={`text-xs ${textSub}`}>Tổng cộng: <b>{totalElements}</b> từ vựng</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className={`p-2 rounded-lg transition-all disabled:opacity-30 ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className={`text-sm font-bold ${textMain}`}>{page + 1} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page >= totalPages - 1}
                                className={`p-2 rounded-lg transition-all disabled:opacity-30 ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${cardBg}`}>
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                            <h2 className={`font-bold text-lg flex items-center gap-2 ${textMain}`}>
                                <BookOpen className="w-5 h-5 text-indigo-500" />
                                {editingVocab?.id ? "Chỉnh sửa từ vựng" : "Thêm từ vựng mới"}
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className={`text-xs font-bold mb-1.5 block uppercase tracking-wider ${textSub}`}>Từ gốc (Kanji/Kana)</label>
                                    <input
                                        type="text"
                                        required
                                        className={inputCls}
                                        value={editingVocab?.surface || ""}
                                        onChange={(e) => setEditingVocab({ ...editingVocab, surface: e.target.value })}
                                        placeholder="Ví dụ: 食べる"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className={`text-xs font-bold mb-1.5 block uppercase tracking-wider ${textSub}`}>Hiragana (Reading)</label>
                                    <input
                                        type="text"
                                        className={inputCls}
                                        value={editingVocab?.reading || ""}
                                        onChange={(e) => setEditingVocab({ ...editingVocab, reading: e.target.value })}
                                        placeholder="Ví dụ: たべる"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-1">
                                    <label className={`text-xs font-bold mb-1.5 block uppercase tracking-wider ${textSub}`}>Romaji</label>
                                    <input
                                        type="text"
                                        className={inputCls}
                                        value={editingVocab?.romaji || ""}
                                        onChange={(e) => setEditingVocab({ ...editingVocab, romaji: e.target.value })}
                                        placeholder="Ví dụ: taberu"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className={`text-xs font-bold mb-1.5 block uppercase tracking-wider ${textSub}`}>Loại từ</label>
                                    <input
                                        type="text"
                                        className={inputCls}
                                        value={editingVocab?.partOfSpeech || ""}
                                        onChange={(e) => setEditingVocab({ ...editingVocab, partOfSpeech: e.target.value })}
                                        placeholder="Ví dụ: Verb, Noun..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`text-xs font-bold mb-1.5 block uppercase tracking-wider ${textSub}`}>Nghĩa tiếng Việt</label>
                                <textarea
                                    required
                                    rows={3}
                                    className={`${inputCls} resize-none`}
                                    value={editingVocab?.translated || ""}
                                    onChange={(e) => setEditingVocab({ ...editingVocab, translated: e.target.value })}
                                    placeholder="Ví dụ: Ăn"
                                />
                            </div>

                            <div>
                                <label className={`text-xs font-bold mb-1.5 block uppercase tracking-wider ${textSub}`}>Audio URL (S3/External)</label>
                                <input
                                    type="text"
                                    className={inputCls}
                                    value={editingVocab?.audioUrl || ""}
                                    onChange={(e) => setEditingVocab({ ...editingVocab, audioUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className={`flex-1 py-3 rounded-2xl font-bold transition-all ${isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    {editingVocab?.id ? "Cập nhật" : "Tạo mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Xóa từ vựng"
                message={`Bạn có chắc chắn muốn xóa từ vựng "${deletingVocab?.surface}" khỏi hệ thống? Hành động này sẽ xóa vĩnh viễn và không thể khôi phục!`}
                onConfirm={handleDelete}
                onClose={() => setIsDeleteModalOpen(false)}
                isDark={isDark}
            />
        </div>
    );
}
