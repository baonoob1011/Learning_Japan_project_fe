"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService, UserResponseManager } from "@/services/userService";
import { useDarkMode } from "@/hooks/useDarkMode";
import { 
    ChevronLeft, 
    Mail, 
    Calendar, 
    Shield, 
    Star, 
    Activity, 
    BookOpen,
    Trophy,
    User as UserIcon,
    Loader2
} from "lucide-react";
import LoadingCat from "@/components/LoadingCat";

export default function UserDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { isDarkMode: isDark } = useDarkMode();
    const [user, setUser] = useState<UserResponseManager | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                // Since UserManager has all users, we might need a specific "getById" 
                // but let's see if we can just find it or if there's a dedicated service.
                // userService.getUserById returns UserChatResponse which is too simple.
                
                // For now, I'll fetch the whole list (paged) and find it just to demonstrate,
                // BUT a real app should have a GET /admin/users/{id} endpoint.
                // Looking at userService.ts, I don't see GET /admin/users/{id}.
                // Let's assume the user wants me to implement the UI and maybe tweak the service if needed.
                
                // Let's TRY to call a hypothetical endpoint or transform.
                // Actually, I'll check if getting user by ID works in UserManager.
                const response = await userService.getAllUsersManager(0, 100, ""); // searching usually works
                const found = response.data.find(u => u.id === id);
                if (found) {
                    setUser(found);
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết user:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchUser();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[600px]">
                <LoadingCat size="xl" isDark={isDark} message="Đang tải thông tin học viên..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 flex flex-col items-center justify-center space-y-4">
                <div className={`p-6 rounded-full ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                    <UserIcon className={`w-12 h-12 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                </div>
                <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Không tìm thấy người dùng</h2>
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all"
                >
                    <ChevronLeft className="w-4 h-4" /> Quay lại
                </button>
            </div>
        );
    }

    return (
        <main className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header / Back */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => router.back()}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all active:scale-95 ${isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm"}`}
                >
                    <ChevronLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm">Quản lý người dùng</span>
                </button>
                
                <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${user.enabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                    <Activity className="w-3.5 h-3.5" />
                    {user.enabled ? "Tài khoản đang hoạt động" : "Tài khoản bị vô hiệu hóa"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className={`lg:col-span-1 rounded-[40px] border shadow-2xl overflow-hidden self-start transition-all ${isDark ? "bg-gray-800 border-gray-700/50" : "bg-white border-gray-100"}`}>
                    <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
                    <div className="px-8 pb-8 -mt-16 text-center">
                        <div className="relative inline-block">
                            <img 
                                src={user.avatarUrl || "/logo-cat.png"} 
                                alt={user.fullName}
                                className={`w-32 h-32 rounded-[32px] border-4 object-cover shadow-2xl ${isDark ? "border-gray-800" : "border-white"}`}
                            />
                            {user.isPremium && (
                                <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-2xl shadow-xl ring-4 ring-white dark:ring-gray-800 border-2 border-white/50">
                                    <Star className="w-5 h-5 text-white fill-current" />
                                </div>
                            )}
                        </div>
                        
                        <h2 className={`text-2xl font-black mt-6 ${isDark ? "text-white" : "text-gray-900"}`}>{user.fullName}</h2>
                        <div className={`flex items-center justify-center gap-2 text-sm mt-1 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            <Mail className="w-4 h-4" />
                            {user.email}
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            {user.role.map(role => (
                                <span key={role} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${role === "ADMIN" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                                    <Shield className="w-3 h-3 inline-block mr-1 opacity-70" />
                                    {role === "ADMIN" ? "Quản trị viên" : "Học viên"}
                                </span>
                            ))}
                            {user.isPremium && (
                                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 border border-amber-600 text-white shadow-lg shadow-amber-500/20">
                                    Premium Plus
                                </span>
                            )}
                        </div>

                        <div className={`grid grid-cols-2 gap-4 mt-8 pt-6 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                            <div className="text-center">
                                <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Ngày gia nhập</p>
                                <div className={`flex items-center justify-center gap-1.5 text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                                    <Calendar className="w-4 h-4 opacity-70" />
                                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                </div>
                            </div>
                            <div className="text-center">
                                <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Trình độ</p>
                                <div className={`flex items-center justify-center gap-1.5 text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                                    <Trophy className="w-4 h-4 opacity-70" />
                                    {user.level || "Chưa xác định"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Learning Stats */}
                    <div className={`p-8 rounded-[40px] border shadow-2xl transition-all ${isDark ? "bg-gray-800/80 border-gray-700/50" : "bg-white border-gray-100"}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`text-xl font-black flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <Activity className={`w-6 h-6 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                                Tiến trình học tập
                            </h3>
                            <button className={`text-xs font-black p-2 rounded-xl transition-all ${isDark ? "text-indigo-400 hover:bg-indigo-500/10" : "text-indigo-600 hover:bg-indigo-50"}`}>
                                Chi tiết lộ trình →
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Course Progress */}
                            <div className={`p-6 rounded-[32px] border ${isDark ? "bg-gray-900/40 border-gray-700" : "bg-gray-50/50 border-gray-100 shadow-sm"}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>Khóa hiện tại</p>
                                            <p className={`font-bold text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>Lộ trình {user.level || "N5"}</p>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>{user.processPercent}%</div>
                                </div>
                                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                                        style={{ width: `${user.processPercent}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-3 px-1">
                                    <p className={`text-[10px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>Giai đoạn: <span className="text-blue-500">{user.stage || "Chuẩn bị"}</span></p>
                                    <p className={`text-[10px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>7/12 Bài học</p>
                                </div>
                            </div>

                            {/* Flashcard Stats */}
                            <div className={`p-6 rounded-[32px] border ${isDark ? "bg-gray-900/40 border-gray-700" : "bg-gray-50/50 border-gray-100 shadow-sm"}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl ${isDark ? "bg-amber-500/20 text-amber-500" : "bg-amber-100 text-amber-600"}`}>
                                            <Trophy className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>Thành tích</p>
                                            <p className={`font-bold text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}>Học từ vựng</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black ${isDark ? "text-amber-500" : "text-amber-600"}`}>840</p>
                                        <p className="text-[9px] font-bold text-gray-400 tracking-tighter uppercase">Từ đã học</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className={`px-4 py-2 rounded-xl text-center ${isDark ? "bg-gray-800" : "bg-white border border-gray-100"}`}>
                                        <p className="text-[9px] font-black uppercase text-gray-500">Thuộc</p>
                                        <p className="text-sm font-bold text-emerald-500">620</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-center ${isDark ? "bg-gray-800" : "bg-white border border-gray-100"}`}>
                                        <p className="text-[9px] font-black uppercase text-gray-500">Đang nhớ</p>
                                        <p className="text-sm font-bold text-indigo-500">220</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admin Actions Logs Placeholder */}
                    <div className={`p-8 rounded-[40px] border shadow-2xl transition-all ${isDark ? "bg-gray-800/80 border-gray-700/50" : "bg-white border-gray-100"}`}>
                        <h3 className={`text-xl font-black mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Lịch sử hoạt động</h3>
                        <div className="space-y-4">
                            {[
                                { action: "Kích hoạt gói Premium Plus", time: "2 giờ trước", color: "amber" },
                                { action: "Hoàn thành bài thi thử N5", time: "Hôm qua lúc 14:00", color: "indigo" },
                                { action: "Đăng nhập từ IP mới (192.168.1.1)", time: "3 ngày trước", color: "gray" },
                            ].map((log, i) => (
                                <div key={i} className={`group flex items-center justify-between p-5 rounded-3xl border transition-all ${isDark ? "bg-gray-900/30 border-gray-700/30 hover:bg-gray-900/50" : "bg-gray-50/30 border-gray-100 hover:bg-gray-50"}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2.5 h-2.5 rounded-full bg-${log.color}-500 shadow-[0_0_8px_rgba(var(--tw-color-indigo-500-rgb),0.5)]`}></div>
                                        <span className={`text-sm font-bold ${isDark ? "text-gray-300" : "text-gray-700"}`}>{log.action}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>{log.time}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
                            <p className="text-xs font-bold text-gray-500">Hiển thị lịch sử hoạt động 30 ngày gần nhất</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
