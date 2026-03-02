"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/dashboard/AdminHeader";
import { useAuthStore } from "@/stores/authStore";
import { getRolesFromToken } from "@/utils/jwt";
import { useDarkMode } from "@/hooks/useDarkMode";
import { BookOpen, Layers, CheckCircle2, ChevronRight, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { courseService, CourseResponse } from "@/services/courseService";
import { sectionService, SectionResponse, CreateSectionRequest } from "@/services/sectionService";
import { LessonLevel } from "@/enums/LessonLevel";

export default function AdminSectionManagerPage({ params }: { params: Promise<{ courseId: string }> }) {
    const router = useRouter();
    const { courseId } = use(params);
    const [isReady, setIsReady] = useState(false);
    const { isDarkMode: isDark } = useDarkMode();

    const [course, setCourse] = useState<CourseResponse | null>(null);
    const [sections, setSections] = useState<SectionResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newLevel, setNewLevel] = useState<LessonLevel>(LessonLevel.N5_BEGINNER);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) { return router.push("/login"); }
        const roles = getRolesFromToken(accessToken);
        if (!roles.includes("ADMIN")) { return router.push("/login"); }
        setIsReady(true);
    }, [router]);

    useEffect(() => {
        if (!isReady || !courseId) return;

        const fetchAll = async () => {
            try {
                const [courseData, sectionsData] = await Promise.all([
                    courseService.getDetail(courseId),
                    sectionService.getByCourse(courseId)
                ]);
                setCourse(courseData);
                setSections(sectionsData);
            } catch (error) {
                console.error("Failed to fetch section data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [isReady, courseId]);

    const handleCreateSection = async () => {
        if (!newTitle.trim()) return;
        setIsSubmitting(true);
        try {
            const req: CreateSectionRequest = {
                courseId,
                title: newTitle.trim(),
                lessonLevel: newLevel
            };
            const newId = await sectionService.create(req);

            // Re-fetch to get full object or manually add
            const updated = await sectionService.getByCourse(courseId);
            setSections(updated);

            setNewTitle("");
            setIsAdding(false);
        } catch (error) {
            console.error(error);
            alert("Create failed!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSection = async (e: React.MouseEvent, sectionId: string) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc muốn xóa section này? Mọi dữ liệu (lessons, documents) bên trong có thể bị mất.")) return;

        try {
            await sectionService.delete(sectionId);
            setSections(prev => prev.filter(s => s.id !== sectionId));
        } catch (error) {
            console.error("Failed to delete section", error);
            alert("Xóa không thành công!");
        }
    };

    if (!isReady) return null;

    return (
        <div className={`flex min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-[#F3F4F6]"}`}>
            <Sidebar isDark={isDark} />

            <div className={`flex-1 ml-64 flex flex-col transition-colors duration-300 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                <AdminHeader isDarkMode={isDark} />

                <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
                    {/* Breadcrumbs */}


                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/dasboardAdmin/courses')}
                                className={`p-2.5 rounded-full border transition-all ${isDark ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"}`}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    <Layers className={`w-8 h-8 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                                    Chương (Sections)
                                </h1>
                                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Quản lý cấu trúc của khóa học: <strong className={isDark ? "text-gray-200" : "text-gray-700"}>{course?.title}</strong></p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm"
                        >
                            <Plus className="w-4 h-4" /> {isAdding ? "Hủy Thêm" : "Tạo Section mới"}
                        </button>
                    </div>

                    {/* Form thêm mới Modal-like (inline) */}
                    {isAdding && (
                        <div className={`p-6 rounded-2xl border shadow-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-purple-100"}`}>
                            <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Thêm Chương (Section) Mới</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Tên Section <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Ví dụ: Chương 1: Bảng chữ cái"
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Trình độ (Lesson Level) <span className="text-red-500">*</span></label>
                                    <select
                                        value={newLevel}
                                        onChange={(e) => setNewLevel(e.target.value as LessonLevel)}
                                        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                                    >
                                        <option value={LessonLevel.N5_BEGINNER}>N5 Sơ cấp</option>
                                        <option value={LessonLevel.N5_ELEMENTARY}>N5 Sơ trung cấp</option>
                                        <option value={LessonLevel.N4_BEGINNER}>N4 Sơ cấp</option>
                                        <option value={LessonLevel.N4_ELEMENTARY}>N4 Sơ trung cấp</option>
                                        <option value={LessonLevel.N3_INTERMEDIATE}>N3 Trung cấp</option>
                                        <option value={LessonLevel.N2_UPPER}>N2 Cao cấp</option>
                                        <option value={LessonLevel.N1_ADVANCED}>N1 Thượng cấp</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className={`px-4 py-2 font-bold text-sm rounded-xl transition-colors ${isDark ? "text-gray-400 hover:text-white hover:bg-gray-700" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}`}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleCreateSection}
                                    disabled={isSubmitting || !newTitle.trim()}
                                    className={`px-5 py-2 font-bold text-sm text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 ${isSubmitting || !newTitle.trim() ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
                                >
                                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang thêm...</> : <><CheckCircle2 className="w-4 h-4" /> Xác nhận tạo</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Danh sách Section */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sections.length === 0 ? (
                                <div className={`p-12 text-center rounded-2xl border border-dashed ${isDark ? "border-gray-700 bg-gray-800/30" : "border-gray-300 bg-gray-50"}`}>
                                    <Layers className={`w-12 h-12 mx-auto mb-3 opacity-20 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                                    <h3 className={`font-bold text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>Chưa có Chương (Section) nào</h3>
                                    <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>Hãy tạo section đầu tiên để xây dựng cấu trúc khóa học.</p>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 font-bold text-sm rounded-lg transition-colors"
                                    >
                                        Tạo Section ngay
                                    </button>
                                </div>
                            ) : (
                                sections.map((section, index) => (
                                    <div
                                        key={section.id}
                                        onClick={() => router.push(`/dasboardAdmin/courses/${courseId}/sections/${section.id}`)}
                                        className={`group flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg ${isDark ? "bg-gray-800 border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/80" : "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/10"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"}`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${isDark ? "text-white" : "text-gray-900"}`}>{section.title}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                                        {section.lessonLevel}
                                                    </span>
                                                    <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                        Tạo lúc: {new Date(section.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => handleDeleteSection(e, section.id)}
                                                className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-50 text-red-500"}`}
                                                title="Xóa section"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
