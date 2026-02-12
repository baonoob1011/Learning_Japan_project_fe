"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { chatSocketService } from "@/services/chatSocketService";
import { ChatMessageResponse } from "@/types/chat";

interface UseChatSocketReturn {
  messages: ChatMessageResponse[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageResponse[]>>;
}

export const useChatSocket = (roomId: string | null): UseChatSocketReturn => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Connect once on mount
  useEffect(() => {
    chatSocketService.connect(() => {
      setIsConnected(true);
    });

    return () => {
      chatSocketService.disconnect();
    };
  }, []);

  // Subscribe when roomId changes
  useEffect(() => {
    if (!roomId || !isConnected) return;

    let isSubscriptionActive = true;

    const subscription = chatSocketService.subscribeRoom(
      roomId,
      (msg: ChatMessageResponse) => {
        // Chỉ update nếu subscription vẫn active (tránh race condition)
        if (isSubscriptionActive) {
          setMessages((prev) => [...prev, msg]);
        }
      }
    );

    // Cleanup: unsubscribe when room changes
    return () => {
      isSubscriptionActive = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [roomId, isConnected]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!roomId || !content.trim()) return;

      chatSocketService.sendMessage({
        roomId,
        content: content.trim(),
      });
    },
    [roomId]
  );

  return {
    messages,
    isConnected,
    sendMessage,
    setMessages,
  };
};
