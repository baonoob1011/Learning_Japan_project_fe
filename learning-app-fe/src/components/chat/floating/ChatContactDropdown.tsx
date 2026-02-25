"use client";
import { useRef, useEffect } from "react";
import { ChevronDown, Users, MessageCircle, Phone, X } from "lucide-react";

interface Contact {
    id: string;
    userId?: string;
    name: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    isGroup?: boolean;
}

type Tab = "GROUP" | "INBOX";

interface ChatContactDropdownProps {
    isDarkMode: boolean;
    selectedContact: Contact | null;
    showContactDropdown: boolean;
    setShowContactDropdown: (v: boolean | ((prev: boolean) => boolean)) => void;
    currentContacts: Contact[];
    activeTab: Tab;
    isLoadingContacts: boolean;
    onSelectContact: (c: Contact) => void;
    onTabChange: (tab: Tab) => void;
    onCall: () => void;
    onClose: () => void;
    showCallButton: boolean;
    unreadCounts?: Record<string, number>;
}

export default function ChatContactDropdown({
    isDarkMode: dark,
    selectedContact,
    showContactDropdown,
    setShowContactDropdown,
    currentContacts,
    activeTab,
    isLoadingContacts,
    onSelectContact,
    onTabChange,
    onCall,
    onClose,
    showCallButton,
    unreadCounts = {},
}: ChatContactDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowContactDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [setShowContactDropdown]);

    return (
        <div className="shrink-0 bg-gradient-to-r from-cyan-400 to-cyan-500">
            <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                {/* Contact selector */}
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
                                        (e.target as HTMLImageElement).src = "/default-avatar.png";
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
                                {isLoadingContacts ? "Đang tải..." : "Chọn cuộc trò chuyện"}
                            </span>
                        )}
                        <ChevronDown
                            size={14}
                            className={`text-white shrink-0 transition-transform ${showContactDropdown ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {/* Dropdown panel */}
                    {showContactDropdown && (
                        <div
                            className={`absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border overflow-hidden z-50 ${dark
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-cyan-100"
                                }`}
                        >
                            {/* Tabs */}
                            <div
                                className={`flex border-b ${dark ? "border-gray-700" : "border-gray-100"
                                    }`}
                            >
                                {(["GROUP", "INBOX"] as Tab[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => onTabChange(tab)}
                                        className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1 border-b-2 transition ${activeTab === tab
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

                            {/* Contact list */}
                            <div
                                className={`max-h-52 overflow-y-auto ${dark ? "scrollbar-dark" : "scrollbar-light"
                                    }`}
                            >
                                {currentContacts.length === 0 ? (
                                    <p className="text-xs text-center py-5 text-gray-400">
                                        {isLoadingContacts ? "Đang tải..." : "Chưa có dữ liệu"}
                                    </p>
                                ) : (
                                    currentContacts.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => onSelectContact(c)}
                                            className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition ${selectedContact?.id === c.id
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
                                                {/* Unread badge */}
                                                {(unreadCounts[c.id] ?? 0) > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-md animate-pulse">
                                                        {(unreadCounts[c.id] ?? 0) > 99 ? "99+" : unreadCounts[c.id]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-xs font-semibold truncate ${dark ? "text-gray-100" : "text-gray-800"
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

                {/* Call button */}
                {showCallButton && (
                    <button
                        onClick={onCall}
                        title="Gọi thoại"
                        className="hover:bg-white/20 rounded-full p-1.5 transition-colors shrink-0"
                    >
                        <Phone size={15} className="text-white" />
                    </button>
                )}

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="hover:bg-white/20 rounded-full p-1 transition-colors shrink-0"
                >
                    <X size={16} className="text-white" />
                </button>
            </div>
            <div className="px-3 pb-2 flex items-center gap-1.5" />
        </div>
    );
}
