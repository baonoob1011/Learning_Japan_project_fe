import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";
import { getAccessTokenFromStorage } from "@/utils/jwt";
import { useAuthStore } from "@/stores/authStore";

export type IncomingCallDTO = {
  type: "incoming";
  callType?: "VIDEO" | "VOICE";  // VIDEO or VOICE call type
  roomId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
};

export type NotificationSocketDTO = {
  id: string;
  type?: "REVIEW_REMINDER" | "MISSED_REVIEW" | "SYSTEM";
  title: string;
  content: string;
  metadata?: string | null;
  isRead: boolean;
  createdAt: string;
};

export const connectNotificationSocket = (
  userId: string,
  onMessage: (data: NotificationSocketDTO) => void,
  onIncomingCall?: (data: IncomingCallDTO) => void
) => {
  const token = getAccessTokenFromStorage();

  // Kiểm tra URL an toàn
  const fallbackUrl = "https://api.nibojapan.cloud/ws";
  const wsUrl = fallbackUrl;

  console.log(`🔌 Attempting WS connection to: ${wsUrl} for user: ${userId}`);

  const socket = new SockJS(wsUrl);


  const client = new Client({
    webSocketFactory: () => socket,

    reconnectDelay: 5000,
    debug: (str) => console.log("STOMP:", str),

    // ✅ Thêm Authorization header vào STOMP connect
    connectHeaders: token ? {
      Authorization: `Bearer ${token}`
    } : {},

    onConnect: (frame) => {
      console.log("🔔 WS connected | User:", userId, "| Frame:", frame.headers);

      // Subscribe notifications
      client.subscribe(
        `/topic/notifications/${userId}`,
        (message: IMessage) => {
          console.log("📩 NEW WS MESSAGE:", message.body);
          try {
            const data: NotificationSocketDTO = JSON.parse(message.body);
            onMessage(data);
          } catch (err) {
            console.error("❌ Parse notification error", err, message.body);
          }
        }
      );

      // Subscribe incoming call trên cùng connection
      client.subscribe(
        `/topic/call/incoming/${userId}`,
        (message: IMessage) => {
          console.log("📞 INCOMING CALL:", message.body);
          try {
            const data: IncomingCallDTO = JSON.parse(message.body);
            onIncomingCall?.(data);
          } catch (err) {
            console.error("❌ Parse incoming call error", err, message.body);
          }
        }
      );

      // 🚫 [INSTANT KICK OUT] Lắng nghe tín hiệu bị đá ra từ thiết bị khác
      client.subscribe(
        `/topic/user/${userId}/kick-out`,
        (message: IMessage) => {
          const newSessionId = message.body;
          const currentSessionId = localStorage.getItem("sessionId");
          
          // 🔥 QUAN TRỌNG: Chỉ bị đá nếu:
          // 1. Máy ĐANG CÓ một sessionId (đã login rồi)
          // 2. Và sessionId mới nhận được KHÁC với cái đang có
          if (currentSessionId && newSessionId && newSessionId !== currentSessionId) {
            console.warn("🛑 [KICK_OUT] Another device logged in. Current session is invalidated.");
            
            const { setKickedOut } = useAuthStore.getState();
            
            // Xóa session data
            localStorage.clear();
            sessionStorage.clear();
            
            // Hiện Modal
            setKickedOut(true);
          }
        }
      );
    },

    onStompError: (frame) => {
      console.error("❌ Broker error:", frame.headers["message"]);
      console.error("Details:", frame.body);
    },

    onWebSocketClose: () => {
      console.warn("⚠️ WS disconnected");
    },
  });

  client.activate();

  return {
    disconnect: () => client.deactivate(),
  };
};


