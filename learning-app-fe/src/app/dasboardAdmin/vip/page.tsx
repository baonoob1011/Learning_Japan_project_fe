"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import {
    Crown,
    Plus,
    Loader2,
    Calendar,
    Zap,
    CheckCircle2,
    XCircle,
    Sparkles,
    ShieldCheck,
    Clock
} from "lucide-react";
import { vipService, VipPackageResponse, PlanType } from "@/services/vipService";

const PLAN_TYPE_CONFIG: Record<PlanType, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    MONTHLY: {
        label: "Tháng",
        bg: "bg-blue-100 dark:bg-blue-900/40",
        text: "text-blue-700 dark:text-blue-300",
        icon: <Clock className="w-4 h-4" />
    },
    YEARLY: {
        label: "Năm",
        bg: "bg-purple-100 dark:bg-purple-900/40",
        text: "text-purple-700 dark:text-purple-300",
        icon: <Sparkles className="w-4 h-4" />
    },
    LIFETIME: {
        label: "Vĩnh viễn",
        bg: "bg-amber-100 dark:bg-amber-900/40",
        text: "text-amber-700 dark:text-amber-300",
        icon: <Zap className="w-4 h-4" />
    }
};

export default function AdminVipManagementPage() {
    const router = useRouter();
    const { isDarkMode: isDark } = useDarkMode();
    const [packages, setPackages] = useState<VipPackageResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await vipService.getAll();
            setPackages(data || []);
        } catch (error) {
            console.error("Failed to load VIP packages:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    return (
        <main className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>

                    <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                        <Crown className={`w-8 h-8 ${isDark ? "text-amber-400" : "text-amber-500"}`} />
                        Quản lý Gói VIP
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Xem và cấu hình các gói thành viên VIP cho hệ thống.</p>
                </div>

                <button
                    onClick={() => router.push('/dasboardAdmin/vip/create')}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all text-sm"
                >
                    <Plus className="w-5 h-5" /> Tạo gói VIP mới
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`rounded-3xl p-6 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tổng số Gói</p>
                            <p className="text-2xl font-black">{packages.length}</p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-3xl p-6 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>Đang hoạt động</p>
                            <p className="text-2xl font-black">{packages.filter(p => p.active).length}</p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-3xl p-6 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tính năng</p>
                            <p className="text-2xl font-black">Ưu tiên</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className={`text-sm font-medium animate-pulse ${isDark ? "text-gray-500" : "text-gray-400"}`}>Đang đồng bộ dữ liệu VIP...</p>
                </div>
            ) : packages.length === 0 ? (
                <div className={`py-40 text-center rounded-[32px] border-2 border-dashed ${isDark ? "border-gray-800 bg-gray-800/20" : "border-gray-200 bg-gray-50"}`}>
                    <div className="flex flex-col items-center">
                        <div className="p-4 rounded-full bg-indigo-500/5 mb-4">
                            <Crown className="w-12 h-12 text-indigo-500 opacity-20" />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Chưa có gói VIP nào</h3>
                        <p className={`text-sm mb-8 max-w-xs mx-auto ${isDark ? "text-gray-500" : "text-gray-400"}`}>Hệ thống chưa có gói VIP nào được cấu hình. Hãy tạo gói đầu tiên ngay.</p>
                        <button
                            onClick={() => router.push('/dasboardAdmin/vip/create')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-xs"
                        >
                            Tạo gói ngay
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {packages.map((pkg) => {
                        const typeConfig = PLAN_TYPE_CONFIG[pkg.planType];
                        return (
                            <div
                                key={pkg.id}
                                className={`group rounded-[32px] border p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDark ? "bg-gray-800 border-gray-700 hover:border-amber-500/30" : "bg-white border-gray-100 hover:border-amber-200"}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${typeConfig.bg} ${typeConfig.text}`}>
                                        {typeConfig.icon}
                                        {typeConfig.label}
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${pkg.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-gray-100 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400"}`}>
                                        {pkg.active ? (
                                            <><CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động</>
                                        ) : (
                                            <><XCircle className="w-3.5 h-3.5" /> Đã ẩn</>
                                        )}
                                    </div>
                                </div>

                                <h3 className={`text-xl font-black mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {pkg.name}
                                </h3>

                                <div className="flex items-baseline gap-1 mt-2 mb-6">
                                    <span className={`text-2xl font-black ${isDark ? "text-amber-400" : "text-amber-500"}`}>
                                        {formatCurrency(pkg.price)}
                                    </span>
                                    <span className={`text-xs font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                        / {pkg.planType === "LIFETIME" ? "trọn đời" : pkg.durationDays ? `${pkg.durationDays} ngày` : pkg.planType}
                                    </span>
                                </div>

                                <div className={`mt-auto pt-6 border-t flex flex-col gap-3 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                                    <div className={`flex items-center gap-2 text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        <Calendar className="w-4 h-4 opacity-50" />
                                        Thời gian: {pkg.durationDays ? `${pkg.durationDays} ngày` : "Vô thời hạn"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

