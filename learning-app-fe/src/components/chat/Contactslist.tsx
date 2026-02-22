"use client";
import React from "react";
import { MoreVertical, Search, MessageCircle } from "lucide-react";
import LoadingCat from "@/components/LoadingCat";

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  online: boolean;
  unread?: number;
  timestamp: string;
}

interface ContactsListProps {
  contacts: Contact[];
  displayedContacts: Contact[];
  selectedContact: Contact | null;
  isLoadingContacts: boolean;
  isSearching: boolean;
  isConnected: boolean;
  searchQuery: string;
  isDarkMode: boolean;
  onSearchChange: (query: string) => void;
  onSelectContact: (contact: Contact) => void;
}

export default function ContactsList({
  displayedContacts,
  selectedContact,
  isLoadingContacts,
  isSearching,
  isConnected,
  searchQuery,
  isDarkMode,
  onSearchChange,
  onSelectContact,
}: ContactsListProps) {
  return (
    <div
      className={`w-[380px] border-r flex flex-col shadow-xl transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white/90 border-cyan-200/60"
      }`}
    >
      {/* Header */}
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

        {/* Search */}
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
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                : "bg-cyan-50/50 border-cyan-200/60 text-gray-900 placeholder-cyan-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
            }`}
          />
        </div>
      </div>

      {/* Tabs */}
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

      {/* Contact List */}
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
                ? "Không tìm thấy cuộc trò chuyện"
                : "Chưa có liên hệ"}
            </p>
          </div>
        ) : (
          displayedContacts.map((contact, index) => (
            <div
              key={`${contact.id}-${index}`}
              onClick={() => onSelectContact(contact)}
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
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
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
                        className={`text-xs ml-2 shrink-0 ${
                          isDarkMode ? "text-gray-400" : "text-cyan-600"
                        }`}
                      >
                        {new Date(contact.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                  <div className="shrink-0 w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {contact.unread}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
