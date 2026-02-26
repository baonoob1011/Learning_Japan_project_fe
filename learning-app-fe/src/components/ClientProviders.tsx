"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useDarkMode } from "@/hooks/useDarkMode";
import FloatingChatButton from "@/components/Floatingchatbutton ";
import MaziAIChat from "@/components/NiboChatAI";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();
    const { isDarkMode, mounted } = useDarkMode();

    // Các trang không hiển thị Chat/AI (Ví dụ: Login, Register, Admin)
    const isAuthPage = pathname === "/login" || pathname === "/register";
    const isAdminPage = pathname?.startsWith("/admin") || pathname?.startsWith("/dasboardAdmin");
    const shouldShowFloating = isAuthenticated && !isAuthPage && !isAdminPage;

    if (!mounted) return <>{children}</>;

    return (
        <>
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
