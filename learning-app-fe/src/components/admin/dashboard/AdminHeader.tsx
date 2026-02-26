"use client";
import React from "react";
import UserDropdown from "@/components/UserDropdown";
import { useAuthStore } from "@/stores/authStore";

interface AdminHeaderProps {
    onToggleDarkMode?: () => void;
    isDarkMode?: boolean;
}

export default function AdminHeader({ onToggleDarkMode, isDarkMode = false }: AdminHeaderProps) {
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-400 rounded-full blur-md opacity-20"></div>
                    <img
                        src="/logo-cat.png"
                        alt="NIBO Logo"
                        className="w-12 h-12 object-contain relative z-10"
                    />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">NIBO Admin</h1>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hệ thống quản trị học tập</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-semibold text-gray-700">Chào bạn, Quản trị viên</span>
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 font-bold">ONLINE</span>
                </div>
                <UserDropdown isDark={isDarkMode} onToggleDarkMode={() => onToggleDarkMode?.()} />
            </div>
        </header>
    );
}
