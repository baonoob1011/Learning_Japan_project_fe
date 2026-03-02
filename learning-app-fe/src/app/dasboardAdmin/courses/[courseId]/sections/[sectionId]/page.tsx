"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import { BookOpen, BookText, CheckCircle2, ChevronRight, Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { courseService, CourseResponse } from "@/services/courseService";
import { sectionService, SectionResponse } from "@/services/sectionService";
import { lessonService, LessonResponse, CreateLessonRequest } from "@/services/lessonService";
import { LessonLevel } from "@/enums/LessonLevel";

export default function AdminLessonManagerPage({ params }: { params: Promise<{ courseId: string, sectionId: string }> }) {
    const router = useRouter();
    const { courseId, sectionId } = use(params);
    const [isReady, setIsReady] = useState(false);
    const { isDarkMode: isDark } = useDarkMode();

    const [course, setCourse] = useState<CourseResponse | null>(null);
    const [section, setSection] = useState<SectionResponse | null>(null);
    const [lessons, setLessons] = useState<LessonResponse[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newLevel, setNewLevel] = useState<LessonLevel>(LessonLevel.N5_BEGINNER);
    const [newOrder, setNewOrder] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!isReady || !courseId || !sectionId) return;

        const fetchAll = async () => {
            try {
                const [courseData, sectionData, lessonsData] = await Promise.all([
                    courseService.getDetail(courseId),
                    sectionService.getDetail(sectionId),
                    lessonService.getBySection(sectionId)
                ]);
                setCourse(courseData);
                setSection(sectionData);

                // Sort lessons array just in case
                lessonsData.sort((a, b) => a.lessonOrder - b.lessonOrder);
                setLessons(lessonsData);
                setNewOrder(lessonsData.length + 1);
            } catch (error) {
                console.error("Failed to fetch lesson data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [isReady, courseId, sectionId]);

    const handleCreateLesson = async () => {
        if (!newTitle.trim() || newOrder < 1) return;
        setIsSubmitting(true);
        try {
            const req: CreateLessonRequest = {
                sectionId,
                title: newTitle.trim(),
                lessonLevel: newLevel,
                lessonOrder: newOrder
            };
            const newId = await lessonService.create(req);

            // Re-fetch lessons to get full updated array
            const updated = await lessonService.getBySection(sectionId);
            updated.sort((a, b) => a.lessonOrder - b.lessonOrder);
            setLessons(updated);

            setNewTitle("");
            setNewOrder(updated.length + 1);
            setIsAdding(false);
        } catch (error) {
            console.error(error);
            alert("Create failed!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLesson = async (e: React.MouseEvent, lessonId: string) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc muốn xóa Lesson này? Mọi file đính kèm/nội dung bên trong sẽ bị mất.")) return;

        try {
            await lessonService.delete(lessonId);
            setLessons(prev => {
                const updated = prev.filter(l => l.id !== lessonId);
                // Update default next order
                setNewOrder(updated.length + 1);
                return updated;
            });
        } catch (error) {
            console.error("Failed to delete lesson", error);
            alert("Xóa không thành công!");
        }
    };

    if (!isReady) return null;

    return (
        <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
            {/* Breadcrumbs */}
            <div className={`flex items-center gap-2 text-sm font-medium mb-4 ${isDark ? "text-gray-400" : "text-gray-500"} overflow-x-auto whitespace-nowrap pb-2 custom-scrollbar`}>
                <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => router.push('/dasboardAdmin')}>Dashboard</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => router.push('/dasboardAdmin/courses')}>Khóa học</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => router.push(`/dasboardAdmin/courses/${courseId}`)}>{course?.title || "Đang tải..."}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>{section?.title || "Đang tải..."}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/dasboardAdmin/courses/${courseId}`)}
                        className={`p-2.5 rounded-full border transition-all ${isDark ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <BookText className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                            Bài giảng (Lessons)
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Quản lý các bài học thuộc Section: <strong className={isDark ? "text-gray-200" : "text-gray-700"}>{section?.title}</strong>
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm"
                >
                    <Plus className="w-4 h-4" /> {isAdding ? "Hủy Thêm" : "Tạo Lesson mới"}
                </button>
            </div>

            {/* Form thêm mới Modal-like (inline) */}
            {isAdding && (
                <div className={`p-6 rounded-2xl border shadow-xl ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Thêm Bài Giảng (Lesson) Mới</h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Tên Bài học <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                autoFocus
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Ví dụ: Bài 1: Xin chào hội thoại"
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
                            />
                        </div>
                        <div className="sm:col-span-1">
                            <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Thứ tự (Order) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min="1"
                                value={newOrder}
                                onChange={(e) => setNewOrder(Number(e.target.value))}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
                            />
                        </div>
                        <div className="sm:col-span-3">
                            <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Trình độ cốt lõi (Mặc định gợi ý theo thiết lập chung) <span className="text-red-500">*</span></label>
                            <select
                                value={newLevel}
                                onChange={(e) => setNewLevel(e.target.value as LessonLevel)}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
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
                            onClick={handleCreateLesson}
                            disabled={isSubmitting || !newTitle.trim() || newOrder < 1}
                            className={`px-5 py-2 font-bold text-sm text-white rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 ${isSubmitting || !newTitle.trim() || newOrder < 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang thêm...</> : <><CheckCircle2 className="w-4 h-4" /> Xác nhận tạo</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Danh sách Lesson */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="space-y-4">
                    {lessons.length === 0 ? (
                        <div className={`p-12 text-center rounded-2xl border border-dashed flex flex-col items-center opacity-80 ${isDark ? "border-gray-700 bg-gray-800/20" : "border-gray-300 bg-gray-50"}`}>
                            <BookText className={`w-12 h-12 mx-auto mb-3 opacity-20 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
                            <h3 className={`font-bold text-lg ${isDark ? "text-gray-300" : "text-gray-700"}`}>Chưa có Bài học (Lesson) nào</h3>
                            <p className={`text-sm mt-1 px-4 ${isDark ? "text-gray-500" : "text-gray-500"}`}>Sau khi thêm lesson, bạn có thể bấm vào Lesson để thêm bài tập luyện tập, documents, hay vocab.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 font-bold text-sm rounded-lg transition-colors"
                            >
                                Tạo Bài học đầu tiên
                            </button>
                        </div>
                    ) : (
                        lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${isDark ? "bg-gray-800 border-gray-700 hover:border-blue-500/50" : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/10"}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-lg border-2 ${isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200"}`}>
                                        {lesson.lessonOrder}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>{lesson.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                                                {lesson.lessonLevel}
                                            </span>
                                            <span className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                Ngày tạo: {lesson.createdAt ? new Date(lesson.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mt-4 sm:mt-0 justify-end w-full sm:w-auto">
                                    <button
                                        onClick={() => router.push(`/dasboardAdmin/courses/${courseId}/sections/${sectionId}/lessons/${lesson.id}`)}
                                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${isDark ? "border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20" : "border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"}`}>
                                        Cấu trúc Bài học
                                    </button>

                                    <button
                                        onClick={(e) => handleDeleteLesson(e, lesson.id)}
                                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-50 text-red-500"}`}
                                        title="Xóa bài học này"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </main>
    );
}
