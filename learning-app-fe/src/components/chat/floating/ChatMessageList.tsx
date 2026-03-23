"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import SenderAvatar from "./SenderAvatar";
import MessageContent from "./MessageContent";
import UserProfileCard from "./UserProfileCard";

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName?: string;
    timestamp: Date;
}

interface Contact {
    id: string;
    userId?: string;
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
    isUserOnline?: (userId: string | undefined | null) => boolean;
}

interface ActiveProfile {
    userId: string;
    x: number;
    y: number;
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
    isUserOnline,
}: ChatMessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageCount = messages.length;
    const [activeProfile, setActiveProfile] = useState<ActiveProfile | null>(null);

    // Scroll to bottom whenever new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messageCount]);

    const handleAvatarClick = useCallback(
        (senderId: string, e: React.MouseEvent) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setActiveProfile({ userId: senderId, x: rect.right, y: rect.top });
        },
        []
    );

    return (
        <>
            <div
                className={`flex-1 overflow-y-auto p-4 space-y-2 ${dark ? "bg-[#0f172a] scrollbar-dark" : "bg-[#f8faff] scrollbar-light"
                    }`}
            >
                {isLoadingContacts || isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                    </div>
                ) : !selectedContact ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                        <div className={`p-5 rounded-3xl ${dark ? "bg-gray-800" : "bg-white shadow-xl shadow-cyan-500/5"}`}>
                            <MessageCircle
                                className={`w-10 h-10 ${dark ? "text-cyan-400" : "text-cyan-500"}`}
                            />
                        </div>
                        <p className={`text-sm font-semibold tracking-tight ${dark ? "text-gray-400" : "text-gray-400"}`}>
                            Chọn cuộc trò chuyện để bắt đầu
                        </p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-5 py-10 animate-in fade-in zoom-in duration-500">
                        <div className="relative group">
                            <img
                                src={selectedContact.avatar}
                                alt={selectedContact.name}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                                }}
                                className={`w-20 h-20 rounded-full object-cover ring-4 transition-all duration-500 group-hover:scale-105 ${dark ? "ring-cyan-500/20 shadow-2xl shadow-cyan-500/20" : "ring-white shadow-xl shadow-cyan-200/50"
                                    }`}
                            />
                            {!selectedContact.isGroup && isUserOnline?.(selectedContact.userId) && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-[#0f172a] rounded-full flex items-center justify-center">
                                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                </div>
                            )}
                        </div>
                        <div className="text-center px-6">
                            <p
                                className={`text-base font-bold mb-1.5 ${dark ? "text-white" : "text-gray-900"
                                    }`}
                            >
                                {selectedContact.name}
                            </p>
                            <p className={`text-xs font-medium ${dark ? "text-gray-500" : "text-gray-400"}`}>
                                Bắt đầu cuộc trò chuyện với {selectedContact.name} ngay nào!
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = String(msg.senderId) === String(currentUserId);

                        // Check if previous message was from the same sender (for grouping)
                        const prevMsg = i > 0 ? messages[i - 1] : null;
                        const isSameSender = prevMsg && String(prevMsg.senderId) === String(msg.senderId);

                        // Check if next message is from the same sender (to hide avatar/name)
                        const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;
                        const isNextSameSender = nextMsg && String(nextMsg.senderId) === String(msg.senderId);

                        const displayName = senderNameMap[msg.senderId] ?? msg.senderName ?? "";
                        const showName = selectedContact.isGroup && !isMe && displayName && !isSameSender;

                        const memberAvatar = selectedContact.isGroup
                            ? senderAvatarMap[msg.senderId] ?? ""
                            : selectedContact.avatar;

                        const timeString = (() => {
                            const now = new Date();
                            const isToday = msg.timestamp.toDateString() === now.toDateString();
                            return msg.timestamp.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                ...(isToday ? {} : { month: "2-digit", day: "2-digit" })
                            });
                        })();

                        return (
                            <div
                                key={`${msg.id}-${i}`}
                                className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} ${isSameSender ? "mt-[-4px]" : "mt-2"}`}
                            >
                                {/* Avatar: only show for the last message in a group forTHERS */}
                                {!isMe && (
                                    <div className="shrink-0 w-8 h-8 relative">
                                        {!isNextSameSender ? (
                                            <>
                                                <SenderAvatar
                                                    avatar={memberAvatar}
                                                    name={displayName || selectedContact.name}
                                                    isDarkMode={dark}
                                                    size="md"
                                                    onClick={
                                                        selectedContact.isGroup
                                                            ? (e) => handleAvatarClick(msg.senderId, e)
                                                            : undefined
                                                    }
                                                />
                                                {!selectedContact.isGroup && isUserOnline?.(selectedContact.userId) && (
                                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f172a] shadow-sm z-10" />
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-8" /> /* Spacer for alignment */
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}
                                >
                                    {showName && (
                                        <span className={`text-[10px] font-bold px-2 mb-0.5 ${dark ? "text-cyan-400" : "text-cyan-600"}`}>
                                            {displayName}
                                        </span>
                                    )}

                                    <div className="group/bubble relative">
                                        <div
                                            className={`px-3 py-2 rounded-2xl text-[12px] leading-relaxed shadow-sm transition-all duration-200 ${isMe
                                                ? `bg-gradient-to-br from-cyan-500 to-cyan-600 text-white ${!isSameSender && !isNextSameSender ? "rounded-br-sm" :
                                                    !isSameSender && isNextSameSender ? "rounded-br-md" :
                                                        isSameSender && isNextSameSender ? "rounded-tr-md rounded-br-md" :
                                                            "rounded-tr-md rounded-br-sm"
                                                }`
                                                : dark
                                                    ? `bg-[#1e293b] text-white border border-gray-700/50 ${!isSameSender && !isNextSameSender ? "rounded-bl-sm" :
                                                        !isSameSender && isNextSameSender ? "rounded-bl-md" :
                                                            isSameSender && isNextSameSender ? "rounded-tl-md rounded-bl-md" :
                                                                "rounded-tl-md rounded-bl-sm"
                                                    }`
                                                    : `bg-white text-gray-800 border border-gray-100 ${!isSameSender && !isNextSameSender ? "rounded-bl-sm" :
                                                        !isSameSender && isNextSameSender ? "rounded-bl-md" :
                                                            isSameSender && isNextSameSender ? "rounded-tl-md rounded-bl-md" :
                                                                "rounded-tl-md rounded-bl-sm"
                                                    }`
                                                } ${isMe ? "hover:shadow-cyan-500/20" : "hover:shadow-md"}`}
                                        >
                                            <MessageContent
                                                text={msg.text}
                                                isMe={isMe}
                                                isDarkMode={dark}
                                                onNavigate={onNavigate}
                                            />

                                            {/* Minimal timestamp inside bubble if it's the last in group or hover */}
                                            <div
                                                className={`text-[9px] mt-1 font-medium flex items-center justify-end opacity-60 ${isMe ? "text-white" : "text-gray-400"}`}
                                            >
                                                {timeString}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── User Profile Card Popup ──────────────────────────────── */}
            {activeProfile && (
                <UserProfileCard
                    userId={activeProfile.userId}
                    anchorX={activeProfile.x}
                    anchorY={activeProfile.y}
                    isDarkMode={dark}
                    onClose={() => setActiveProfile(null)}
                />
            )}
        </>
    );
}
