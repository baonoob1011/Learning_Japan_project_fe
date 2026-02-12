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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatMessageResponse, ChatRoomResponse } from "@/types/chat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getUserIdFromToken } from "@/utils/jwt";
import { userService, UserChatResponse } from "@/services/userService";
import { roomService } from "@/services/roomService";
import { useDebounce } from "@/hooks/useDebounce";

// 🔧 FIX: Bỏ sender: "user" | "other", lưu senderId thay vì
interface Message {
  id: string;
  text: string;
  senderId: string; // ✅ Lưu ID thật, không lưu trạng thái
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
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤢",
    "🤮",
    "🤧",
    "🥵",
    "🥶",
    "😶‍🌫️",
    "🥴",
    "😵",
    "🤯",
    "🤠",
    "🥳",
    "😎",
    "🤓",
    "🧐",
    "😕",
    "😟",
    "🙁",
    "☹️",
    "😮",
    "😯",
    "😲",
    "😳",
    "🥺",
    "😦",
    "😧",
    "😨",
    "😰",
    "😥",
    "😢",
    "😭",
    "😱",
    "😖",
    "😣",
    "😞",
    "😓",
    "😩",
    "😫",
    "🥱",
    "😤",
    "😡",
    "😠",
    "🤬",
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

  // 🔧 FIX: Load history - chỉ lưu senderId, KHÔNG tính sender
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

        console.log(
          "📨 Messages loaded:",
          data.map((m) => ({
            id: m.id,
            senderId: normalizeId(m.senderId),
            currentUser: normalizeId(currentUserId),
            isMatch: normalizeId(m.senderId) === normalizeId(currentUserId),
          }))
        );

        setSocketMessages(data);

        // ✅ Chỉ lưu senderId, KHÔNG tính sender
        const formattedMessages: Message[] = data.map((msg) => ({
          id: msg.id,
          text: msg.content,
          senderId: normalizeId(msg.senderId), // ✅ Lưu ID thật
          timestamp: new Date(msg.sentAt),
          avatar: selectedContact.avatar, // Lưu avatar của contact, sẽ dùng khi render
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

  // 🔧 FIX: Sync socket messages - chỉ lưu senderId
  useEffect(() => {
    if (!selectedContact || !currentUserId) return;

    console.log("🔄 Syncing socket messages");
    console.log("Current User:", normalizeId(currentUserId));
    console.log(
      "Socket messages:",
      socketMessages.map((m) => ({
        id: m.id,
        senderId: normalizeId(m.senderId),
        match: normalizeId(m.senderId) === normalizeId(currentUserId),
      }))
    );

    // ✅ Chỉ lưu senderId, KHÔNG tính sender
    const formattedMessages: Message[] = socketMessages.map((msg) => ({
      id: msg.id,
      text: msg.content,
      senderId: normalizeId(msg.senderId), // ✅ Lưu ID thật
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
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

      {/* Sidebar */}
      <div className="w-[380px] bg-white/90 backdrop-blur-xl border-r border-cyan-200/60 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-cyan-200/60 bg-gradient-to-r from-cyan-50/80 to-blue-50/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-cyan-100 rounded-full transition-all hover:scale-110"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5 text-cyan-600" />
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent">
                Messages
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-red-500"
                }`}
                title={isConnected ? "Connected" : "Disconnected"}
              />
              <button className="p-2 hover:bg-cyan-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-cyan-600" />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 group-focus-within:text-cyan-600 transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-cyan-50/50 border border-cyan-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all text-sm text-gray-900 placeholder:text-cyan-400"
            />
          </div>
        </div>

        <div className="flex border-b border-cyan-200/60 bg-white/40">
          <button className="flex-1 py-3 text-sm font-semibold text-cyan-700 border-b-2 border-cyan-500 transition-colors">
            INBOX
          </button>
          <button className="flex-1 py-3 text-sm font-medium text-cyan-500 hover:text-cyan-700 transition-colors">
            GROUPS
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingContacts ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-cyan-500 text-sm">Loading contacts...</p>
            </div>
          ) : isSearching ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-cyan-500 text-sm">Searching...</p>
            </div>
          ) : displayedContacts.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-cyan-500 text-sm">
                {searchQuery.trim() ? "No users found" : "No contacts found"}
              </p>
            </div>
          ) : (
            displayedContacts.map((contact, index) => (
              <div
                key={`${contact.id}-${index}`}
                onClick={() => handleSelectContact(contact)}
                className={`p-4 border-l-4 cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50/80 hover:to-blue-50/60 ${
                  selectedContact?.id === contact.id
                    ? "bg-gradient-to-r from-cyan-50 to-blue-50/40 border-l-cyan-500"
                    : "border-l-transparent hover:border-l-cyan-300"
                }`}
                style={{
                  animation: `slideInLeft 0.3s ease-out ${index * 0.05}s both`,
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
                      <h3 className="font-semibold text-cyan-900 truncate">
                        {contact.name}
                      </h3>
                      {contact.timestamp && (
                        <span className="text-xs text-cyan-600 ml-2">
                          {contact.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cyan-700 truncate">
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
      <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-cyan-200/60 bg-white/90 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="lg:hidden p-2 hover:bg-cyan-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-cyan-600" />
                  </button>
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
                    <h2 className="font-semibold text-cyan-900">
                      {selectedContact.name}
                    </h2>
                    <p className="text-xs text-emerald-600 font-medium">
                      {selectedContact.online ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 hover:bg-cyan-50 rounded-full transition-all hover:scale-110">
                    <Phone className="w-5 h-5 text-cyan-600" />
                  </button>
                  <button className="p-2.5 hover:bg-blue-50 rounded-full transition-all hover:scale-110">
                    <Video className="w-5 h-5 text-blue-600" />
                  </button>
                  <button className="p-2.5 hover:bg-cyan-100 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-cyan-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-cyan-50/30 to-blue-50/30">
              {displayMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-cyan-500 text-sm">No messages yet</p>
                </div>
              ) : (
                displayMessages.map((msg, index) => {
                  // 🔥 TÍNH isMe TẠI RENDER - KHÔNG LƯU VÀO STATE
                  const isMe =
                    normalizeId(msg.senderId) === normalizeId(currentUserId);

                  console.log(
                    `Message ${index}:`,
                    "senderId:",
                    msg.senderId,
                    "currentUserId:",
                    currentUserId,
                    "isMe:",
                    isMe
                  );

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
                        {/* ✅ CHỈ hiển thị avatar cho tin nhắn của NGƯỜI KHÁC */}
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
                                <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded">
                                  <File className="w-4 h-4" />
                                  <span className="text-sm">
                                    {msg.attachment.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <span
                            className={`text-xs mt-1 block ${
                              isMe ? "text-cyan-100" : "text-cyan-600"
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

            <div className="p-4 border-t border-cyan-200/60 bg-white/95 backdrop-blur-xl shadow-lg">
              {attachmentPreview && (
                <div className="mb-3 relative">
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg">
                    {attachmentPreview.type === "image" ? (
                      <img
                        src={attachmentPreview.preview}
                        alt="preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <File className="w-8 h-8 text-cyan-600" />
                        <span className="text-sm text-cyan-900">
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
                <div className="absolute bottom-20 left-4 bg-white rounded-xl shadow-2xl border border-cyan-200 p-4 max-h-64 overflow-y-auto w-80 z-50">
                  <div className="grid grid-cols-8 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl hover:bg-cyan-50 rounded p-1 transition-colors"
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
                  className="p-2.5 hover:bg-cyan-100 rounded-full transition-all hover:scale-110"
                >
                  <Smile className="w-5 h-5 text-cyan-600" />
                </button>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2.5 hover:bg-cyan-100 rounded-full transition-all hover:scale-110"
                >
                  <ImageIcon className="w-5 h-5 text-cyan-600" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 hover:bg-cyan-100 rounded-full transition-all hover:scale-110"
                >
                  <Paperclip className="w-5 h-5 text-cyan-600" />
                </button>
                <input
                  type="text"
                  placeholder={
                    isConnected ? "Type a message..." : "Connecting to chat..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-2.5 bg-cyan-50/50 border border-cyan-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all text-sm text-gray-900 placeholder:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    (!message.trim() && !attachmentPreview) || !isConnected
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
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center shadow-xl">
                <Send className="w-12 h-12 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Select a conversation
              </h3>
              <p className="text-cyan-600 max-w-md">
                Choose a contact from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
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
    </div>
  );
}
