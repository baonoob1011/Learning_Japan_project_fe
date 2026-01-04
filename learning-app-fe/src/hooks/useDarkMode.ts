"use client";
import { useState, useEffect } from "react";

export function useDarkMode() {
  const [mounted, setMounted] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Chỉ đọc localStorage trên client, return false cho server
    if (typeof window === "undefined") return false;

    // Đọc một lần duy nhất khi khởi tạo
    try {
      const savedMode = localStorage.getItem("darkMode");
      return savedMode === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Set mounted để tránh hydration error
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);

    // Lắng nghe storage changes từ tabs khác
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "darkMode" && e.newValue !== null) {
        setIsDarkMode(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      try {
        localStorage.setItem("darkMode", String(newValue));
      } catch (error) {
        console.error("Failed to save dark mode preference:", error);
      }
      return newValue;
    });
  };

  return { isDarkMode, toggleDarkMode, mounted };
}
