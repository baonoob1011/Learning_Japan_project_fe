"use client";

import { Bell, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { useNotificationStore } from "@/stores/notificationStore";
import { useNotificationSync } from "@/hooks/useNotificationSync";
import { useFriendRequest } from "@/hooks/useFriendRequest";
import FriendRequestToast from "@/components/chat/FriendRequestToast";
import { getUserIdFromToken } from "@/utils/jwt";
import { reviewService } from "@/services/reviewService";

type Props = {
  isDarkMode?: boolean;
};

export default function NotificationBell({ isDarkMode = false }: Props) {
  useNotificationSync();

  const {
    notifications,
    getUnreadCount,
    reloadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [srsOverdueCount, setSrsOverdueCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = getUnreadCount();
  const currentUserId = getUserIdFromToken();
  const { pendingRequests, dismissRequest } = useFriendRequest(
    currentUserId ? String(currentUserId) : null
  );

  const pendingRequest = pendingRequests[0];
  const friendRequestCount = pendingRequests.length;

  useEffect(() => {
    const fetchSrsStats = async () => {
      try {
        const data = await reviewService.getToday();
        setSrsOverdueCount(data.summary.overdueCount || 0);
      } catch (err) {
        console.error("Failed to fetch SRS overdue stats for bell:", err);
      }
    };
    fetchSrsStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchSrsStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const totalCount = unreadCount + friendRequestCount;

  // Debug log để người dùng xem trong console
  useEffect(() => {
    console.log(`[NotificationBell] unreadNotifications: ${unreadCount}, pendingFriendRequests: ${friendRequestCount}, total: ${totalCount}`);
  }, [unreadCount, friendRequestCount, totalCount]);

  useEffect(() => {
    if (isOpen) {
      reloadNotifications();
    }
  }, [isOpen, reloadNotifications]);

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
    <div className="relative flex flex-col items-end gap-2" ref={dropdownRef}>
      {pendingRequest && (
        <div className="absolute bottom-full mb-2 right-0 z-[9999]">
          <FriendRequestToast
            request={pendingRequest}
            isDarkMode={isDarkMode}
            onDismiss={() => dismissRequest(pendingRequest.requestId)}
          />
        </div>
      )}

      <div className="relative group">
        <button
          className={`relative p-1.5 rounded-lg transition-all ${
            isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          } ${isOpen ? (isDarkMode ? "bg-gray-700" : "bg-gray-100") : ""}`}
          title="Thông báo"
          onClick={() => setIsOpen((value) => !value)}
        >
          <Bell
            className={`w-5 h-5 transition-colors ${
              isDarkMode
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          />

          {totalCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold min-w-[18px] h-[18px] rounded-full flex items-center justify-center animate-pulse border-2 ${
                isDarkMode ? "border-gray-800" : "border-white"
              }`}
            >
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </button>

        {/* Facebook-style Hover Tooltip for SRS */}
        {srsOverdueCount > 0 && !isOpen && (
          <div className="absolute right-0 top-10 w-64 p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[9999]">
            <h4 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-2">Học tập</h4>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle size={16} />
              </div>
              <p className="text-[11px] leading-snug">
                Bạn có <span className="font-bold">{srsOverdueCount} từ</span> quá hạn cần ôn tập ngay hôm nay!
              </p>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          pendingFriendRequests={pendingRequests}
          isDarkMode={isDarkMode}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
          onClearAll={() => {
            if (confirm("Bạn có chắc chắn muốn xóa tất cả thông báo?")) {
              clearAll();
            }
          }}
          onDismissFriendRequest={dismissRequest}
        />
      )}
    </div>
  );
}

