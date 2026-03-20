// src/services/notificationService.ts
import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";

/* ===================== TYPES ===================== */

export interface NotificationResponse {
  id: string;
  type?: "REVIEW_REMINDER" | "MISSED_REVIEW" | "SYSTEM";
  title: string;
  content: string;
  metadata?: string | null;
  isRead: boolean;
  createdAt: string;
}

/**
 * Response phân trang (Spring Page)
 */
export interface PageResponse<T> {
  data?: T[];
  content?: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number?: number; // Spring Page (legacy)
  page?: number; // Custom PageResponse
}
/* ===================== SERVICE ===================== */

export const notificationService = {
  /**
   * 📥 Lấy notification của user hiện tại (có phân trang)
   */
  getMyNotifications(
    page = 0,
    size = 10
  ): Promise<PageResponse<NotificationResponse>> {
    return http.get<PageResponse<NotificationResponse>>(
      API_ENDPOINTS.NOTIFICATION.GET_MY,
      {
        params: { page, size },
      }
    );
  },

  getUnreadCount(): Promise<{ unreadCount: number }> {
    return http.get<{ unreadCount: number }>(
      API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT
    );
  },

  /**
   * ✅ Đánh dấu đã đọc 1 notification
   */
  markAsRead(notificationId: string): Promise<void> {
    return http.put<void>(
      API_ENDPOINTS.NOTIFICATION.MARK_AS_READ(notificationId)
    );
  },

  /**
   * ✅ Đánh dấu tất cả là đã đọc
   */
  markAllAsRead(): Promise<void> {
    return http.put<void>(API_ENDPOINTS.NOTIFICATION.MARK_ALL_AS_READ);
  },

  /**
   * 🗑️ Xóa notification
   */
  delete(notificationId: string): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.NOTIFICATION.DELETE(notificationId));
  },

  /**
   * 🗑️ Xóa tất cả notification
   */
  deleteAll(): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.NOTIFICATION.DELETE_ALL);
  },
};

