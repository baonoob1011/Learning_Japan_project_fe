"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Send, Search, Check } from "lucide-react";
import { roomService, ChatUserResponse } from "@/services/roomService";

interface ShareVideoModalProps {
  videoId: string;
  videoTitle: string;
  isDarkMode?: boolean;
  onClose: () => void;
}

export default function ShareVideoModal({
  videoId,
  videoTitle,
  isDarkMode = false,
  onClose,
}: ShareVideoModalProps) {
  const router = useRouter();
  const [users, setUsers] = useState<ChatUserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return q
      ? users.filter((u) => u.fullName.toLowerCase().includes(q))
      : users;
  }, [searchQuery, users]);

  useEffect(() => {
    roomService
      .getMyChatUsers()
      .then((data) => setUsers(data))
      .catch(() => setUsers([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const toggleSelect = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const handleSend = async () => {
    if (selected.size === 0 || sending) return;
    setSending(true);

    const shareMsg = encodeURIComponent(`🎬 ${videoTitle}\n${videoUrl}`);
    const selectedIds = Array.from(selected);

    try {
      const firstRoom = await roomService.createPrivateRoom({
        targetUserId: selectedIds[0],
      });

      if (selectedIds.length > 1) {
        await Promise.allSettled(
          selectedIds
            .slice(1)
            .map((userId) =>
              roomService
                .createPrivateRoom({ targetUserId: userId })
                .catch(() => {})
            )
        );
      }

      setSentTo(new Set(selectedIds));
      setSending(false);
      onClose();

      router.push(`/chat?roomId=${firstRoom.id}&shareMsg=${shareMsg}`);
    } catch {
      setSending(false);
    }
  };

  const allSent = sentTo.size > 0 && sentTo.size === selected.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={`w-[520px] rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300 ${
          isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-5 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <h3
            className={`font-semibold text-base ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Chia sẻ video
          </h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <X
              className={`w-4 h-4 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </button>
        </div>

        {/* Video preview */}
        <div
          className={`mx-5 mt-5 px-4 py-3 rounded-xl flex items-center gap-3 ${
            isDarkMode ? "bg-gray-700/60" : "bg-gray-50 border border-gray-200"
          }`}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
            alt="thumb"
            className="w-14 h-10 rounded object-cover shrink-0"
          />
          <p
            className={`text-xs font-medium truncate ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {videoTitle || videoUrl}
          </p>
        </div>

        {/* Search */}
        <div className="px-5 mt-4">
          <div
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-gray-50 border-gray-200 text-gray-800"
            }`}
          >
            <Search
              className={`w-3.5 h-3.5 shrink-0 ${
                isDarkMode ? "text-gray-400" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Tìm người..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full placeholder-gray-400 text-sm"
            />
          </div>
        </div>

        {/* User list */}
        <div className="px-3 mt-3 max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p
              className={`text-center text-xs py-10 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Không tìm thấy người dùng
            </p>
          ) : (
            filtered.map((user) => {
              const isSelected = selected.has(user.userId);
              const isSent = sentTo.has(user.userId);
              return (
                <button
                  key={user.userId}
                  onClick={() => toggleSelect(user.userId)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                    isSelected
                      ? isDarkMode
                        ? "bg-cyan-900/30"
                        : "bg-cyan-50"
                      : isDarkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <span
                    className={`flex-1 text-sm font-medium truncate ${
                      isDarkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {user.fullName}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSent
                        ? "bg-emerald-500 border-emerald-500"
                        : isSelected
                        ? "bg-cyan-500 border-cyan-500"
                        : isDarkMode
                        ? "border-gray-500"
                        : "border-gray-300"
                    }`}
                  >
                    {(isSelected || isSent) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-5 mt-2 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-100"
          }`}
        >
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending || allSent}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              allSent
                ? "bg-emerald-500 text-white"
                : selected.size === 0
                ? isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg"
            }`}
          >
            {allSent ? (
              <>
                <Check className="w-4 h-4" /> Đã gửi!
              </>
            ) : sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Gửi
                {selected.size > 0 ? ` (${selected.size})` : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
