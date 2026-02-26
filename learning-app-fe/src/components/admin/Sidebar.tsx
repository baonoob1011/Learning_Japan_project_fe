"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    BarChart3,
    Mail,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const menuItems = [
        {
            path: "/dasboardAdmin",
            icon: <LayoutDashboard className="w-5 h-5" />,
            label: "Dashboard",
        },
        {
            path: "/admin/users",
            icon: <Users className="w-5 h-5" />,
            label: "Quản lý Học viên",
        },
        {
            path: "/admin/analytics",
            icon: <BarChart3 className="w-5 h-5" />,
            label: "Phân tích & Báo cáo",
        },
        {
            path: "/admin/messages",
            icon: <Mail className="w-5 h-5" />,
            label: "Hỗ trợ & Góp ý",
        },
        {
            path: "/admin/settings",
            icon: <Settings className="w-5 h-5" />,
            label: "Cấu hình hệ thống",
        },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <aside
            className={`${isOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed left-0 top-0 h-screen z-50 shadow-sm`}
        >
            {/* Header Sidebar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                {isOpen ? (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="cursor-pointer group">
                            <img
                                src="/logo-cat.png"
                                alt="NIBO Admin"
                                className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900 leading-tight">NIBO</span>
                            <span className="text-[10px] font-bold text-indigo-600 tracking-tighter uppercase">ADMIN PANEL</span>
                        </div>
                    </div>
                ) : (
                    <img
                        src="/logo-cat.png"
                        alt="NIBO"
                        className="w-8 h-8 object-contain mx-auto"
                    />
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                    {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive(item.path)
                            ? "bg-indigo-50 text-indigo-600 font-bold shadow-sm"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        <div className={`${isActive(item.path) ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                            {item.icon}
                        </div>
                        {isOpen && <span className="text-sm">{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 border-t border-gray-100 italic font-medium">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
                >
                    <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
                    {isOpen && <span className="text-sm">Đăng xuất</span>}
                </button>
            </div>
        </aside>
    );
}
