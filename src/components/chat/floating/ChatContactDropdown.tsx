"use client";
import { useRef, useEffect } from "react";
import { ChevronDown, Users, MessageCircle, Phone, X, Plus, UserPlus, Video, Trash2 } from "lucide-react";

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
    onVideoCall: () => void;
    onVoiceCall: () => void;
    onClose: () => void;
    onAddMember?: () => void;
    onCreateGroup?: () => void;
    showCallButton: boolean;
    unreadCounts?: Record<string, number>;
    isUserOnline?: (userId: string | undefined | null) => boolean;
    onUnfriend?: (c: Contact) => void;
    currentUserAvatar?: string;
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
    onVideoCall,
    onVoiceCall,
    onClose,
    onAddMember,
    onCreateGroup,
    showCallButton,
    unreadCounts = {},
    isUserOnline,
    onUnfriend,
    currentUserAvatar,
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
        <div className={`shrink-0 bg-gradient-to-r shadow-lg ${dark ? "from-gray-900 via-gray-800 to-gray-900 border-b border-white/5" : "from-cyan-500 via-cyan-400 to-blue-500"
            }`}>
            <div className="flex items-center gap-2 px-4 pt-4 pb-3">
                {/* Contact selector */}
                <div className="flex-1 relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowContactDropdown((v) => !v)}
                        className={`w-full flex items-center gap-2.5 rounded-2xl px-3 py-2 transition-all duration-300 ${dark ? "bg-white/5 hover:bg-white/10 text-white ring-1 ring-white/10" : "bg-white/10 hover:bg-white/20 text-white shadow-inner"}`}
                    >
                        {selectedContact ? (
                            <>
                                <div className="relative shrink-0">
                                    <img
                                        src={selectedContact.avatar}
                                        alt={selectedContact.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "/default-avatar.png";
                                        }}
                                        className="w-7 h-7 rounded-full object-cover ring-2 ring-white/30 shadow-md"
                                    />
                                    {!selectedContact.isGroup && isUserOnline?.(selectedContact.userId) && (
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 shadow-lg z-[60]">
                                            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-white font-bold text-xs truncate">
                                            {selectedContact.name}
                                        </span>
                                        {selectedContact.isGroup && (
                                            <span className="text-[7px] font-black bg-white/30 text-white px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                                GROUP
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-[9px] font-medium truncate ${dark ? "text-cyan-400/80" : "text-cyan-100/90"}`}>
                                        {selectedContact.isGroup ? "Nhóm cộng đồng" : (isUserOnline?.(selectedContact.userId) ? "Đang trực tuyến" : "Ngoại tuyến")}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <span className={`${dark ? "text-gray-400" : "text-cyan-100"} text-xs flex-1 text-left font-semibold`}>
                                {isLoadingContacts ? "Đang tải dữ liệu..." : "Chọn cuộc trò chuyện"}
                            </span>
                        )}
                        <ChevronDown
                            size={14}
                            className={`${dark ? "text-cyan-400" : "text-white/80"} shrink-0 transition-transform duration-500 ${showContactDropdown ? "rotate-180" : ""
                                }`}
                        />
                    </button>

                    {/* Dropdown panel */}
                    {showContactDropdown && (
                        <div
                            className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden z-50 animate-slide-up ${dark
                                ? "bg-gray-900 border-gray-700 shadow-cyan-500/5"
                                : "bg-white border-cyan-100"
                                }`}
                        >
                            {/* Tabs */}
                            <div
                                className={`flex border-b ${dark ? "border-gray-800" : "border-gray-100"
                                    }`}
                            >
                                {(["GROUP", "INBOX"] as Tab[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => onTabChange(tab)}
                                        className={`flex-1 py-2.5 text-[10px] font-semibold flex items-center justify-center gap-1 border-b-2 transition ${activeTab === tab
                                            ? "text-cyan-400 border-cyan-400"
                                            : `border-transparent ${dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`
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
                                    <div className="flex flex-col items-center justify-center py-8 px-4 opacity-50">
                                        <MessageCircle size={24} className={dark ? "text-gray-600" : "text-gray-300"} />
                                        <p className="text-[10px] mt-2 text-center text-gray-500">
                                            {isLoadingContacts ? "Đang tải..." : "Chưa có cuộc trò chuyện nào"}
                                        </p>
                                    </div>
                                ) : (
                                    currentContacts.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => onSelectContact(c)}
                                            className={`group flex items-center gap-3 px-3 py-3 cursor-pointer transition-all ${selectedContact?.id === c.id
                                                ? dark
                                                    ? "bg-cyan-500/10 border-r-2 border-cyan-500"
                                                    : "bg-cyan-50 border-r-2 border-cyan-500"
                                                : dark
                                                    ? "hover:bg-gray-800"
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
                                                    className={`w-9 h-9 rounded-full object-cover ring-2 ${selectedContact?.id === c.id ? "ring-cyan-500" : "ring-transparent"}`}
                                                />
                                                {/* Online Status Dot */}
                                                {!c.isGroup && isUserOnline?.(c.userId) && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 shadow-sm flex items-center justify-center">
                                                        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse opacity-75" />
                                                    </div>
                                                )}
                                                {c.isGroup && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
                                                        <Users size={8} className="text-white" />
                                                    </div>
                                                )}
                                                {/* Unread badge */}
                                                {(unreadCounts[c.id] ?? 0) > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg ring-2 ring-white dark:ring-gray-900 animate-pulse">
                                                        {(unreadCounts[c.id] ?? 0) > 99 ? "99+" : unreadCounts[c.id]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p
                                                        className={`text-xs font-bold truncate ${dark ? "text-gray-100" : "text-gray-800"
                                                            }`}
                                                    >
                                                        {c.name}
                                                    </p>
                                                    <span className="text-[9px] text-gray-500 shrink-0">
                                                        {c.timestamp ? new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                </div>
                                                <p className={`text-[10px] truncate ${dark ? "text-gray-500" : "text-gray-400"}`}>
                                                    {c.lastMessage || "Nói điều gì đó..."}
                                                </p>
                                            </div>

                                            {/* Unfriend button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUnfriend?.(c);
                                                }}
                                                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-full transition-all hover:bg-red-500/10 text-gray-400 hover:text-red-500`}
                                                title="Xóa cuộc trò chuyện"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Group Actions */}
                {selectedContact?.isGroup && selectedContact?.name !== "Cộng đồng" ? (
                    <button
                        onClick={onAddMember}
                        title="Thêm thành viên"
                        className="hover:bg-white/20 rounded-full p-1.5 transition-colors shrink-0"
                    >
                        <UserPlus size={15} className="text-white" />
                    </button>
                ) : (
                    <button
                        onClick={onCreateGroup}
                        title="Tạo nhóm/Mời vào nhóm"
                        className="hover:bg-white/20 rounded-full p-1.5 transition-colors shrink-0"
                    >
                        <Plus size={16} className="text-white" />
                    </button>
                )}

                {/* Actions group */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* Call buttons */}
                    {showCallButton && (
                        <>
                            <button
                                onClick={onVideoCall}
                                title="Gọi Video"
                                className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                            >
                                <Video size={13} className="text-white" />
                            </button>
                            <button
                                onClick={onVoiceCall}
                                title="Gọi thoại"
                                className="hover:bg-white/20 rounded-full p-1.5 transition-colors"
                            >
                                <Phone size={13} className="text-white" />
                            </button>
                        </>
                    )}



                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="hover:bg-white/20 rounded-full p-1.5 transition-colors ml-0.5"
                    >
                        <X size={15} className="text-white" />
                    </button>
                </div>
            </div>
            <div className={`px-3 pb-2 flex items-center gap-1.5 ${dark ? "h-1" : ""}`} />
        </div>
    );
}
