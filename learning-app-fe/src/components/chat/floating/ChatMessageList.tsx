"use client";
import { useRef, useEffect } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import SenderAvatar from "./SenderAvatar";
import MessageContent from "./MessageContent";

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName?: string;
    timestamp: Date;
}

interface Contact {
    id: string;
    name: string;
    avatar: string;
    isGroup?: boolean;
}

interface ChatMessageListProps {
    isDarkMode: boolean;
    messages: Message[];
    currentUserId: string | number | null;
    selectedContact: Contact | null;
    isLoadingContacts: boolean;
    isLoadingMessages: boolean;
    senderNameMap: Record<string, string>;
    senderAvatarMap: Record<string, string>;
    onNavigate: (path: string) => void;
}

export default function ChatMessageList({
    isDarkMode: dark,
    messages,
    currentUserId,
    selectedContact,
    isLoadingContacts,
    isLoadingMessages,
    senderNameMap,
    senderAvatarMap,
    onNavigate,
}: ChatMessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageCount = messages.length;

    // Scroll to bottom whenever new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageCount]);

    return (
        <div
            className={`flex-1 overflow-y-auto p-3 space-y-2 ${dark ? "bg-gray-900 scrollbar-dark" : "bg-gray-50 scrollbar-light"
                }`}
        >
            {isLoadingContacts || isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
                </div>
            ) : !selectedContact ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                    <MessageCircle
                        className={`w-8 h-8 ${dark ? "text-gray-600" : "text-cyan-200"}`}
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
                        className={`text-xs font-semibold ${dark ? "text-gray-300" : "text-gray-600"
                            }`}
                    >
                        {selectedContact.name}
                    </p>
                    <p className="text-[11px] text-gray-400">Bắt đầu cuộc trò chuyện</p>
                </div>
            ) : (
                messages.map((msg, i) => {
                    const isMe = String(msg.senderId) === String(currentUserId);
                    const displayName =
                        senderNameMap[msg.senderId] ?? msg.senderName ?? "";
                    const showName = selectedContact.isGroup && !isMe && displayName;

                    const memberAvatar = selectedContact.isGroup
                        ? senderAvatarMap[msg.senderId] ?? ""
                        : selectedContact.avatar;

                    return (
                        <div
                            key={`${msg.id}-${i}`}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            {!isMe && (
                                <div className="mr-1.5 self-end shrink-0">
                                    <SenderAvatar
                                        avatar={memberAvatar}
                                        name={displayName || selectedContact.name}
                                        size="sm"
                                    />
                                </div>
                            )}

                            <div
                                className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"
                                    }`}
                            >
                                {showName && (
                                    <span className="text-[10px] font-semibold text-cyan-400 px-1">
                                        {displayName}
                                    </span>
                                )}
                                <div
                                    className={`w-fit max-w-[210px] px-3 py-2 rounded-2xl text-xs leading-relaxed shadow-sm ${isMe
                                            ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-br-sm"
                                            : dark
                                                ? "bg-gray-700 text-gray-100 rounded-bl-sm"
                                                : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                                        }`}
                                >
                                    <MessageContent
                                        text={msg.text}
                                        isMe={isMe}
                                        onNavigate={onNavigate}
                                    />
                                    <div
                                        className={`text-[10px] mt-0.5 ${isMe ? "text-cyan-100" : "text-gray-400"
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
    );
}
