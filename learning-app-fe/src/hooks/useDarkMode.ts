// hooks/useDarkMode.ts
import { useState, useEffect, useRef } from "react";

export function useDarkMode() {
  const isInitialMount = useRef(true);

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
    // Skip initial mount để tránh warning
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
  }, []);

  useEffect(() => {
    // Chỉ lắng nghe storage changes từ tabs khác
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

  return { isDarkMode, toggleDarkMode };
}
