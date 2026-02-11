import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  connectNotificationSocket,
  NotificationSocketDTO,
} from "@/services/notificationSocket";
import { getUserIdFromToken } from "@/utils/jwt";
import { Notification } from "@/types/notification";

const convertToNotification = (dto: NotificationSocketDTO): Notification => ({
  id: dto.id,
  title: dto.title,
  content: dto.content,
  createdAt: dto.createdAt,
  isRead: false,
});

export const useNotificationSync = () => {
  const { loadNotifications, addNotification, isInitialized } =
    useNotificationStore();
  const socketRef = useRef<ReturnType<typeof connectNotificationSocket> | null>(
    null
  );
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // ✅ Prevent double initialization (React strict mode)
    if (hasInitializedRef.current) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      console.log("⚠️ No userId found, skipping notification sync");
      return;
    }

    hasInitializedRef.current = true;

    // 📥 Step 1: Load từ DB (chỉ 1 lần)
    if (!isInitialized) {
      loadNotifications();
    }

    // 🔌 Step 2: Connect WebSocket
    console.log("🔔 Connecting notification socket for user:", userId);

    socketRef.current = connectNotificationSocket(
      userId,
      (data: NotificationSocketDTO) => {
        console.log("📩 WebSocket notification received:", data);
        addNotification(convertToNotification(data));
      }
    );

    // 🧹 Cleanup
    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting notification socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      hasInitializedRef.current = false;
    };
  }, []); // Empty deps - chỉ chạy 1 lần
};
