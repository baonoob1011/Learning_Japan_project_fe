"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getUserIdFromToken } from "@/utils/jwt";
import { useDarkMode } from "@/hooks/useDarkMode";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LoadingCat from "@/components/LoadingCat";
import ContactsList from "@/components/chat/Contactslist";
import ChatArea from "@/components/chat/Chatarea";

interface Contact {
  id: string; // = roomId
  name: string;
  lastMessage: string;
  avatar: string;
  online: boolean;
  unread?: number;
  timestamp: string;
  roomType?: "PRIVATE" | "GROUP";
}

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "🤣",
  "😂",
  "🙂",
  "🙃",
  "😉",
  "😊",
  "😇",
  "🥰",
  "😍",
  "🤩",
  "😘",
  "😗",
  "😚",
  "😙",
  "😋",
  "😛",
  "😜",
  "🤪",
  "😝",
  "🤑",
  "🤗",
  "🤭",
  "🤫",
  "🤔",
  "👍",
  "👎",
  "👌",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "🤙",
  "👏",
  "🙌",
  "💪",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🤎",
  "🖤",
  "🤍",
  "💔",
  "💕",
  "💞",
  "💓",
  "💗",
  "💖",
  "💘",
  "💝",
  "💟",
  "✨",
  "🔥",
  "⚡",
  "💯",
  "✅",
  "❌",
  "🎉",
  "🎊",
  "🎈",
  "🎁",
  "🏆",
];

function ChatPageInner() {
  const searchParams = useSearchParams();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    file: File;
    preview: string;
    type: "image" | "file";
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // ✅ Lazy initializer — chạy 1 lần lúc mount, không cần effect
  const [currentUserId] = useState<string | null>(() => getUserIdFromToken());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const { isDarkMode, toggleDarkMode, mounted } = useDarkMode();

  // ── Init user ──────────────────────────────────────────────────────────────

  const {
    messages: socketMessages,
    isConnected,
    sendMessage: sendSocketMessage,
  } = useChatSocket(selectedContact?.id || null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectContact = (contact: Contact) => {
    // contact.id đã là roomId từ InboxList/GroupList
    setSelectedContact(contact);
  };

  const handleSendMessage = () => {
    if (
      (!message.trim() && !attachmentPreview) ||
      !selectedContact ||
      !isConnected
    )
      return;
    if (message.trim()) sendSocketMessage(message.trim());
    setMessage("");
    setAttachmentPreview(null);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setAttachmentPreview({
          file,
          preview: ev.target?.result as string,
          type: "image",
        });
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview({ file, preview: "", type: "file" });
    }
  };

  // ── Loading gate ───────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <LoadingCat
            size="xl"
            isDark={true}
            message="Đang tải"
            subMessage="Vui lòng đợi trong giây lát"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 5px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 5px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className={`flex h-screen ${
          isDarkMode
            ? "bg-gray-900"
            : "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"
        }`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          currentStreak={currentStreak}
          onStreakUpdate={setCurrentStreak}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative z-0">
          <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

          <div className="flex-1 flex overflow-hidden">
            <ContactsList
              selectedContact={selectedContact}
              isConnected={isConnected}
              searchQuery=""
              isDarkMode={isDarkMode}
              onSearchChange={() => {}}
              onSelectContact={handleSelectContact}
            />

            <ChatArea
              selectedContact={selectedContact}
              currentUserId={currentUserId}
              message={message}
              isConnected={isConnected}
              isDarkMode={isDarkMode}
              showEmojiPicker={showEmojiPicker}
              attachmentPreview={attachmentPreview}
              emojis={EMOJIS}
              messagesEndRef={messagesEndRef}
              incomingMessages={socketMessages}
              onMessageChange={setMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              onEmojiClick={handleEmojiClick}
              onToggleEmojiPicker={() => setShowEmojiPicker((v) => !v)}
              onFileSelect={handleFileSelect}
              onClearAttachment={() => setAttachmentPreview(null)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-gray-900 items-center justify-center">
          <LoadingCat
            size="xl"
            isDark={true}
            message="Đang tải"
            subMessage="Vui lòng đợi trong giây lát"
          />
        </div>
      }
    >
      <ChatPageInner />
    </Suspense>
  );
}
