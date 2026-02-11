"use client";

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { useNotificationStore } from "@/stores/notificationStore";
import { useNotificationSync } from "@/hooks/useNotificationSync";

type Props = {
  isDarkMode?: boolean;
};

export default function NotificationBell({ isDarkMode = false }: Props) {
  // ✅ Tự động sync DB + WebSocket
  useNotificationSync();

  // ✅ Lấy state từ store
  const {
    notifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = getUnreadCount();

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`relative p-1.5 rounded-lg transition-all ${
          isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
        } ${isOpen ? (isDarkMode ? "bg-gray-700" : "bg-gray-100") : ""}`}
        title="Thông báo"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell
          className={`w-5 h-5 transition-colors ${
            isDarkMode
              ? "text-gray-300 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        />

        {unreadCount > 0 && (
          <span
            className={`
              absolute -top-1 -right-1
              bg-red-500 text-white text-[10px] font-semibold
              min-w-[18px] h-[18px] rounded-full
              flex items-center justify-center
              animate-pulse
              border-2
              ${isDarkMode ? "border-gray-800" : "border-white"}
            `}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isDarkMode={isDarkMode}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
        />
      )}
    </div>
  );
}
