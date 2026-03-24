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
    const [orders, setOrders] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch User Detail
                const userDetail = await userService.getUserDetailAdmin(id);
                setUser(userDetail);

                // 2. Fetch Orders (Transaction History)
                const userOrders = await userService.getUserOrdersAdmin(id);
                setOrders(userOrders);

                // 3. Fetch Activity Logs
                if (userDetail.email) {
                    const activityLogs = await userService.getSystemLogsAdmin(userDetail.email);
                    setLogs(activityLogs.data);
                }
            } catch (error) {
                console.error("Lỗi lấy dữ liệu user:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchAllData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 min-h-[600px]">
                <LoadingCat size="xl" isDark={isDark} message="Đang tải dữ liệu học viên..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`p-16 flex flex-col items-center justify-center space-y-6 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
                <div className={`p-8 rounded-[40px] shadow-2xl ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}>
                    <UserIcon className={`w-16 h-16 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>Không tìm thấy người dùng</h2>
                    <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>ID người dùng không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
                </div>
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                >
                    <ChevronLeft className="w-5 h-5" /> Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <main className={`p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
            {/* Header / Back */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button 
                    onClick={() => router.back()}
                    className={`group flex items-center gap-2 px-5 py-2.5 rounded-[20px] border transition-all active:scale-95 ${isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm"}`}
                >
                    <ChevronLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black text-sm uppercase tracking-tighter">Quay lại danh sách</span>
                </button>
                
                <div className={`px-5 py-2.5 rounded-full border text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5 shadow-sm ${user.enabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${user.enabled ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                    {user.enabled ? "Tài khoản đang hoạt động" : "Tài khoản bị vô hiệu hóa"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Card (Left column - span 4) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className={`rounded-[40px] border shadow-2xl overflow-hidden transition-all ${isDark ? "bg-gray-800 border-gray-700/50" : "bg-white border-gray-100"}`}>
                        <div className="h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"></div>
                        <div className="px-8 pb-10 -mt-20 text-center">
                            <div className="relative inline-block group">
                                <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-[40px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <img 
                                    src={user.avatarUrl || "/logo-cat.png"} 
                                    alt={user.fullName}
                                    className={`relative w-40 h-40 rounded-[38px] border-8 object-cover shadow-2xl ${isDark ? "border-gray-800" : "border-white"}`}
                                />
                                {user.isPremium && (
                                    <div className="absolute -bottom-3 -right-3 p-3 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-[22px] shadow-2xl ring-4 ring-white dark:ring-gray-800 border-2 border-white/50 scale-110 animate-bounce-slow">
                                        <Star className="w-6 h-6 text-white fill-current" />
                                    </div>
                                )}
                            </div>
                            
                            <h2 className={`text-3xl font-black mt-8 mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{user.fullName}</h2>
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-sm font-bold ${isDark ? "bg-gray-900/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 mt-8">
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${user.role?.includes("ADMIN") ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"}`}>
                                    <Shield className="w-3.5 h-3.5 inline-block mr-1.5 opacity-70" />
                                    {user.role?.includes("ADMIN") ? "Quản trị viên" : "Học viên"}
                                </span>
                                {user.isPremium && (
                                    <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-yellow-500 border border-amber-600 text-white shadow-xl shadow-amber-500/30">
                                        VIP Member
                                    </span>
                                )}
                            </div>

                            <div className={`grid grid-cols-2 gap-4 mt-10 pt-8 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                                <div className="text-center p-4 rounded-3xl bg-opacity-40 bg-gray-50 border border-gray-50 dark:bg-gray-900/40 dark:border-gray-700/50">
                                    <p className={`text-[9px] uppercase font-black tracking-widest mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tham gia</p>
                                    <div className={`flex items-center justify-center gap-1.5 text-xs font-black ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                                        <Calendar className="w-3.5 h-3.5 opacity-70" />
                                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                                <div className="text-center p-4 rounded-3xl bg-opacity-40 bg-gray-50 border border-gray-50 dark:bg-gray-900/40 dark:border-gray-700/50">
                                    <p className={`text-[9px] uppercase font-black tracking-widest mb-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Trình độ</p>
                                    <div className={`flex items-center justify-center gap-1.5 text-xs font-black ${isDark ? "text-indigo-500" : "text-indigo-600"}`}>
                                        <Trophy className="w-3.5 h-3.5 opacity-70" />
                                        {user.level || "Học viên mới"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History (Billing History) */}
                    <div className={`p-8 rounded-[40px] border shadow-2xl transition-all ${isDark ? "bg-gray-800 border-gray-700/50" : "bg-white border-gray-100"}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`text-xl font-black flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <Trophy className={`w-6 h-6 ${isDark ? "text-amber-400" : "text-amber-500"}`} />
                                Lịch sử giao dịch
                            </h3>
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${isDark ? "bg-gray-900 text-gray-500" : "bg-gray-50 text-gray-400"}`}>
                                {orders.length} giao dịch
                            </span>
                        </div>
                        
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <div key={order.id} className={`p-4 rounded-3xl border transition-all hover:scale-[1.02] ${isDark ? "bg-gray-900/30 border-gray-700/50 hover:bg-gray-900/50" : "bg-gray-50/50 border-gray-100 hover:bg-white hover:shadow-lg"}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className={`text-xs font-black ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                                {order.orderCode}
                                            </p>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-tighter ${
                                                order.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[14px] font-black text-indigo-500">
                                                    {order.amount.toLocaleString('vi-VN')} VNĐ
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-500">
                                                    {new Date(order.paidAt || order.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                            <p className="text-[9px] font-bold text-gray-500 italic opacity-60">
                                                {order.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-sm font-bold text-gray-400 italic">Chưa có giao dịch nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content (Right columns - span 8) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Learning Stats */}
                    <div className={`p-10 rounded-[40px] border shadow-2xl transition-all ${isDark ? "bg-gray-800/80 border-gray-700/50" : "bg-white border-gray-100"}`}>
                        <div className="flex items-center justify-between mb-10">
                            <h3 className={`text-2xl font-black flex items-center gap-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                                <Activity className={`w-8 h-8 ${isDark ? "text-indigo-400" : "text-indigo-500"}`} />
                                Phân tích dữ liệu học tập
                            </h3>
                            <div className={`hidden sm:flex px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${isDark ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-sm"}`}>
                                Cập nhật: 5 phút trước
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Course Progress Card */}
                            <div className={`group p-8 rounded-[40px] border transition-all duration-500 hover:shadow-2xl ${isDark ? "bg-gray-900/40 border-gray-700 hover:border-indigo-500/30" : "bg-gray-50/50 border-gray-100 shadow-sm hover:border-indigo-100"}`}>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-3xl transition-transform group-hover:scale-110 duration-500 ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600 shadow-sm"}`}>
                                            <BookOpen className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className={`text-[11px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tiến trình khóa học</p>
                                            <p className={`font-black text-lg ${isDark ? "text-gray-100" : "text-gray-800"}`}>Lộ trình JLPT {user.level || "N5"}</p>
                                        </div>
                                    </div>
                                    <div className={`text-3xl font-black ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>{user.processPercent}%</div>
                                </div>
                                <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1500 ease-out rounded-full"
                                        style={{ width: `${user.processPercent}%` }}
                                    >
                                        <div className="absolute top-0 right-0 h-full w-8 bg-white/20 skew-x-[30deg] animate-shimmer scale-150"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between mt-5 px-1">
                                    <p className={`text-[11px] font-black ${isDark ? "text-gray-500" : "text-gray-400"}`}>Giai đoạn: <span className="text-indigo-500 uppercase">{user.stage || "Người mới"}</span></p>
                                    <p className={`text-[11px] font-black ${isDark ? "text-gray-500" : "text-gray-400"}`}>Hệ thống SmartLearn</p>
                                </div>
                            </div>

                            {/* Vocabulary Progress Card */}
                            <div className={`group p-8 rounded-[40px] border transition-all duration-500 hover:shadow-2xl ${isDark ? "bg-gray-900/40 border-gray-700 hover:border-amber-500/30" : "bg-gray-50/50 border-gray-100 shadow-sm hover:border-amber-100"}`}>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-3xl transition-transform group-hover:scale-110 duration-500 ${isDark ? "bg-amber-500/20 text-amber-500" : "bg-amber-100 text-amber-600 shadow-sm"}`}>
                                            <Trophy className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className={`text-[11px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>Dữ liệu từ vựng</p>
                                            <p className={`font-black text-lg ${isDark ? "text-gray-100" : "text-gray-800"}`}>Học từ thông minh</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-3xl font-black ${isDark ? "text-amber-500" : "text-amber-600"}`}>{user.totalVocabLearned || 0}</p>
                                        <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase">Từ đã nạp</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-4 rounded-3xl text-center border transition-all ${isDark ? "bg-gray-800 border-emerald-500/10" : "bg-white border-gray-100 shadow-sm"}`}>
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Đã thuộc</p>
                                        <p className="text-xl font-black text-emerald-500">{user.masteredVocabCount || 0}</p>
                                        <div className="w-full h-1 bg-emerald-500/20 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${user.totalVocabLearned ? (user.masteredVocabCount! / user.totalVocabLearned * 100) : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div className={`p-4 rounded-3xl text-center border transition-all ${isDark ? "bg-gray-800 border-indigo-500/10" : "bg-white border-gray-100 shadow-sm"}`}>
                                        <p className="text-[10px] font-black uppercase text-gray-500 mb-1">Đang nhớ</p>
                                        <p className="text-xl font-black text-indigo-500">{user.learningVocabCount || 0}</p>
                                        <div className="w-full h-1 bg-indigo-500/20 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${user.totalVocabLearned ? (user.learningVocabCount! / user.totalVocabLearned * 100) : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Logs (Activity History) */}
                    <div className={`p-10 rounded-[40px] border shadow-2xl transition-all ${isDark ? "bg-gray-800/80 border-gray-700/50" : "bg-white border-gray-100"}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>Nhật ký hoạt động hệ thống</h3>
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-bold text-gray-500 italic">50 hành động gần nhất</span>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {logs.length > 0 ? (
                                logs.map((log, i) => (
                                    <div key={log.id} className={`group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[32px] border transition-all hover:bg-opacity-80 ${isDark ? "bg-gray-900/30 border-gray-700/40 hover:bg-gray-900" : "bg-gray-50/40 border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 group"}`}>
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center p-3 text-white shadow-lg transition-transform group-hover:rotate-12 ${log.status === 'SUCCESS' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}>
                                                {log.methodName.includes('login') ? <UserIcon className="w-6 h-6" /> : 
                                                 log.methodName.includes('purchase') ? <Star className="w-6 h-6" /> : 
                                                 <Activity className="w-6 h-6" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`text-sm font-black ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                                    {log.methodName} 
                                                    <span className={`ml-2 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${log.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {log.status}
                                                    </span>
                                                </p>
                                                <p className={`text-[11px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                    IP: {log.ipAddress} • {log.executionTime}ms
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 sm:mt-0 text-right">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                                                {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                                            </p>
                                            <p className={`text-[10px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                {new Date(log.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-gray-50/30 dark:bg-gray-900/40 rounded-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700/50">
                                    <Activity className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Không có dữ liệu nhật ký</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
