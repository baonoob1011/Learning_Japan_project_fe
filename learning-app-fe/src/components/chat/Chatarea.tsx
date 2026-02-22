"use client";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  File,
  X,
  PlayCircle,
} from "lucide-react";

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

  // Plain text = tất cả trừ các link YT
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

interface AttachmentPreview {
  file: File;
  preview: string;
  type: "image" | "file";
}

interface ChatAreaProps {
  selectedContact: Contact | null;
  displayMessages: Message[];
  currentUserId: string | null;
  message: string;
  isConnected: boolean;
  isDarkMode: boolean;
  showEmojiPicker: boolean;
  attachmentPreview: AttachmentPreview | null;
  emojis: string[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onEmojiClick: (emoji: string) => void;
  onToggleEmojiPicker: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAttachment: () => void;
}

const normalizeId = (id: string | number | null | undefined): string =>
  String(id || "").trim();

export default function ChatArea({
  selectedContact,
  displayMessages,
  currentUserId,
  message,
  isConnected,
  isDarkMode,
  showEmojiPicker,
  attachmentPreview,
  emojis,
  messagesEndRef,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onEmojiClick,
  onToggleEmojiPicker,
  onFileSelect,
  onClearAttachment,
}: ChatAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!selectedContact) {
    return (
      <div
        className={`flex-1 flex items-center justify-center ${
          isDarkMode ? "bg-gray-900/40" : "bg-white/40"
        }`}
      >
        <div className="text-center space-y-4">
          <div
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-xl ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-700 to-gray-800"
                : "bg-gradient-to-br from-cyan-100 to-blue-100"
            }`}
          >
            <Send
              className={`w-12 h-12 ${
                isDarkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
          </div>
          <h3
            className={`text-2xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-cyan-900"
            }`}
          >
            Chọn một cuộc trò chuyện
          </h3>
          <p
            className={`max-w-md ${
              isDarkMode ? "text-gray-400" : "text-cyan-600"
            }`}
          >
            Chọn một liên hệ từ danh sách để bắt đầu chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col ${
        isDarkMode ? "bg-gray-900/40" : "bg-white/40"
      }`}
    >
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFileSelect}
      />

      {/* Chat Header */}
      <div
        className={`p-4 border-b shadow-sm transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-800/90 border-gray-700"
            : "bg-white/90 border-cyan-200/60"
        }`}
      >
        <div className="flex items-center justify-between">
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
          <div className="flex items-center gap-2">
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

      {/* Messages Area */}
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
            const isMe =
              normalizeId(msg.senderId) === normalizeId(currentUserId);

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
                            <span className="text-sm">
                              {msg.attachment.name}
                            </span>
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

      {/* Input Area */}
      <div
        className={`p-4 border-t shadow-lg transition-colors duration-300 relative ${
          isDarkMode
            ? "bg-gray-800/95 border-gray-700"
            : "bg-white/95 border-cyan-200/60"
        }`}
      >
        {/* Attachment Preview */}
        {attachmentPreview && (
          <div className="mb-3 relative">
            <div
              className={`flex items-center gap-3 p-3 rounded-lg ${
                isDarkMode ? "bg-gray-700" : "bg-cyan-50"
              }`}
            >
              {attachmentPreview.type === "image" ? (
                <img
                  src={attachmentPreview.preview}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <File
                    className={`w-8 h-8 ${
                      isDarkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-200" : "text-cyan-900"
                    }`}
                  >
                    {attachmentPreview.file.name}
                  </span>
                </div>
              )}
              <button
                onClick={onClearAttachment}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            className={`absolute bottom-20 left-4 rounded-xl shadow-2xl border p-4 max-h-64 overflow-y-auto w-80 z-50 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-cyan-200"
            }`}
          >
            <div className="grid grid-cols-8 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => onEmojiClick(emoji)}
                  className={`text-2xl rounded p-1 transition-colors ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Row */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleEmojiPicker}
            className={`p-2.5 rounded-full transition-all hover:scale-110 ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-100"
            }`}
          >
            <Smile
              className={`w-5 h-5 ${
                isDarkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
          </button>
          <button
            onClick={() => imageInputRef.current?.click()}
            className={`p-2.5 rounded-full transition-all hover:scale-110 ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-100"
            }`}
          >
            <ImageIcon
              className={`w-5 h-5 ${
                isDarkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-full transition-all hover:scale-110 ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-100"
            }`}
          >
            <Paperclip
              className={`w-5 h-5 ${
                isDarkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
          </button>
          <input
            type="text"
            placeholder={
              isConnected ? "Nhập tin nhắn..." : "Đang kết nối đến chat..."
            }
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={!isConnected}
            className={`flex-1 px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
                : "bg-cyan-50/50 border-cyan-200/60 text-gray-900 placeholder-cyan-400 focus:ring-cyan-500/40 focus:border-cyan-500/40"
            }`}
          />
          <button
            onClick={onSendMessage}
            disabled={(!message.trim() && !attachmentPreview) || !isConnected}
            className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
