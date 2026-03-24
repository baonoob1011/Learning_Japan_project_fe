import { useEffect, useState } from "react";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  connectNotificationSocket,
  IncomingCallDTO,
  NotificationSocketDTO,
} from "@/services/notificationSocket";
import { getUserIdFromToken } from "@/utils/jwt";
import { Notification } from "@/types/notification";

const convertToNotification = (dto: Partial<NotificationSocketDTO>): Notification => ({
  // Some test WS payloads only contain title/content.
  id:
    dto.id ??
    `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: dto.title ?? "Thông báo",
  content: dto.content ?? "",
  createdAt: dto.createdAt ?? new Date().toISOString(),
  isRead: typeof dto.isRead === "boolean" ? dto.isRead : false,
});

type SharedConnection = ReturnType<typeof connectNotificationSocket>;

let sharedSocket: SharedConnection | null = null;
let sharedUserId: string | null = null;
const notificationListeners = new Set<(data: NotificationSocketDTO) => void>();
const incomingCallListeners = new Set<(data: IncomingCallDTO) => void>();

const ensureSharedSocket = (userId: string) => {
  if (sharedSocket && sharedUserId === userId) {
    return sharedSocket;
  }

  sharedSocket?.disconnect();
  sharedUserId = userId;
  sharedSocket = connectNotificationSocket(
    userId,
    (data) => {
      notificationListeners.forEach((listener) => listener(data));
    },
    (callData) => {
      incomingCallListeners.forEach((listener) => listener(callData));
    }
  );

  return sharedSocket;
};

export const useNotificationSync = () => {
  const { loadNotifications, reloadNotifications, addNotification, isInitialized } =
    useNotificationStore();
  const [incomingCall, setIncomingCall] = useState<IncomingCallDTO | null>(null);

  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    if (!isInitialized) {
      loadNotifications();
    }

    const handleNotification = (data: NotificationSocketDTO) => {
      addNotification(convertToNotification(data));
    };

    const handleIncomingCall = (callData: IncomingCallDTO) => {
      setIncomingCall(callData);
    };

    notificationListeners.add(handleNotification);
    incomingCallListeners.add(handleIncomingCall);
    ensureSharedSocket(userId);

    return () => {
      notificationListeners.delete(handleNotification);
      incomingCallListeners.delete(handleIncomingCall);
    };
  }, [addNotification, isInitialized, loadNotifications, reloadNotifications]);

  const dismissCall = () => setIncomingCall(null);

  return { incomingCall, dismissCall };
};
