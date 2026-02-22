"use client";
import React from "react";
import { Send } from "lucide-react";
import ChatHeader from "./message/Chatheader";
import MessagesArea from "./message/Messagesarea";
import MessageInput from "./message/Messageinput";
import { ChatMessageResponse } from "@/services/roomService";

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
  currentUserId: string | null;
  message: string;
  isConnected: boolean;
  isDarkMode: boolean;
  showEmojiPicker: boolean;
  attachmentPreview: AttachmentPreview | null;
  emojis: string[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  // Tin nhắn realtime từ socket
  incomingMessages?: ChatMessageResponse[];
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onEmojiClick: (emoji: string) => void;
  onToggleEmojiPicker: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAttachment: () => void;
}

export default function ChatArea({
  selectedContact,
  currentUserId,
  message,
  isConnected,
  isDarkMode,
  showEmojiPicker,
  attachmentPreview,
  emojis,
  messagesEndRef,
  incomingMessages = [],
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onEmojiClick,
  onToggleEmojiPicker,
  onFileSelect,
  onClearAttachment,
}: ChatAreaProps) {
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
      <ChatHeader selectedContact={selectedContact} isDarkMode={isDarkMode} />

      {/* ✅ MessagesArea tự fetch theo selectedContact.id */}
      <MessagesArea
        selectedContact={selectedContact}
        currentUserId={currentUserId}
        isDarkMode={isDarkMode}
        messagesEndRef={messagesEndRef}
        incomingMessages={incomingMessages}
      />

      <MessageInput
        message={message}
        isConnected={isConnected}
        isDarkMode={isDarkMode}
        showEmojiPicker={showEmojiPicker}
        attachmentPreview={attachmentPreview}
        emojis={emojis}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
        onEmojiClick={onEmojiClick}
        onToggleEmojiPicker={onToggleEmojiPicker}
        onFileSelect={onFileSelect}
        onClearAttachment={onClearAttachment}
      />
    </div>
  );
}
