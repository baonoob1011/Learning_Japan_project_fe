import { create } from "zustand";
import { Notification } from "@/types/notification";
import {
  notificationService,
  NotificationResponse,
} from "@/services/notificationService";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isInitialized: boolean;
  recentlyMarkedRead: Set<string>;
  loadNotifications: () => Promise<void>;
  reloadNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  getUnreadCount: () => number;
}

const convertToNotification = (dto: NotificationResponse): Notification => ({
  id: dto.id,
  type: dto.type,
  title: dto.title,
  content: dto.content,
  metadata: dto.metadata,
  createdAt: dto.createdAt,
  isRead: dto.isRead,
});

const sortByCreatedAtDesc = (items: Notification[]): Notification[] =>
  [...items].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

const getNotificationItems = (
  response: { data?: NotificationResponse[]; content?: NotificationResponse[] }
): NotificationResponse[] => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isInitialized: false,
  recentlyMarkedRead: new Set<string>(),

  loadNotifications: async () => {
    const state = get();
    if (state.isInitialized) {
      return;
    }

    set({ isLoading: true });
    try {
      const response = await notificationService.getMyNotifications(0, 10);
      const items = getNotificationItems(response);
      const recentlyRead = get().recentlyMarkedRead;
      const notifications = sortByCreatedAtDesc(
        items.map(dto => ({
          ...convertToNotification(dto),
          isRead: convertToNotification(dto).isRead || recentlyRead.has(dto.id)
        }))
      );

      set({
        notifications,
        // unreadCount: (await notificationService.getUnreadCount()).unreadCount,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Failed to load notifications:", error);
      set({ isLoading: false });
    }
  },

  reloadNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await notificationService.getMyNotifications(0, 10);
      const items = getNotificationItems(response);
      const recentlyRead = get().recentlyMarkedRead;
      const notifications = sortByCreatedAtDesc(
        items.map(dto => ({
          ...convertToNotification(dto),
          isRead: convertToNotification(dto).isRead || recentlyRead.has(dto.id)
        }))
      );

      set({
        notifications,
        // unreadCount: (await notificationService.getUnreadCount()).unreadCount,
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error("Failed to reload notifications:", error);
      set({ isLoading: false });
    }
  },

  addNotification: (notification) =>
    set((state) => {
      const withoutSameId = state.notifications.filter(
        (n) => n.id !== notification.id
      );
      // Even if pushed via WS, check if we just marked it as read locally
      const updatedNotification = {
        ...notification,
        isRead: notification.isRead || state.recentlyMarkedRead.has(notification.id)
      };
      const merged = sortByCreatedAtDesc([updatedNotification, ...withoutSameId]);
      return {
        notifications: merged,
        unreadCount: merged.filter((n) => !n.isRead).length,
      };
    }),

  markAsRead: async (id) => {
    // Optimistic update + Add to recentlyMarkedRead
    set((state) => {
      const newRecentlyRead = new Set(state.recentlyMarkedRead);
      newRecentlyRead.add(id);

      return {
        recentlyMarkedRead: newRecentlyRead,
        unreadCount: Math.max(0, state.unreadCount - (state.notifications.find((n) => n.id === id && !n.isRead) ? 1 : 0)),
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      };
    });

    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error("Failed to mark as read:", error);
      // Rollback nếu cần, nhưng thường thì không cần vì sẽ có reload/sync sau đó
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        unreadCount: 0,
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationService.delete(id);
      set((state) => ({
        unreadCount: state.notifications.find((n) => n.id === id && !n.isRead) ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  },

  clearAll: async () => {
    try {
      await notificationService.deleteAll();
      set({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      throw error;
    }
  },

  getUnreadCount: () => get().unreadCount,
}));
