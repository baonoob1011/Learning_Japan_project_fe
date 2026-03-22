"use client";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Activity, ShieldCheck } from "lucide-react";
import SystemLogManager from "@/components/admin/SystemLogManager";

function SystemLogsContent() {
    const router = useRouter();
    const { isDarkMode: isDark } = useDarkMode();

    return (
        <main className="p-8 space-y-6">
            {/* Breadcrumb */}
            <div
                className={`flex items-center gap-2 text-sm mb-2 font-medium ${isDark ? "text-gray-400" : "text-gray-500"
                    }`}
            >
                <span
                    className="hover:text-indigo-500 cursor-pointer transition-colors"
                    onClick={() => router.push("/dasboardAdmin")}
                >
                    Bảng điều khiển
                </span>
                <span>/</span>
                <span
                    className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                    Nhật ký hệ thống
                </span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1
                        className={`text-2xl font-extrabold tracking-tight flex items-center gap-2 ${isDark ? "text-gray-100" : "text-gray-900"
                            }`}
                    >
                        <Activity
                            className={`w-7 h-7 ${isDark ? "text-indigo-400" : "text-indigo-600"
                                }`}
                        />
                        Nhật ký hoạt động hệ thống
                    </h1>
                    <p
                        className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                    >
                        Theo dõi toàn bộ hoạt động hệ thống — method calls, trạng thái thực
                        thi, thời gian phản hồi, và lỗi xảy ra.
                    </p>
                </div>
                <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${isDark
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        }`}
                >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Chỉ dành cho Quản trị viên
                </div>
            </div>

            {/* Main Table */}
            <SystemLogManager isDark={isDark} />
        </main>
    );
}

export default function SystemLogsPage() {
    return (
        <Suspense fallback={null}>
            <SystemLogsContent />
        </Suspense>
    );
}
