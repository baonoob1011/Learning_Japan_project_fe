"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/dashboard/AdminHeader";
import UserManager from "@/components/admin/UserManager";
import { useAuthStore } from "@/stores/authStore";
import { getRolesFromToken } from "@/utils/jwt";
import { Users, ShieldCheck } from "lucide-react";

export default function AdminUsersPage() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);

    // Bảo vệ route ADMIN
    useEffect(() => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) {
            router.push("/login");
            return;
        }
        const roles = getRolesFromToken(accessToken);
        if (!roles.includes("ADMIN")) {
            router.push("/login");
            return;
        }
        setIsReady(true);
    }, [router]);

    if (!isReady) return null;

    return (
        <div className="flex bg-[#F3F4F6] min-h-screen font-sans">
            <Sidebar />

            <div className="flex-1 ml-64 flex flex-col">
                <AdminHeader />

                <main className="p-8 space-y-6">
                    {/* Breadcrumbs / Page Title */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 font-medium">
                        <span className="hover:text-indigo-600 cursor-pointer" onClick={() => router.push('/dasboardAdmin')}>Dashboard</span>
                        <span>/</span>
                        <span className="text-gray-900 font-bold">Quản lý người dùng</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                                <Users className="w-7 h-7 text-indigo-600" />
                                Hệ thống Quản lý Học viên
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Xem chi tiết, tìm kiếm và kiểm soát trạng thái hoạt động của toàn bộ người dùng trên hệ thống.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100 text-[10px] font-bold uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secure Admin Access
                        </div>
                    </div>

                    {/* Main Content Component */}
                    <UserManager />
                </main>
            </div>
        </div>
    );
}
