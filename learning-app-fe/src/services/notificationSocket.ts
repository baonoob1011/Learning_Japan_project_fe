import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

export type IncomingCallDTO = {
  type: "incoming";
  roomId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
};

export type NotificationSocketDTO = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export const connectNotificationSocket = (
  userId: string,
  onMessage: (data: NotificationSocketDTO) => void,
  onIncomingCall?: (data: IncomingCallDTO) => void
) => {
  const socket = new SockJS("http://localhost:8080/ws");

  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    debug: (str) => console.log("STOMP:", str),

    onConnect: () => {
      console.log("🔔 WS connected");

      // Subscribe notifications
      client.subscribe(
        `/topic/notifications/${userId}`,
        (message: IMessage) => {
          console.log("🔥 RAW WS MESSAGE:", message);
          try {
            console.log("🔥 BODY:", message.body);
            const data: NotificationSocketDTO = JSON.parse(message.body);
            console.log("🔥 PARSED DATA:", data);
            onMessage(data);
          } catch (err) {
            console.error("❌ Parse notification error", err, message.body);
          }
        }
      );

      // ✅ Subscribe incoming call trên cùng connection
      client.subscribe(
        `/topic/call/incoming/${userId}`,
        (message: IMessage) => {
          console.log("📞 RAW INCOMING CALL:", message);
          try {
            const data: IncomingCallDTO = JSON.parse(message.body);
            console.log("📞 PARSED INCOMING CALL:", data);
            onIncomingCall?.(data);
          } catch (err) {
            console.error("❌ Parse incoming call error", err, message.body);
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
