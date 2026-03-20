import { useEffect, useState } from "react";
import { useNotificationStore } from "@/stores/notificationStore";
import {
  connectNotificationSocket,
  IncomingCallDTO,
  NotificationSocketDTO,
} from "@/services/notificationSocket";
import { getUserIdFromToken } from "@/utils/jwt";
import { Notification } from "@/types/notification";

const convertToNotification = (dto: NotificationSocketDTO): Notification => ({
  id: dto.id,
  title: dto.title,
  content: dto.content,
  createdAt: dto.createdAt,
  isRead: dto.isRead,
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
  const { loadNotifications, addNotification, isInitialized } =
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
  }, [addNotification, isInitialized, loadNotifications]);

  const dismissCall = () => setIncomingCall(null);

  return { incomingCall, dismissCall };
};
