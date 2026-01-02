"use client";
import React, { useState } from "react";
import {
  Volume2,
  Copy,
  Edit,
  Trash2,
  Plus,
  X,
  ChevronLeft,
} from "lucide-react";

export interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  translation: string;
}

interface VocabularySidebarProps {
  videoId: string;
  isVisible?: boolean;
  onToggle?: () => void;
  selectedText?: string;
  onAddFromSelection?: (word: string) => void;
  isDarkMode?: boolean;
}

export default function VocabularySidebar({
  videoId,
  isVisible = true,
  onToggle,
  selectedText,
  onAddFromSelection,
  isDarkMode = false,
}: VocabularySidebarProps) {
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([
    { id: "1", word: "みな", reading: "mina", translation: "Tất cả" },
    { id: "2", word: "元気", reading: "genki", translation: "Khỏe mạnh" },
    { id: "3", word: "今日", reading: "kyou", translation: "Hôm nay" },
    { id: "4", word: "パイト", reading: "paito", translation: "Part-time" },
    { id: "5", word: "サイズ", reading: "saizu", translation: "Size" },
  ]);

  const [editingVocab, setEditingVocab] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    word: "",
    reading: "",
    translation: "",
  });

  const handlePlayAudio = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "ja-JP";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyWord = (word: string) => {
    navigator.clipboard.writeText(word);
  };

  const handleDeleteVocab = (id: string) => {
    setVocabularyList(vocabularyList.filter((v) => v.id !== id));
  };

  const handleAddVocab = () => {
    const newVocab: VocabularyItem = {
      id: Date.now().toString(),
      word: selectedText || "新しい",
      reading: "",
      translation: "",
    };
    setVocabularyList([newVocab, ...vocabularyList]);
    setEditingVocab(newVocab.id);
    setEditForm({
      word: newVocab.word,
      reading: newVocab.reading,
      translation: newVocab.translation,
    });
    if (onAddFromSelection && selectedText) {
      onAddFromSelection("");
    }
  };

  const handleStartEdit = (vocab: VocabularyItem) => {
    setEditingVocab(vocab.id);
    setEditForm({
      word: vocab.word,
      reading: vocab.reading,
      translation: vocab.translation,
    });
  };

  const handleSaveEdit = (id: string) => {
    setVocabularyList(
      vocabularyList.map((v) => (v.id === id ? { ...v, ...editForm } : v))
    );
    setEditingVocab(null);
  };

  const handleCancelEdit = () => {
    setEditingVocab(null);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`relative w-80 h-full border-r flex flex-col ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex-shrink-0 ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`p-1.5 rounded ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <span className="text-lg">📖</span>
            </div>
            <h2
              className={`text-lg font-bold ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Từ vựng
            </h2>
          </div>
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
              isDarkMode
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title="Đóng từ vựng"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub-header with count and add button */}
      <div
        className={`px-4 py-3 border-b flex-shrink-0 ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      ></div>

      {/* Selection Tip Banner */}
      {selectedText && (
        <div
          className={`mx-4 mt-4 p-3 border rounded-lg ${
            isDarkMode
              ? "bg-emerald-900/30 border-emerald-700"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <p
                className={`text-xs font-medium mb-1 ${
                  isDarkMode ? "text-emerald-400" : "text-emerald-700"
                }`}
              >
                💡 Tips! Văn bản đã chọn:
              </p>
              <p
                className={`text-sm font-bold mb-2 ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {selectedText}
              </p>
            </div>
          </div>
          <button
            onClick={handleAddVocab}
            className={`w-full px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
              isDarkMode
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            + Thêm vào từ vựng
          </button>
        </div>
      )}

      {/* Vocabulary List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {vocabularyList.map((vocab) => (
          <div
            key={vocab.id}
            className={`group border rounded-lg p-3 transition-all ${
              isDarkMode
                ? "bg-gray-700/50 border-gray-600 hover:border-emerald-500"
                : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm"
            }`}
          >
            {editingVocab === vocab.id ? (
              // Edit Mode
              <div className="space-y-2">
                <input
                  type="text"
                  value={editForm.word}
                  onChange={(e) =>
                    setEditForm({ ...editForm, word: e.target.value })
                  }
                  className={`w-full px-2 py-1 text-lg font-bold border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDarkMode
                      ? "bg-gray-800 border-emerald-600 text-gray-100"
                      : "bg-white border-emerald-300 text-gray-900"
                  }`}
                  placeholder="Từ"
                />
                <input
                  type="text"
                  value={editForm.reading}
                  onChange={(e) =>
                    setEditForm({ ...editForm, reading: e.target.value })
                  }
                  className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDarkMode
                      ? "bg-gray-800 border-emerald-600 text-gray-100"
                      : "bg-white border-emerald-300 text-gray-900"
                  }`}
                  placeholder="Phiên âm"
                />
                <input
                  type="text"
                  value={editForm.translation}
                  onChange={(e) =>
                    setEditForm({ ...editForm, translation: e.target.value })
                  }
                  className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDarkMode
                      ? "bg-gray-800 border-emerald-600 text-gray-100"
                      : "bg-white border-emerald-300 text-gray-900"
                  }`}
                  placeholder="Nghĩa tiếng Việt"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(vocab.id)}
                    className="flex-1 px-3 py-1.5 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 transition-colors"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className={`flex-1 px-3 py-1.5 text-sm rounded transition-colors ${
                      isDarkMode
                        ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold mb-1 ${
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {vocab.word}
                    </h3>
                    <p
                      className={`text-sm mb-1 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {vocab.reading}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-emerald-400" : "text-emerald-700"
                      }`}
                    >
                      {vocab.translation}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className={`flex items-center gap-2 mt-3 pt-3 border-t ${
                    isDarkMode ? "border-gray-600" : "border-gray-100"
                  }`}
                >
                  <button
                    onClick={() => handlePlayAudio(vocab.word)}
                    className={`p-2 rounded transition-colors ${
                      isDarkMode
                        ? "text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30"
                        : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                    }`}
                    title="Phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyWord(vocab.word)}
                    className={`p-2 rounded transition-colors ${
                      isDarkMode
                        ? "text-gray-400 hover:text-blue-400 hover:bg-blue-900/30"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    title="Sao chép"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(vocab)}
                    className={`p-2 rounded transition-colors ${
                      isDarkMode
                        ? "text-gray-400 hover:text-amber-400 hover:bg-amber-900/30"
                        : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                    }`}
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteVocab(vocab.id)}
                    className={`p-2 rounded transition-colors ml-auto ${
                      isDarkMode
                        ? "text-gray-400 hover:text-red-400 hover:bg-red-900/30"
                        : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                    }`}
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {vocabularyList.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="mb-4 flex justify-center">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  isDarkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                }`}
              >
                <span className="text-3xl">💡</span>
              </div>
            </div>
            <p
              className={`mb-4 text-sm leading-relaxed ${
                isDarkMode ? "text-gray-400" : "text-gray-700"
              }`}
            >
              Tips! Bôi đen văn bản để dịch và thêm vào phần từ vựng
            </p>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode
            ? "rgba(55, 65, 81, 0.5)"
            : "rgba(243, 244, 246, 0.5)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "#4b5563" : "#d1d5db"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "#6b7280" : "#9ca3af"};
        }
      `}</style>
    </div>
  );
}
