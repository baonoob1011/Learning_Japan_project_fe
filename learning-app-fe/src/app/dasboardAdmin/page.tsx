"use client";
import React from "react";
import { useRouter } from "next/navigation";
import RevenueExhibition from "@/components/admin/dashboard/RevenueExhibition";
import RevenueAnalytics from "@/components/admin/dashboard/RevenueAnalytics";
import MonthlyRevenueAnalytics from "@/components/admin/dashboard/MonthlyRevenueAnalytics";
import TransactionHistory from "@/components/admin/dashboard/TransactionHistory";
import UserManagementPreview from "@/components/admin/dashboard/UserManagementPreview";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Activity, LayoutGrid, Clock, ChevronRight, Languages, BookOpen, Crown, FileText } from "lucide-react";

export default function DashboardAdmin() {
    const router = useRouter();
    const { isDarkMode: isDark } = useDarkMode();

    return (
        <main className="p-8 space-y-12">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className={`text-3xl font-black tracking-tight ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                        Tổng Quan Hệ Thống
                    </h2>
                    <div className={`flex items-center gap-2 mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        <Clock className="w-4 h-4" />
                        <span>Cập nhật mới nhất: {new Date().toLocaleTimeString('vi-VN')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    GIÁM SÁT TRỰC TUYẾN
                </div>
            </div>

            {/* Revenue Summary Cards */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full"></div>
                    <h3 className={`font-black uppercase tracking-widest text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>Chỉ số doanh thu</h3>
                </div>
                <RevenueExhibition isDark={isDark} />
            </section>

            {/* Revenue Charts & Ranking */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                    <h3 className={`font-black uppercase tracking-widest text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>Phân tích chuyên sâu</h3>
                </div>
                <RevenueAnalytics isDark={isDark} />
            </section>

            {/* Monthly Analytics */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                    <h3 className={`font-black uppercase tracking-widest text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>Báo cáo doanh thu định kỳ</h3>
                </div>
                <MonthlyRevenueAnalytics isDark={isDark} />
            </section>

            {/* Transaction History */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                    <h3 className={`font-black uppercase tracking-widest text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>Dòng tiền hệ thống</h3>
                </div>
                <TransactionHistory isDark={isDark} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-8 bg-orange-500 rounded-full"></div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>Người dùng mới</h3>
                        </div>
                        <UserManagementPreview isDark={isDark} />
                    </section>
                </div>

                <div className="lg:col-span-2">
                    <section className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-8 bg-purple-500 rounded-full"></div>
                            <h3 className={`font-black uppercase tracking-widest text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>Hành động nhanh</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => router.push('/dasboardAdmin/exams')}
                                className={`p-6 rounded-3xl border shadow-sm transition-all text-left flex items-start gap-4 group ${isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-100 hover:border-red-300 hover:shadow-md"}`}
                            >
                                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${isDark ? "bg-red-500/20 text-red-400" : "bg-red-50 text-red-600"}`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Quản lý Đề thi</h4>
                                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Soạn thảo và cấu hình đề thi JLPT.</p>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 mt-3">
                                        Truy cập ngay <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={() => router.push('/dasboardAdmin/courses')}
                                className={`p-6 rounded-3xl border shadow-sm transition-all text-left flex items-start gap-4 group ${isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-100 hover:border-indigo-300 hover:shadow-md"}`}
                            >
                                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Quản lý Khóa học</h4>
                                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Cập nhật nội dung bài học, chương trình.</p>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 mt-3">
                                        Truy cập ngay <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={() => router.push('/dasboardAdmin/vip')}
                                className={`p-6 rounded-3xl border shadow-sm transition-all text-left flex items-start gap-4 group ${isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-100 hover:border-blue-300 hover:shadow-md"}`}>
                                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                                    <Crown className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Quản lý Gói VIP</h4>
                                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Cấu hình giá và đặc quyền hội viên.</p>
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold mt-3 ${isDark ? "text-blue-600" : "text-blue-600"}`}>
                                        Truy cập ngay <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={() => router.push('/dasboardAdmin/kanji')}
                                className={`p-6 rounded-3xl border shadow-sm transition-all text-left flex items-start gap-4 group ${isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-100 hover:border-purple-300 hover:shadow-md"}`}
                            >
                                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
                                    <Languages className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Quản lý Kanji</h4>
                                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Thêm mới và quản lý danh sách Hán tự.</p>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 mt-3">
                                        Truy cập ngay <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={() => router.push('/dasboardAdmin/users')}
                                className={`p-6 rounded-3xl border shadow-sm transition-all text-left flex items-start gap-4 group ${isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-100 hover:border-emerald-300 hover:shadow-md"}`}
                            >
                                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                                    <LayoutGrid className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Quản lý Học viên</h4>
                                    <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Xem danh sách và phân quyền người dùng.</p>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-3">
                                        Truy cập ngay <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
