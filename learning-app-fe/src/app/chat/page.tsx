"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Search,
  Phone,
  Video,
  ArrowLeft,
  Image as ImageIcon,
  File,
  X,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatMessageResponse, ChatRoomResponse } from "@/types/chat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getUserIdFromToken } from "@/utils/jwt";
import { userService, UserChatResponse } from "@/services/userService";
import { roomService } from "@/services/roomService";
import { useDebounce } from "@/hooks/useDebounce";
import Sidebar from "@/components/Sidebar";
import { useDarkMode } from "@/hooks/useDarkMode";
import Header from "@/components/Header";
import LoadingCat from "@/components/LoadingCat";
// ❌ Removed: import MaziAIChat from "@/components/NiboChatAI";

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

const normalizeId = (id: string | number | null | undefined): string => {
  return String(id || "").trim();
};

export default function ChatPage() {
  const router = useRouter();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [searchResults, setSearchResults] = useState<UserChatResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    file: File;
    preview: string;
    type: "image" | "file";
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const { isDarkMode, toggleDarkMode, mounted } = useDarkMode();

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const emojis = [
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

  useEffect(() => {
    const id = getUserIdFromToken();
    console.log("🔑 Current User ID:", id, "Type:", typeof id);
    setCurrentUserId(id);
  }, []);

  const {
    messages: socketMessages,
    isConnected,
    sendMessage: sendSocketMessage,
    setMessages: setSocketMessages,
  } = useChatSocket(selectedContact?.id || null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoadingContacts(true);
        const rooms = await roomService.getMyRooms();

        const mappedContacts: Contact[] = rooms.map(
          (room: ChatRoomResponse) => ({
            id: room.id,
            name: room.otherUserName || "Unknown",
            lastMessage: room.lastMessage || "",
            avatar: room.otherUserAvatar || "/default-avatar.png",
            online: false,
            timestamp: room.lastMessageTime || "",
            unread: room.unreadCount || undefined,
          })
        );

        setContacts(mappedContacts);
      } catch (error) {
        console.error("Error loading contacts:", error);
        setContacts([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    loadContacts();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await userService.searchUsers(debouncedSearchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (!selectedContact || !currentUserId) {
      setDisplayMessages([]);
      setSocketMessages([]);
      return;
    }

    const loadMessageHistory = async () => {
      try {
        setDisplayMessages([]);
        setSocketMessages([]);

        const pageData = await roomService.getMessages(selectedContact.id);
        const data: ChatMessageResponse[] = pageData.content || [];

        setSocketMessages(data);

        const formattedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          text: msg.content,
          senderId: normalizeId(msg.senderId),
          timestamp: new Date(msg.sentAt),
          avatar: selectedContact.avatar,
          senderName: msg.senderName,
        }));

        setDisplayMessages(formattedMessages);
      } catch (error) {
        console.error("Error loading message history:", error);
        setDisplayMessages([]);
        setSocketMessages([]);
      }
    };

    loadMessageHistory();
  }, [selectedContact, currentUserId, setSocketMessages]);

  useEffect(() => {
    if (!selectedContact || !currentUserId) return;

    const formattedMessages: Message[] = socketMessages.map((msg) => ({
      id: msg.id,
      text: msg.content,
      senderId: normalizeId(msg.senderId),
      timestamp: new Date(msg.sentAt),
      avatar: selectedContact.avatar,
      senderName: msg.senderName,
    }));

    setDisplayMessages(formattedMessages);
  }, [socketMessages, selectedContact, currentUserId]);

  const handleSelectContact = async (contact: Contact) => {
    if (searchQuery.trim() && !contacts.find((c) => c.id === contact.id)) {
      try {
        const room = await roomService.createPrivateRoom({
          targetUserId: contact.id,
        });

        const updatedContact: Contact = {
          ...contact,
          id: room.id,
        };

        setSelectedContact(updatedContact);
        setContacts((prev) => [updatedContact, ...prev]);
      } catch (error) {
        console.error("Error creating private room:", error);
      }
    } else {
      setSelectedContact(contact);
    }
  };

  const handleSendMessage = async () => {
    if (
      (!message.trim() && !attachmentPreview) ||
      !selectedContact ||
      !isConnected
    )
      return;

    if (message.trim()) {
      sendSocketMessage(message.trim());
    }

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
    const reader = new FileReader();

    reader.onload = (event) => {
      setAttachmentPreview({
        file,
        preview: event.target?.result as string,
        type: isImage ? "image" : "file",
      });
    };

    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview({
        file,
        preview: "",
        type: "file",
      });
    }
  };

  const displayedContacts = searchQuery.trim()
    ? searchResults.map((user) => ({
        id: user.id,
        name: user.fullName,
        lastMessage: user.email,
        avatar: user.avatarUrl || "/default-avatar.png",
        online: false,
        timestamp: "",
        unread: undefined,
      }))
    : contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

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
        /* Custom Scrollbar Styles */
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
          transition: background 0.2s;
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
          transition: background 0.2s;
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
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />

        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          currentStreak={currentStreak}
          onStreakUpdate={setCurrentStreak}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative z-0">
          <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

          {/* Chat Container */}
          <div className="flex-1 flex overflow-hidden">
            {/* Contacts Sidebar */}
            <div
              className={`w-[380px] border-r flex flex-col shadow-xl transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white/90 border-cyan-200/60"
              }`}
            >
              <div
                className={`p-6 border-b transition-colors duration-300 ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800/80"
                    : "border-cyan-200/60 bg-gradient-to-r from-cyan-50/80 to-blue-50/80"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <MessageCircle
                      className={`w-6 h-6 ${
                        isDarkMode ? "text-cyan-400" : "text-cyan-600"
                      }`}
                    />
                    <h1
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-gray-100" : "text-cyan-900"
                      }`}
                    >
                      Tin nhắn
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? "bg-emerald-500" : "bg-red-500"
                      }`}
                      title={isConnected ? "Đã kết nối" : "Mất kết nối"}
                    />
                    <button
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-100"
                      }`}
                    >
                      <MoreVertical
                        className={`w-5 h-5 ${
                          isDarkMode ? "text-gray-300" : "text-cyan-600"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <Search
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      isDarkMode
                        ? "text-gray-400 group-focus-within:text-cyan-400"
                        : "text-cyan-400 group-focus-within:text-cyan-600"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                        : "bg-cyan-50/50 border-cyan-200/60 text-gray-900 placeholder-cyan-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                    }`}
                  />
                </div>
              </div>

              <div
                className={`flex border-b ${
                  isDarkMode
                    ? "border-gray-700 bg-gray-800/40"
                    : "border-cyan-200/60 bg-white/40"
                }`}
              >
                <button
                  className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    isDarkMode
                      ? "text-cyan-400 border-cyan-500"
                      : "text-cyan-700 border-cyan-500"
                  }`}
                >
                  HỘP THƯ
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-cyan-500 hover:text-cyan-700"
                  }`}
                >
                  NHÓM
                </button>
              </div>

              <div
                className={`flex-1 overflow-y-auto ${
                  isDarkMode ? "custom-scrollbar-dark" : "custom-scrollbar"
                }`}
              >
                {isLoadingContacts ? (
                  <div className="flex items-center justify-center h-32">
                    <LoadingCat
                      size="sm"
                      isDark={isDarkMode}
                      message="Đang tải danh bạ..."
                    />
                  </div>
                ) : isSearching ? (
                  <div className="flex items-center justify-center h-32">
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-cyan-500"
                      }`}
                    >
                      Đang tìm kiếm...
                    </p>
                  </div>
                ) : displayedContacts.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-cyan-500"
                      }`}
                    >
                      {searchQuery.trim()
                        ? "Không tìm thấy người dùng"
                        : "Chưa có liên hệ"}
                    </p>
                  </div>
                ) : (
                  displayedContacts.map((contact, index) => (
                    <div
                      key={`${contact.id}-${index}`}
                      onClick={() => handleSelectContact(contact)}
                      className={`p-4 border-l-4 cursor-pointer transition-all duration-300 ${
                        selectedContact?.id === contact.id
                          ? isDarkMode
                            ? "bg-gray-700 border-l-cyan-500"
                            : "bg-gradient-to-r from-cyan-50 to-blue-50/40 border-l-cyan-500"
                          : isDarkMode
                          ? "border-l-transparent hover:bg-gray-700 hover:border-l-gray-600"
                          : "border-l-transparent hover:bg-gradient-to-r hover:from-cyan-50/80 hover:to-blue-50/60 hover:border-l-cyan-300"
                      }`}
                      style={{
                        animation: `slideInLeft 0.3s ease-out ${
                          index * 0.05
                        }s both`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-100 shadow-md"
                          />
                          {contact.online && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-semibold truncate ${
                                isDarkMode ? "text-gray-100" : "text-cyan-900"
                              }`}
                            >
                              {contact.name}
                            </h3>
                            {contact.timestamp && (
                              <span
                                className={`text-xs ml-2 ${
                                  isDarkMode ? "text-gray-400" : "text-cyan-600"
                                }`}
                              >
                                {contact.timestamp}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm truncate ${
                              isDarkMode ? "text-gray-400" : "text-cyan-700"
                            }`}
                          >
                            {contact.lastMessage}
                          </p>
                        </div>
                        {contact.unread && (
                          <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                            {contact.unread}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Chat Area */}
            <div
              className={`flex-1 flex flex-col ${
                isDarkMode ? "bg-gray-900/40" : "bg-white/40"
              }`}
            >
              {selectedContact ? (
                <>
                  <div
                    className={`p-4 border-b shadow-sm transition-colors duration-300 ${
                      isDarkMode
                        ? "bg-gray-800/90 border-gray-700"
                        : "bg-white/90 border-cyan-200/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={selectedContact.avatar}
                            alt={selectedContact.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-cyan-200 shadow-md"
                          />
                          {selectedContact.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h2
                            className={`font-semibold ${
                              isDarkMode ? "text-gray-100" : "text-cyan-900"
                            }`}
                          >
                            {selectedContact.name}
                          </h2>
                          <p className="text-xs text-emerald-600 font-medium">
                            {selectedContact.online
                              ? "Đang hoạt động"
                              : "Ngoại tuyến"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className={`p-2.5 rounded-full transition-all hover:scale-110 ${
                            isDarkMode
                              ? "hover:bg-gray-700"
                              : "hover:bg-cyan-50"
                          }`}
                        >
                          <Phone
                            className={`w-5 h-5 ${
                              isDarkMode ? "text-cyan-400" : "text-cyan-600"
                            }`}
                          />
                        </button>
                        <button
                          className={`p-2.5 rounded-full transition-all hover:scale-110 ${
                            isDarkMode
                              ? "hover:bg-gray-700"
                              : "hover:bg-blue-50"
                          }`}
                        >
                          <Video
                            className={`w-5 h-5 ${
                              isDarkMode ? "text-cyan-400" : "text-blue-600"
                            }`}
                          />
                        </button>
                        <button
                          className={`p-2.5 rounded-full transition-colors ${
                            isDarkMode
                              ? "hover:bg-gray-700"
                              : "hover:bg-cyan-100"
                          }`}
                        >
                          <MoreVertical
                            className={`w-5 h-5 ${
                              isDarkMode ? "text-gray-300" : "text-cyan-600"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex-1 overflow-y-auto p-6 space-y-4 ${
                      isDarkMode
                        ? "bg-gradient-to-b from-gray-900/30 to-gray-800/30 custom-scrollbar-dark"
                        : "bg-gradient-to-b from-cyan-50/30 to-blue-50/30 custom-scrollbar"
                    }`}
                  >
                    {displayMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-gray-400" : "text-cyan-500"
                          }`}
                        >
                          Chưa có tin nhắn
                        </p>
                      </div>
                    ) : (
                      displayMessages.map((msg, index) => {
                        const isMe =
                          normalizeId(msg.senderId) ===
                          normalizeId(currentUserId);

                        return (
                          <div
                            key={`${msg.id}-${index}`}
                            className={`flex ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                            style={{
                              animation: `messageSlide 0.3s ease-out ${
                                index * 0.05
                              }s both`,
                            }}
                          >
                            <div
                              className={`flex items-end gap-2 max-w-[70%] ${
                                isMe ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              {!isMe && (
                                <img
                                  src={selectedContact.avatar}
                                  alt="avatar"
                                  className="w-8 h-8 rounded-full object-cover shadow-md"
                                />
                              )}
                              <div
                                className={`px-4 py-2.5 rounded-2xl shadow-md ${
                                  isMe
                                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-br-sm"
                                    : isDarkMode
                                    ? "bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700"
                                    : "bg-white text-cyan-900 rounded-bl-sm border border-cyan-200/60"
                                }`}
                              >
                                {msg.attachment && (
                                  <div className="mb-2">
                                    {msg.attachment.type === "image" ? (
                                      <img
                                        src={msg.attachment.url}
                                        alt="attachment"
                                        className="max-w-full rounded-lg"
                                      />
                                    ) : (
                                      <div
                                        className={`flex items-center gap-2 p-2 rounded ${
                                          isDarkMode
                                            ? "bg-gray-700"
                                            : "bg-cyan-50"
                                        }`}
                                      >
                                        <File className="w-4 h-4" />
                                        <span className="text-sm">
                                          {msg.attachment.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <p className="text-sm leading-relaxed">
                                  {msg.text}
                                </p>
                                <span
                                  className={`text-xs mt-1 block ${
                                    isMe
                                      ? "text-cyan-100"
                                      : isDarkMode
                                      ? "text-gray-400"
                                      : "text-cyan-600"
                                  }`}
                                >
                                  {msg.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div
                    className={`p-4 border-t shadow-lg transition-colors duration-300 ${
                      isDarkMode
                        ? "bg-gray-800/95 border-gray-700"
                        : "bg-white/95 border-cyan-200/60"
                    }`}
                  >
                    {attachmentPreview && (
                      <div className="mb-3 relative">
                        <div
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            isDarkMode ? "bg-gray-700" : "bg-cyan-50"
                          }`}
                        >
                          {attachmentPreview.type === "image" ? (
                            <img
                              src={attachmentPreview.preview}
                              alt="preview"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <File
                                className={`w-8 h-8 ${
                                  isDarkMode ? "text-cyan-400" : "text-cyan-600"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  isDarkMode ? "text-gray-200" : "text-cyan-900"
                                }`}
                              >
                                {attachmentPreview.file.name}
                              </span>
                            </div>
                          )}
                          <button
                            onClick={() => setAttachmentPreview(null)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {showEmojiPicker && (
                      <div
                        className={`absolute bottom-20 left-4 rounded-xl shadow-2xl border p-4 max-h-64 overflow-y-auto w-80 z-50 ${
                          isDarkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-cyan-200"
                        }`}
                      >
                        <div className="grid grid-cols-8 gap-2">
                          {emojis.map((emoji, index) => (
                            <button
                              key={index}
                              onClick={() => handleEmojiClick(emoji)}
                              className={`text-2xl rounded p-1 transition-colors ${
                                isDarkMode
                                  ? "hover:bg-gray-700"
                                  : "hover:bg-cyan-50"
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-2.5 rounded-full transition-all hover:scale-110 ${
                          isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-100"
                        }`}
                      >
                        <Smile
                          className={`w-5 h-5 ${
                            isDarkMode ? "text-cyan-400" : "text-cyan-600"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className={`p-2.5 rounded-full transition-all hover:scale-110 ${
                          isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-100"
                        }`}
                      >
                        <ImageIcon
                          className={`w-5 h-5 ${
                            isDarkMode ? "text-cyan-400" : "text-cyan-600"
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2.5 rounded-full transition-all hover:scale-110 ${
                          isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-100"
                        }`}
                      >
                        <Paperclip
                          className={`w-5 h-5 ${
                            isDarkMode ? "text-cyan-400" : "text-cyan-600"
                          }`}
                        />
                      </button>
                      <input
                        type="text"
                        placeholder={
                          isConnected
                            ? "Nhập tin nhắn..."
                            : "Đang kết nối đến chat..."
                        }
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={!isConnected}
                        className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDarkMode
                            ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                            : "bg-cyan-50/50 border-cyan-200/60 text-gray-900 placeholder-cyan-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                        }`}
                      />
                      <button
                        onClick={handleSendMessage}
                        className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          (!message.trim() && !attachmentPreview) ||
                          !isConnected
                        }
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div
                      className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-xl ${
                        isDarkMode
                          ? "bg-gradient-to-br from-gray-700 to-gray-800"
                          : "bg-gradient-to-br from-cyan-100 to-blue-100"
                      }`}
                    >
                      <Send
                        className={`w-12 h-12 ${
                          isDarkMode ? "text-cyan-400" : "text-cyan-600"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-gray-100" : "text-cyan-900"
                      }`}
                    >
                      Chọn một cuộc trò chuyện
                    </h3>
                    <p
                      className={`max-w-md ${
                        isDarkMode ? "text-gray-400" : "text-cyan-600"
                      }`}
                    >
                      Chọn một liên hệ từ danh sách để bắt đầu chat
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ❌ Removed: <MaziAIChat isDarkMode={isDarkMode} /> */}
    </>
  );
}
