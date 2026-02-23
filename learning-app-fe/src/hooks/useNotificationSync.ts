import { useEffect, useRef, useState } from "react";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  connectNotificationSocket,
  NotificationSocketDTO,
  IncomingCallDTO,
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
  const [incomingCall, setIncomingCall] = useState<IncomingCallDTO | null>(
    null
  );

  useEffect(() => {
    if (hasInitializedRef.current) return;

    const userId = getUserIdFromToken();
    if (!userId) {
      console.log("⚠️ No userId found, skipping notification sync");
      return;
    }

    hasInitializedRef.current = true;

    if (!isInitialized) {
      loadNotifications();
    }

    console.log("🔔 Connecting notification socket for user:", userId);

    socketRef.current = connectNotificationSocket(
      userId,
      (data: NotificationSocketDTO) => {
        console.log("📩 WebSocket notification received:", data);
        addNotification(convertToNotification(data));
      },
      (callData: IncomingCallDTO) => {
        console.log("📞 Incoming call received:", callData);
        setIncomingCall(callData);
      }
    );

    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting notification socket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // ✅ Đã xóa: hasInitializedRef.current = false;
    };
  }, []);

  const dismissCall = () => setIncomingCall(null);

  return { incomingCall, dismissCall };
};
