"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatMessageResponse, ChatRoomResponse } from "@/types/chat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getUserIdFromToken } from "@/utils/jwt";
import { roomService } from "@/services/roomService";
import { useDebounce } from "@/hooks/useDebounce";
import Sidebar from "@/components/Sidebar";
import { useDarkMode } from "@/hooks/useDarkMode";
import Header from "@/components/Header";
import LoadingCat from "@/components/LoadingCat";
import ContactsList from "@/components/chat/Contactslist";
import ChatArea from "@/components/chat/Chatarea";

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  avatar?: string;
  senderName?: string;
  attachment?: {
    type: "image" | "file";
    url: string;
    name?: string;
  };
}

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  online: boolean;
  unread?: number;
  timestamp: string;
}

const normalizeId = (id: string | number | null | undefined): string =>
  String(id || "").trim();

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

// ── Inner component (cần Suspense vì dùng useSearchParams) ─────────────────
function ChatPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [searchResults, setSearchResults] = useState<ChatRoomResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    file: File;
    preview: string;
    type: "image" | "file";
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const { isDarkMode, toggleDarkMode, mounted } = useDarkMode();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // ── Init user ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = getUserIdFromToken();
    setCurrentUserId(id);
  }, []);

  const {
    messages: socketMessages,
    isConnected,
    sendMessage: sendSocketMessage,
    setMessages: setSocketMessages,
  } = useChatSocket(selectedContact?.id || null);

  // ── Scroll to bottom (delay để YouTube card render xong) ─────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
  }, [displayMessages]);

  // ── Load contacts ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoadingContacts(true);
        const rooms = await roomService.getMyRooms();
        const mapped: Contact[] = rooms.map((room: ChatRoomResponse) => ({
          id: room.id,
          name: room.otherUserName || "Unknown",
          lastMessage: room.lastMessage || "",
          avatar: room.otherUserAvatar || "/default-avatar.png",
          online: false,
          timestamp: room.lastMessageTime || "",
          unread: room.unreadCount || undefined,
        }));
        setContacts(mapped);
      } catch {
        setContacts([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };
    loadContacts();
  }, []);

  // ── Handle share redirect từ ShareVideoModal ───────────────────────────────
  useEffect(() => {
    const roomId = searchParams.get("roomId");
    const shareMsg = searchParams.get("shareMsg");
    if (!roomId || isLoadingContacts) return;

    const target = contacts.find((c) => c.id === roomId);
    if (target) {
      setSelectedContact(target);
      if (shareMsg) setMessage(decodeURIComponent(shareMsg));
      // Xoá query params khỏi URL sau khi xử lý
      router.replace("/chat");
    }
  }, [searchParams, contacts, isLoadingContacts, router]);

  // ── Search rooms ───────────────────────────────────────────────────────────
  useEffect(() => {
    const searchRooms = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      try {
        setIsSearching(true);
        const results = await roomService.searchRooms(debouncedSearchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    searchRooms();
  }, [debouncedSearchQuery]);

  // ── Load message history ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedContact || !currentUserId) {
      setDisplayMessages([]);
      setSocketMessages([]);
      return;
    }
    const load = async () => {
      try {
        setDisplayMessages([]);
        setSocketMessages([]);
        const pageData = await roomService.getMessages(selectedContact.id);
        const data: ChatMessageResponse[] = pageData.content || [];
        setSocketMessages(data);
        // API trả về mới nhất trước → reverse để cũ trên, mới dưới
        const reversed = [...data].reverse();
        setDisplayMessages(
          reversed.map((msg) => ({
            id: msg.id,
            text: msg.content,
            senderId: normalizeId(msg.senderId),
            timestamp: new Date(msg.sentAt),
            avatar: selectedContact.avatar,
            senderName: msg.senderName,
          }))
        );
      } catch {
        setDisplayMessages([]);
        setSocketMessages([]);
      }
    };
    load();
  }, [selectedContact, currentUserId, setSocketMessages]);

  // ── Sync socket messages ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedContact || !currentUserId) return;
    // Socket cũng reverse để đồng bộ với load history
    const reversedSocket = [...socketMessages].reverse();
    setDisplayMessages(
      reversedSocket.map((msg) => ({
        id: msg.id,
        text: msg.content,
        senderId: normalizeId(msg.senderId),
        timestamp: new Date(msg.sentAt),
        avatar: selectedContact.avatar,
        senderName: msg.senderName,
      }))
    );
  }, [socketMessages, selectedContact, currentUserId]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectContact = async (contact: Contact) => {
    if (searchQuery.trim() && !contacts.find((c) => c.id === contact.id)) {
      try {
        const room = await roomService.createPrivateRoom({
          targetUserId: contact.id,
        });
        const updated: Contact = { ...contact, id: room.id };
        setSelectedContact(updated);
        setContacts((prev) => [updated, ...prev]);
      } catch (error) {
        console.error("Error creating private room:", error);
      }
    } else {
      setSelectedContact(contact);
    }
    setSearchQuery("");
  };

  const handleSendMessage = async () => {
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

  // ── Derived ────────────────────────────────────────────────────────────────
  const displayedContacts: Contact[] = searchQuery.trim()
    ? searchResults.map((room) => ({
        id: room.id,
        name: room.otherUserName || "Unknown",
        lastMessage: room.lastMessage || "",
        avatar: room.otherUserAvatar || "/default-avatar.png",
        online: false,
        timestamp: room.lastMessageTime || "",
        unread: room.unreadCount || undefined,
      }))
    : contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

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
              contacts={contacts}
              displayedContacts={displayedContacts}
              selectedContact={selectedContact}
              isLoadingContacts={isLoadingContacts}
              isSearching={isSearching}
              isConnected={isConnected}
              searchQuery={searchQuery}
              isDarkMode={isDarkMode}
              onSearchChange={setSearchQuery}
              onSelectContact={handleSelectContact}
            />

            <ChatArea
              selectedContact={selectedContact}
              displayMessages={displayMessages}
              currentUserId={currentUserId}
              message={message}
              isConnected={isConnected}
              isDarkMode={isDarkMode}
              showEmojiPicker={showEmojiPicker}
              attachmentPreview={attachmentPreview}
              emojis={EMOJIS}
              messagesEndRef={messagesEndRef}
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

// ── Export mặc định bọc Suspense (bắt buộc khi dùng useSearchParams) ─────────
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
