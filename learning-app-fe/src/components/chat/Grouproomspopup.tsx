"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Users, Plus, Loader2, Hash } from "lucide-react";
import { roomService } from "@/services/roomService";
import { ChatRoomResponse } from "@/types/chat";

interface GroupRoomsPopupProps {
  isDarkMode: boolean;
  onClose: () => void;
  onSelectRoom?: (room: ChatRoomResponse) => void;
}

export default function GroupRoomsPopup({
  isDarkMode,
  onClose,
  onSelectRoom,
}: GroupRoomsPopupProps) {
  const [rooms, setRooms] = useState<ChatRoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    roomService
      .getMyGroupRooms()
      .then((data) => setRooms(data))
      .catch(() => setError("Không thể tải danh sách nhóm"))
      .finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={popupRef}
      className={`
        w-72 rounded-2xl shadow-2xl border overflow-hidden
        transition-all duration-200 animate-in fade-in slide-in-from-top-2
        ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-100"
            : "bg-white border-cyan-200 text-gray-900"
        }
      `}
      // ❌ REMOVED: style={{ top: "100%", left: 0, marginTop: 8 }}
      // ✅ Vị trí hoàn toàn do wrapper trong ChatHeader kiểm soát
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isDarkMode ? "border-gray-700" : "border-cyan-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              isDarkMode
                ? "bg-cyan-500/20"
                : "bg-gradient-to-br from-cyan-100 to-blue-100"
            }`}
          >
            <Users
              className={`w-4 h-4 ${
                isDarkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
          </div>
          <span className="font-semibold text-sm">Nhóm của tôi</span>
        </div>
        <button
          onClick={onClose}
          className={`p-1 rounded-full transition-colors ${
            isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-50"
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-72 overflow-y-auto custom-scrollbar">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2
              className={`w-6 h-6 animate-spin ${
                isDarkMode ? "text-cyan-400" : "text-cyan-500"
              }`}
            />
          </div>
        )}

        {error && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && rooms.length === 0 && (
          <div className="px-4 py-8 text-center space-y-2">
            <div
              className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                isDarkMode ? "bg-gray-700" : "bg-cyan-50"
              }`}
            >
              <Hash
                className={`w-6 h-6 ${
                  isDarkMode ? "text-gray-500" : "text-cyan-300"
                }`}
              />
            </div>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-cyan-400"
              }`}
            >
              Chưa có nhóm nào
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                onSelectRoom?.(room);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                isDarkMode ? "hover:bg-gray-700/60" : "hover:bg-cyan-50"
              }`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow bg-gradient-to-br from-cyan-500 to-blue-600">
                {room.name ? (
                  room.name.charAt(0).toUpperCase()
                ) : (
                  <Users className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {room.name || "Nhóm không tên"}
                </p>
                <p
                  className={`text-xs truncate ${
                    isDarkMode ? "text-gray-400" : "text-cyan-500"
                  }`}
                >
                  {room.memberIds?.length
                    ? `${room.memberIds.length} thành viên`
                    : "Nhóm chat"}
                </p>
              </div>
            </button>
          ))}
      </div>

      {/* Footer */}
      <div
        className={`border-t px-4 py-2.5 ${
          isDarkMode ? "border-gray-700" : "border-cyan-100"
        }`}
      >
        <button
          className={`w-full flex items-center gap-2 text-sm font-medium py-1.5 px-2 rounded-lg transition-colors ${
            isDarkMode
              ? "text-cyan-400 hover:bg-gray-700"
              : "text-cyan-600 hover:bg-cyan-50"
          }`}
        >
          <Plus className="w-4 h-4" />
          Tạo nhóm mới
        </button>
      </div>
    </div>
  );
}
