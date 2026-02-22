"use client";
import React, { useState } from "react";
import { MoreVertical, Phone, Video, Plus } from "lucide-react";
import GroupRoomsPopup from "@/components/chat/Grouproomspopup";
import { ChatRoomResponse } from "@/types/chat";

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  online: boolean;
  unread?: number;
  timestamp: string;
}

interface ChatHeaderProps {
  selectedContact: Contact;
  isDarkMode: boolean;
  onSelectRoom?: (room: ChatRoomResponse) => void;
}

export default function ChatHeader({
  selectedContact,
  isDarkMode,
  onSelectRoom,
}: ChatHeaderProps) {
  const [showGroupPopup, setShowGroupPopup] = useState(false);

  return (
    <div
      className={`p-4 border-b shadow-sm transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-800/90 border-gray-700"
          : "bg-white/90 border-cyan-200/60"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Left: avatar + name */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedContact.avatar}
              alt={selectedContact.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-cyan-200 shadow-md"
            />
            {selectedContact.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
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
              {selectedContact.online ? "Đang hoạt động" : "Ngoại tuyến"}
            </p>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2">
          {/* + button with popup — popup mở sang TRÁI */}
          <div className="relative">
            <button
              onClick={() => setShowGroupPopup((prev) => !prev)}
              className={`p-2.5 rounded-full transition-all hover:scale-110 ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-50"
              } ${
                showGroupPopup
                  ? isDarkMode
                    ? "bg-gray-700 text-cyan-300"
                    : "bg-cyan-50 text-cyan-700"
                  : isDarkMode
                  ? "text-cyan-400"
                  : "text-cyan-600"
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>

            {showGroupPopup && (
              <div className="absolute top-full mt-2 right-0 z-50">
                <GroupRoomsPopup
                  isDarkMode={isDarkMode}
                  onClose={() => setShowGroupPopup(false)}
                  onSelectRoom={(room) => {
                    onSelectRoom?.(room);
                    setShowGroupPopup(false);
                  }}
                />
              </div>
            )}
          </div>

          <button
            className={`p-2.5 rounded-full transition-all hover:scale-110 ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-50"
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
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"
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
    </div>
  );
}
