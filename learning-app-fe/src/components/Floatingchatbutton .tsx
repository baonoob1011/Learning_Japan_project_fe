"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Send,
  Loader2,
  Users,
  ChevronDown,
  MessageCircle,
  Phone,
  PlayCircle,
} from "lucide-react";
import { useChatSocket } from "@/hooks/useChatSocket";
import { getUserIdFromToken } from "@/utils/jwt";
import {
  roomService,
  PrivateChatPreviewResponse,
  ChatMessageResponse,
} from "@/services/roomService";
import { userService } from "@/services/userService";
import { CallModal } from "@/components/chat/CallModal";

interface Contact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isGroup?: boolean;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: Date;
}

type Tab = "GROUP" | "INBOX";

interface FloatingChatButtonProps {
  isDarkMode?: boolean;
}

function mapApiMsg(m: ChatMessageResponse): Message {
  return {
    id: m.id,
    text: m.content,
    senderId: String(m.senderId),
    senderName: m.senderName ?? undefined,
    timestamp: new Date(m.sentAt),
  };
}

const YT_REGEX =
  /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)|https?:\/\/youtu\.be\/([\w-]+)/g;

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}

function MessageContent({
  text,
  isMe,
  onNavigate,
}: {
  text: string;
  isMe: boolean;
  onNavigate: (path: string) => void;
}) {
  const ytMatches = Array.from(new Set(text.match(YT_REGEX) || []));
  if (ytMatches.length === 0) {
    return (
      <p className="text-xs leading-relaxed whitespace-pre-wrap">{text}</p>
    );
  }
  const plainText = text.replace(YT_REGEX, "").trim();
  return (
    <div className="space-y-1.5">
      {plainText && (
        <p className="text-xs leading-relaxed whitespace-pre-wrap">
          {plainText}
        </p>
      )}
      {ytMatches.map((url) => {
        const videoId = extractYoutubeId(url);
        if (!videoId) return null;
        const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        return (
          <button
            key={url}
            onClick={() => onNavigate(`/video/${videoId}`)}
            className={`w-full text-left rounded-xl overflow-hidden border transition-all hover:scale-[1.02] hover:shadow-lg ${
              isMe
                ? "border-white/20 bg-white/10"
                : "border-gray-600 bg-gray-700"
            }`}
          >
            <div className="relative">
              <img
                src={thumb}
                alt="video"
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <div
              className={`px-2 py-1.5 text-[10px] font-medium truncate ${
                isMe ? "text-white/90" : "text-gray-200"
              }`}
            >
              {url}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function FloatingChatButton({
  isDarkMode = false,
}: FloatingChatButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("GROUP");
  const [inboxContacts, setInboxContacts] = useState<Contact[]>([]);
  const [groupContacts, setGroupContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserAvatar, setCurrentUserAvatar] = useState("");
  const [senderNameMap, setSenderNameMap] = useState<Record<string, string>>(
    {}
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetchedInbox = useRef(false);
  const hasFetchedGroup = useRef(false);
  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    if (!currentUserId) return;
    userService
      .getUserById(currentUserId)
      .then((profile) => {
        setCurrentUserName(profile.fullName);
        setCurrentUserAvatar(profile.avatarUrl ?? "");
      })
      .catch(console.error);
  }, [currentUserId]);

  const {
    messages: socketMessages,
    isConnected,
    sendMessage,
  } = useChatSocket(selectedContact?.id || null);

  const socketMapped: Message[] = socketMessages.map(mapApiMsg);
  const historyIds = new Set(historyMessages.map((m) => m.id));
  const messages = [
    ...historyMessages,
    ...socketMapped.filter((m) => !historyIds.has(m.id)),
  ];

  // ── Fetch inbox ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || hasFetchedInbox.current) return;
    hasFetchedInbox.current = true;
    let cancelled = false;
    async function run() {
      setIsLoadingContacts(true);
      try {
        const data: PrivateChatPreviewResponse[] =
          await roomService.getMyChatUsers();
        if (cancelled) return;
        const mapped: Contact[] = data.map((p) => ({
          id: p.roomId,
          name: p.fullName,
          avatar: p.avatarUrl ?? "/default-avatar.png",
          lastMessage: p.lastMessage ?? "",
          timestamp: p.lastMessageTime ?? "",
          isGroup: false,
        }));
        setInboxContacts(mapped);
      } catch {
        if (!cancelled) setInboxContacts([]);
      } finally {
        if (!cancelled) setIsLoadingContacts(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // ── Fetch group ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || hasFetchedGroup.current) return;
    hasFetchedGroup.current = true;
    let cancelled = false;
    async function run() {
      try {
        const data = await roomService.getMyGroupRooms();
        if (cancelled) return;
        const mapped = data.map((g) => ({
          id: g.id,
          name: g.name ?? "Nhóm không tên",
          avatar: g.avatarUrl ?? "/group-avatar.png",
          lastMessage: g.lastMessage ?? "",
          timestamp: g.lastMessageTime ?? g.createdAt ?? "",
          isGroup: true,
        }));
        setGroupContacts(mapped);
        if (mapped.length > 0) setSelectedContact(mapped[0]);
      } catch {
        if (!cancelled) setGroupContacts([]);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // ── Fetch history ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedContact?.id) {
      setHistoryMessages([]);
      return;
    }
    let cancelled = false;
    setHistoryMessages([]);
    setIsLoadingMessages(true);
    async function run() {
      try {
        const page = await roomService.getMessages(selectedContact!.id, 0, 50);
        if (cancelled) return;
        const history = [...(page.content ?? [])].reverse().map(mapApiMsg);
        setHistoryMessages(history);

        const nameMap: Record<string, string> = {};
        (page.content ?? []).forEach((m: ChatMessageResponse) => {
          if (m.senderId && m.senderName) {
            nameMap[String(m.senderId)] = m.senderName;
          }
        });
        setSenderNameMap((prev) => ({ ...prev, ...nameMap }));
      } catch {
        if (!cancelled) setHistoryMessages([]);
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedContact?.id]);

  // ── Reset khi đóng ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      hasFetchedInbox.current = false;
      hasFetchedGroup.current = false;
      setSelectedContact(null);
      setHistoryMessages([]);
      setActiveTab("GROUP");
      setInputMessage("");
      setSenderNameMap({});
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowContactDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSend = useCallback(() => {
    if (!inputMessage.trim() || !isConnected || !selectedContact) return;
    sendMessage(inputMessage.trim());
    setInputMessage("");
  }, [inputMessage, isConnected, selectedContact, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectContact = (c: Contact) => {
    setSelectedContact(c);
    setShowContactDropdown(false);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const list = tab === "INBOX" ? inboxContacts : groupContacts;
    setSelectedContact(list.length > 0 ? list[0] : null);
  };

  const dark = isDarkMode;
  const currentContacts = activeTab === "INBOX" ? inboxContacts : groupContacts;

  return (
    <div className="fixed bottom-28 right-6 z-[9998]">
      {isOpen && (
        <div
          className={`absolute bottom-20 right-0 w-80 rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-slide-up ${
            dark ? "bg-gray-800 border-gray-700" : "bg-white border-cyan-100"
          }`}
          style={{ height: "500px" }}
        >
          {/* Header */}
          <div className="shrink-0 bg-gradient-to-r from-cyan-400 to-cyan-500">
            <div className="flex items-center gap-2 px-3 pt-3 pb-2">
              {/* Dropdown selector */}
              <div className="flex-1 relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowContactDropdown((v) => !v)}
                  className="w-full flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-2.5 py-1.5 transition"
                >
                  {selectedContact ? (
                    <>
                      <img
                        src={selectedContact.avatar}
                        alt={selectedContact.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/default-avatar.png";
                        }}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <span className="text-white font-semibold text-sm truncate flex-1 text-left">
                        {selectedContact.name}
                      </span>
                      {selectedContact.isGroup && (
                        <span className="text-[9px] bg-white/25 text-white px-1.5 py-0.5 rounded-full shrink-0">
                          Nhóm
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-cyan-100 text-sm flex-1 text-left">
                      {isLoadingContacts
                        ? "Đang tải..."
                        : "Chọn cuộc trò chuyện"}
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className={`text-white shrink-0 transition-transform ${
                      showContactDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showContactDropdown && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                      dark
                        ? "bg-gray-800 border-gray-700"
                        : "bg-white border-cyan-100"
                    }`}
                  >
                    <div
                      className={`flex border-b ${
                        dark ? "border-gray-700" : "border-gray-100"
                      }`}
                    >
                      {(["GROUP", "INBOX"] as Tab[]).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => handleTabChange(tab)}
                          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition ${
                            activeTab === tab
                              ? "text-cyan-500 border-cyan-500"
                              : "border-transparent text-gray-400"
                          }`}
                        >
                          {tab === "GROUP" ? (
                            <>
                              <Users size={11} /> Nhóm
                            </>
                          ) : (
                            <>
                              <MessageCircle size={11} /> Bạn bè
                            </>
                          )}
                        </button>
                      ))}
                    </div>

                    <div
                      className={`max-h-52 overflow-y-auto ${
                        dark ? "scrollbar-dark" : "scrollbar-light"
                      }`}
                    >
                      {currentContacts.length === 0 ? (
                        <p className="text-xs text-center py-5 text-gray-400">
                          {isLoadingContacts
                            ? "Đang tải..."
                            : "Chưa có dữ liệu"}
                        </p>
                      ) : (
                        currentContacts.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectContact(c)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition ${
                              selectedContact?.id === c.id
                                ? dark
                                  ? "bg-gray-700"
                                  : "bg-cyan-50"
                                : dark
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="relative shrink-0">
                              <img
                                src={c.avatar}
                                alt={c.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = c.isGroup
                                    ? "/group-avatar.png"
                                    : "/default-avatar.png";
                                }}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              {c.isGroup && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-cyan-500 rounded-full flex items-center justify-center">
                                  <Users size={8} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-semibold truncate ${
                                  dark ? "text-gray-100" : "text-gray-800"
                                }`}
                              >
                                {c.name}
                              </p>
                              <p className="text-[10px] truncate text-gray-400">
                                {c.lastMessage || "Chưa có tin nhắn"}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedContact && currentUserId && (
                <button
                  onClick={() => setShowCall(true)}
                  title="Gọi thoại"
                  className="hover:bg-white/20 rounded-full p-1.5 transition-colors shrink-0"
                >
                  <Phone size={15} className="text-white" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors shrink-0"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            <div className="px-3 pb-2 flex items-center gap-1.5">
              {/* <div
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isConnected ? "bg-emerald-300" : "bg-gray-300"
                }`}
              /> */}
              {/* <span className="text-cyan-100 text-[10px]">
                {selectedContact
                  ? isConnected
                    ? "Đang kết nối"
                    : "Đang kết nối..."
                  : "Chọn cuộc trò chuyện"}
              </span> */}
            </div>
          </div>

          {/* Messages */}
          <div
            className={`flex-1 overflow-y-auto p-3 space-y-2 ${
              dark ? "bg-gray-900 scrollbar-dark" : "bg-gray-50 scrollbar-light"
            }`}
          >
            {isLoadingContacts || isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
              </div>
            ) : !selectedContact ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <MessageCircle
                  className={`w-8 h-8 ${
                    dark ? "text-gray-600" : "text-cyan-200"
                  }`}
                />
                <p className="text-xs text-gray-400">
                  Chọn cuộc trò chuyện để bắt đầu
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-200"
                />
                <p
                  className={`text-xs font-semibold ${
                    dark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {selectedContact.name}
                </p>
                <p className="text-[11px] text-gray-400">
                  Bắt đầu cuộc trò chuyện
                </p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = String(msg.senderId) === String(currentUserId);
                const displayName =
                  senderNameMap[msg.senderId] ?? msg.senderName ?? "";
                const showName =
                  selectedContact.isGroup && !isMe && displayName;

                return (
                  <div
                    key={`${msg.id}-${i}`}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <img
                        src={selectedContact.avatar}
                        className="w-6 h-6 rounded-full object-cover mr-1 self-end shrink-0"
                        alt=""
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/default-avatar.png";
                        }}
                      />
                    )}
                    {/* ✅ FIX: items-end khi isMe để card YouTube căn phải */}
                    <div
                      className={`flex flex-col gap-0.5 ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      {showName && (
                        <span className="text-[10px] font-semibold text-cyan-400 px-1">
                          {displayName}
                        </span>
                      )}
                      {/* ✅ FIX: w-fit để bubble không chiếm full width */}
                      <div
                        className={`w-fit max-w-[220px] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-br-sm"
                            : dark
                            ? "bg-gray-700 text-gray-100 rounded-bl-sm"
                            : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                        }`}
                      >
                        <MessageContent
                          text={msg.text}
                          isMe={isMe}
                          onNavigate={(path) => {
                            setIsOpen(false);
                            router.push(path);
                          }}
                        />
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isMe ? "text-cyan-100" : "text-gray-400"
                          }`}
                        >
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className={`px-3 py-2.5 border-t shrink-0 flex items-center gap-2 ${
              dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
            }`}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                selectedContact ? "Nhập tin nhắn..." : "Chọn cuộc trò chuyện..."
              }
              disabled={!isConnected || !selectedContact}
              className={`flex-1 text-xs px-3 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-cyan-400 transition disabled:opacity-50 ${
                dark
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400"
              }`}
            />
            <button
              onClick={handleSend}
              disabled={
                !inputMessage.trim() || !isConnected || !selectedContact
              }
              className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shrink-0 disabled:opacity-40 hover:scale-110 transition"
            >
              <Send size={13} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* CallModal */}
      {showCall && selectedContact && currentUserId && (
        <CallModal
          roomId={`call-${currentUserId}-${selectedContact.id}`}
          isCaller={true}
          currentUserId={currentUserId}
          receiverId={selectedContact.id}
          contactName={selectedContact.name}
          contactAvatar={selectedContact.avatar}
          callerName={currentUserName}
          callerAvatar={currentUserAvatar}
          isDarkMode={isDarkMode}
          onClose={() => setShowCall(false)}
        />
      )}

      {/* Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative transition-all duration-300 hover:scale-110"
        title="Chat Room"
      >
        <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 animate-ping" />
        <div className="relative w-16 h-16 drop-shadow-2xl">
          <img
            src="/message.png"
            alt="Chat Room"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
          <div className="bg-gray-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            Chat Room
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800" />
          </div>
        </div>
      </button>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.22s ease-out;
        }

        /* ✅ Scrollbar Dark Mode */
        .scrollbar-dark::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #111827;
          border-radius: 999px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 999px;
        }
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }

        /* ✅ Scrollbar Light Mode */
        .scrollbar-light::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-light::-webkit-scrollbar-track {
          background: #f0fdfe;
          border-radius: 999px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb {
          background: #a5f3fc;
          border-radius: 999px;
        }
        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: #06b6d4;
        }
      `}</style>
    </div>
  );
}
