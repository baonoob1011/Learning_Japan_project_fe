"use client";
import React, { useEffect, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { kanjiService, KanjiResponse } from "@/services/kanjiService";
import { Languages, Loader2, Plus, Search, BookOpen, Layers, Edit, Trash2, X } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function AdminKanjiPage() {
    const { isDarkMode: isDark } = useDarkMode();
    const [kanjis, setKanjis] = useState<KanjiResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create form state
    const [newCharacter, setNewCharacter] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Edit state
    const [editingKanji, setEditingKanji] = useState<KanjiResponse | null>(null);
    const [editForm, setEditForm] = useState<Partial<KanjiResponse>>({});
    const [isUpdating, setIsUpdating] = useState(false);

    // Delete confirmation state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [kanjiToDelete, setKanjiToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchKanjis = async () => {
        setIsLoading(true);
        try {
            const data = await kanjiService.getAll();
            // Sort by character or ID (descending)
            setKanjis(data.sort((a, b) => b.id.localeCompare(a.id)));
        } catch (error) {
            console.error("Failed to fetch kanjis:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKanjis();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCharacter.trim()) return;

        setIsCreating(true);
        try {
            await kanjiService.create({ character: newCharacter.trim() });
            setNewCharacter("");
            await fetchKanjis();
            toast.success("Tạo Kanji thành công!", "Dữ liệu Hán tự đã được thêm vào hệ thống.");
        } catch (error: any) {
            console.error("Failed to create kanji:", error);
            toast.error("Thất bại", error.message || "Không thể tạo Kanji");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = (id: string) => {
        setKanjiToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!kanjiToDelete) return;

        setIsDeleting(true);
        try {
            await kanjiService.delete(kanjiToDelete);
            toast.success("Đã xóa Kanji", "Hán tự đã được loại bỏ khỏi hệ thống.");
            setIsDeleteModalOpen(false);
            setKanjiToDelete(null);
            await fetchKanjis();
        } catch (error: any) {
            toast.error("Lỗi xóa", error.message || "Không thể xóa Kanji");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenEdit = (kanji: KanjiResponse) => {
        setEditingKanji(kanji);
        setEditForm({
            character: kanji.character,
            meaning: kanji.meaning,
            onyomi: kanji.onyomi,
            kunyomi: kanji.kunyomi
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingKanji) return;

        setIsUpdating(true);
        try {
            await kanjiService.update(editingKanji.id, editForm);
            toast.success("Cập nhật thành công", "Thông tin Kanji đã được lưu lại.");
            setEditingKanji(null);
            await fetchKanjis();
        } catch (error: any) {
            toast.error("Cập nhật thất bại", error.message || "Không thể cập nhật Kanji");
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredKanjis = kanjis.filter(k =>
        k.character.includes(searchQuery) ||
        k.meaning?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="p-8 space-y-8 relative">
            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setKanjiToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Xóa Kanji"
                message="Bạn có chắc chắn muốn xóa Kanji này không? Hành động này không thể hoàn tác."
                confirmText="Xác nhận xóa"
                cancelText="Hủy"
                isDanger={true}
                isLoading={isDeleting}
                isDark={isDark}
            />

            {/* Edit Modal */}
            {editingKanji && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingKanji(null)} />
                    <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white"}`}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Chỉnh sửa Kanji</h2>
                            <button onClick={() => setEditingKanji(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Hán tự</label>
                                <input
                                    type="text"
                                    maxLength={1}
                                    value={editForm.character}
                                    onChange={e => setEditForm({ ...editForm, character: e.target.value })}
                                    className={`w-full p-3 rounded-xl border outline-none ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ý nghĩa</label>
                                <textarea
                                    value={editForm.meaning}
                                    onChange={e => setEditForm({ ...editForm, meaning: e.target.value })}
                                    className={`w-full p-3 rounded-xl border outline-none h-24 ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Onyomi</label>
                                    <input
                                        type="text"
                                        value={editForm.onyomi}
                                        onChange={e => setEditForm({ ...editForm, onyomi: e.target.value })}
                                        className={`w-full p-3 rounded-xl border outline-none ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Kunyomi</label>
                                    <input
                                        type="text"
                                        value={editForm.kunyomi}
                                        onChange={e => setEditForm({ ...editForm, kunyomi: e.target.value })}
                                        className={`w-full p-3 rounded-xl border outline-none ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200"}`}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingKanji(null)}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm ${isDark ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Lưu thay đổi"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <div>
                <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                    <Languages className={`w-8 h-8 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                    Quản lý Kanji
                </h1>
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Thêm mới Hán tự vào hệ thống bằng cách nhập mặt chữ.
                </p>
            </div>

            {/* Create Section */}
            <div className={`p-6 rounded-2xl border shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <h3 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Thêm Kanji Mới
                </h3>
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Nhập chữ Hán (ví dụ: 水, 曜)..."
                            value={newCharacter}
                            onChange={(e) => setNewCharacter(e.target.value)}
                            maxLength={1}
                            className={`w-full pl-4 pr-10 py-3 rounded-xl border text-sm outline-none transition ${isDark
                                ? "bg-gray-900 border-gray-700 text-white focus:ring-2 focus:ring-indigo-500/50"
                                : "bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-indigo-500/20"
                                }`}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating || !newCharacter.trim()}
                        className={`px-8 py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 ${isCreating || !newCharacter.trim()
                            ? "bg-gray-500 cursor-not-allowed opacity-50"
                            : "bg-indigo-600 hover:bg-indigo-700"
                            }`}
                    >
                        {isCreating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Plus className="w-4 h-4" />
                        )}
                        Tạo Kanji
                    </button>
                </form>
            </div>

            {/* List Section */}
            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                        <h3 className={`font-bold uppercase tracking-wider text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                            Danh sách Kanji ({filteredKanjis.length})
                        </h3>
                    </div>

                    {/* Search bar */}
                    <div className="relative w-full sm:w-64">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm kanji..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border outline-none transition ${isDark
                                ? "bg-gray-800 border-gray-700 text-white focus:border-indigo-500"
                                : "bg-white border-gray-200 text-gray-900 focus:border-indigo-400"
                                }`}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    </div>
                ) : filteredKanjis.length === 0 ? (
                    <div className={`text-center py-20 rounded-3xl border border-dashed ${isDark ? "border-gray-700 bg-gray-800/50 text-gray-500" : "border-gray-200 bg-white text-gray-400"}`}>
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Không tìm thấy Kanji nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredKanjis.map((kanji) => (
                            <div
                                key={kanji.id}
                                className={`p-5 rounded-2xl border transition-all hover:shadow-md group relative ${isDark ? "bg-gray-800 border-gray-700 hover:border-indigo-500/50" : "bg-white border-gray-100 hover:border-indigo-300"}`}
                            >
                                {/* Quick Actions */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenEdit(kanji)}
                                        className={`p-2 rounded-lg transition ${isDark ? "bg-gray-700 text-indigo-400 hover:bg-gray-600" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(kanji.id)}
                                        className={`p-2 rounded-lg transition ${isDark ? "bg-gray-700 text-red-400 hover:bg-gray-600" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                                        title="Xóa"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex items-start justify-between">
                                    <div className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                        {kanji.character}
                                    </div>
                                    <div className={`p-2 rounded-lg ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-50 text-gray-400"}`}>
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="space-y-1">
                                        <div className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? "text-gray-500" : "text-gray-400"}`}>Ý nghĩa</div>
                                        <div className={`text-sm font-medium line-clamp-2 min-h-[40px] ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                            {kanji.meaning || "Chưa cập nhật"}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <div className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? "text-gray-500" : "text-gray-400"}`}>Onyomi</div>
                                            <div className={`text-xs font-medium truncate ${isDark ? "text-indigo-300" : "text-indigo-600"}`}>
                                                {kanji.onyomi || "—"}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className={`text-[10px] font-bold uppercase tracking-tighter ${isDark ? "text-gray-500" : "text-gray-400"}`}>Kunyomi</div>
                                            <div className={`text-xs font-medium truncate ${isDark ? "text-teal-300" : "text-teal-600"}`}>
                                                {kanji.kunyomi || "—"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center gap-2">
                                        <Layers className={`w-3 h-3 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                                        <span className={`text-[10px] font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                            {kanji.svgStrokes?.length || 0} nét vẽ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
