"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, File } from "lucide-react";

// ── YouTube link detector & card renderer ──────────────────────────────────
const YT_REGEX =
  /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)|https?:\/\/youtu\.be\/([\w-]+)/g;

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}

function MessageContent({
  text,
  isDarkMode,
  isMe,
}: {
  text: string;
  isDarkMode: boolean;
  isMe: boolean;
}) {
  const router = useRouter();
  const ytMatches = Array.from(new Set(text.match(YT_REGEX) || []));

  if (ytMatches.length === 0) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    );
  }

  const plainText = text.replace(YT_REGEX, "").trim();

  return (
    <div className="space-y-2">
      {plainText && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
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
            onClick={() => router.push(`/video/${videoId}`)}
            className={`w-full text-left rounded-xl overflow-hidden border transition-all hover:scale-[1.02] hover:shadow-lg ${
              isMe
                ? "border-white/20 bg-white/10"
                : isDarkMode
                ? "border-gray-600 bg-gray-700"
                : "border-cyan-200 bg-cyan-50"
            }`}
          >
            <div className="relative">
              <img
                src={thumb}
                alt="video"
                className="w-full h-28 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div
              className={`px-3 py-2 text-xs font-medium truncate ${
                isMe
                  ? "text-white/90"
                  : isDarkMode
                  ? "text-gray-200"
                  : "text-cyan-800"
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

interface Message {
  id: string;
  text: string;
  senderId: string;
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

interface MessagesAreaProps {
  selectedContact: Contact;
  displayMessages: Message[];
  currentUserId: string | null;
  isDarkMode: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const normalizeId = (id: string | number | null | undefined): string =>
  String(id || "").trim();

export default function MessagesArea({
  selectedContact,
  displayMessages,
  currentUserId,
  isDarkMode,
  messagesEndRef,
}: MessagesAreaProps) {
  return (
    <div
      className={`flex-1 overflow-y-auto p-6 space-y-4 ${
        isDarkMode
          ? "bg-gradient-to-b from-gray-900/30 to-gray-800/30 custom-scrollbar-dark"
          : "bg-gradient-to-b from-cyan-50/30 to-blue-50/30 custom-scrollbar"
      }`}
    >
      {displayMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-cyan-500"
            }`}
          >
            Chưa có tin nhắn
          </p>
        </div>
      ) : (
        displayMessages.map((msg, index) => {
          const isMe = normalizeId(msg.senderId) === normalizeId(currentUserId);

          return (
            <div
              key={`${msg.id}-${index}`}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              style={{
                animation: `messageSlide 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              <div
                className={`flex items-end gap-2 max-w-[70%] ${
                  isMe ? "flex-row-reverse" : "flex-row"
                }`}
              >
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
                      : isDarkMode
                      ? "bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700"
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
                        <div
                          className={`flex items-center gap-2 p-2 rounded ${
                            isDarkMode ? "bg-gray-700" : "bg-cyan-50"
                          }`}
                        >
                          <File className="w-4 h-4" />
                          <span className="text-sm">{msg.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <MessageContent
                    text={msg.text}
                    isDarkMode={isDarkMode}
                    isMe={isMe}
                  />
                  <span
                    className={`text-xs mt-1 block ${
                      isMe
                        ? "text-cyan-100"
                        : isDarkMode
                        ? "text-gray-400"
                        : "text-cyan-600"
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
  );
}
