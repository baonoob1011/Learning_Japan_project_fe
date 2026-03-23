"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useDarkMode } from "@/hooks/useDarkMode";
import FloatingChatButton from "@/components/chat/Floatingchatbutton ";
import MaziAIChat from "@/components/NiboChatAI";
import { ToastContainer } from "@/components/ui/Toast";
import { KickOutModal } from "@/components/KickOutModal";
import { useRouter } from "next/navigation";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated, isKickedOut, setKickedOut } = useAuthStore();
    const { isDarkMode, mounted } = useDarkMode();
    const router = useRouter();

    const handleKickOutConfirm = () => {
        setKickedOut(false);
        router.push("/login"); // Dùng router của NextJS để chuyển hướng mượt mà
    };

    // Các trang không hiển thị Chat/AI (Ví dụ: Login, Register, Admin, Exam)
    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/dasboardAdmin");
    const isExamPage = pathname?.startsWith("/exam");
    const shouldShowFloating = isAuthenticated && !isAuthPage && !isAdminPage && !isExamPage;

    if (!mounted) return <>{children}</>;

    return (
        <>
            <ToastContainer />
            <KickOutModal isOpen={isKickedOut} onConfirm={handleKickOutConfirm} />
            {children}
            {shouldShowFloating && (
                <>
                    <MaziAIChat isDarkMode={isDarkMode} />
                    <FloatingChatButton isDarkMode={isDarkMode} />
                </>
            )}
        </>
    );
}
