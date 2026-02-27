"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/dashboard/AdminHeader";
import { useAuthStore } from "@/stores/authStore";
import { getRolesFromToken } from "@/utils/jwt";
import { useDarkMode } from "@/hooks/useDarkMode";
import { BookOpen, Map, CheckCircle2, ChevronRight, Loader2, Library, Star, EyeOff, LayoutGrid, Search } from "lucide-react";
import { courseService, CourseResponse } from "@/services/courseService";

export default function AdminCourseManagerPage() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);
    const { isDarkMode: isDark } = useDarkMode();
    const [courses, setCourses] = useState<CourseResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) { return router.push("/login"); }
        const roles = getRolesFromToken(accessToken);
        if (!roles.includes("ADMIN")) { return router.push("/login"); }
        setIsReady(true);
    }, [router]);

    useEffect(() => {
        if (!isReady) return;
        const fetchCourses = async () => {
            try {
                const data = await courseService.getAll();
                setCourses(data);
            } catch (error) {
                console.error("Failed to load courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [isReady]);

    const handleToggleActive = async (e: React.MouseEvent, courseId: string) => {
        e.stopPropagation();
        try {
            await courseService.toggleActive(courseId);
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, isActive: !c.isActive } : c));
        } catch (error) {
            console.error("Failed to toggle course active status:", error);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.level.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isReady) return null;

    return (
        <div className={`flex min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-[#F3F4F6]"}`}>
            <Sidebar isDark={isDark} />

            <div className={`flex-1 ml-64 flex flex-col transition-colors duration-300 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                <AdminHeader isDarkMode={isDark} />

                <main className="p-8 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => router.push('/dasboardAdmin')}>Dashboard</span>
                                <ChevronRight className="w-4 h-4" />
                                <span className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Khóa học</span>
                            </div>
                            <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <Library className={`w-8 h-8 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                Quản lý Khóa học
                            </h1>
                            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Xem, chỉnh sửa và quản lý các khóa học trong hệ thống.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.push('/dasboardAdmin/courses/create')}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm"
                            >
                                <BookOpen className="w-4 h-4" /> Tạo khóa học mới
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-100"}`}>
                        <div className="relative w-full sm:w-96">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                            <input
                                type="text"
                                placeholder="Tìm theo tên khóa học, level..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
                            />
                        </div>
                        <div className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Tổng cộng: <span className={`font-bold ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>{filteredCourses.length}</span> khóa học
                        </div>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    onClick={() => router.push(`/dasboardAdmin/courses/${course.id}`)}
                                    className={`group cursor-pointer rounded-3xl border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? "bg-gray-800 border-gray-700/50 hover:border-indigo-500/50" : "bg-white border-gray-100 hover:border-indigo-200"}`}
                                >
                                    <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        {course.imageUrl ? (
                                            <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20">
                                                <BookOpen className="w-12 h-12 text-indigo-300 dark:text-indigo-700" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 flex items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500 text-white text-[10px] font-black tracking-wider uppercase shadow-sm">
                                                {course.level}
                                            </span>
                                        </div>
                                        {!course.isActive && (
                                            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                                <span className="px-3 py-1 bg-gray-800/80 text-gray-200 text-xs font-bold rounded-lg border border-gray-600 flex items-center gap-1">
                                                    <EyeOff className="w-3.5 h-3.5" /> Bị ẩn
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className={`font-bold text-lg line-clamp-2 leading-tight ${isDark ? "text-white" : "text-gray-900"} group-hover:text-indigo-500 transition-colors`}>{course.title}</h3>

                                        <div className="mt-auto pt-4 flex flex-col gap-3">
                                            <div className={`flex items-center justify-between text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                <div className="flex items-center gap-1.5">
                                                    <Map className="w-4 h-4" />
                                                    <span>{
                                                        course.lessonProcess === "JUNBI" ? "Học nền" :
                                                            course.lessonProcess === "TAISAKU" ? "Ôn luyện chiến lược" :
                                                                course.lessonProcess === "PRACTICE" ? "Luyện đề" :
                                                                    "Không xác định"
                                                    }</span>
                                                </div>
                                            </div>

                                            <div className={`pt-3 border-t flex items-center justify-between ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                                                {course.isPaid ? (
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-amber-500" : "text-amber-600"}`}>Premium</span>
                                                        <span className={`font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>{formatCurrency(course.price)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-green-500" : "text-green-600"}`}>Miễn phí</span>
                                                        <span className={`font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>0 đ</span>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>

                                    {/* Action bar on hover? Or static */}
                                    <div className={`px-5 py-3 border-t flex items-center justify-between transition-colors ${isDark ? "bg-gray-800/80 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
                                        <button
                                            onClick={(e) => handleToggleActive(e, course.id)}
                                            className={`text-[11px] font-bold uppercase py-1.5 px-3 rounded-lg border transition-all ${course.isActive ? isDark ? "border-green-500/30 text-green-400 bg-green-500/10 hover:bg-green-500/20" : "border-green-200 text-green-600 bg-green-50 hover:bg-green-100" : isDark ? "border-gray-600 text-gray-400 bg-gray-800 hover:bg-gray-700" : "border-gray-300 text-gray-500 bg-white hover:bg-gray-100"}`}
                                        >
                                            {course.isActive ? "Đang hiển thị" : "Bị ẩn"}
                                        </button>
                                        <span className={`text-xs font-bold flex items-center gap-1 transition-colors ${isDark ? "text-gray-400 group-hover:text-indigo-400" : "text-gray-500 group-hover:text-indigo-600"}`}>
                                            Chi tiết <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {filteredCourses.length === 0 && !loading && (
                                <div className={`col-span-full py-20 text-center ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                    <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Không tìm thấy khóa học nào</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
