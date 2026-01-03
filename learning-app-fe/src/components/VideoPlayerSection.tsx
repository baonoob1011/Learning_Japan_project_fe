"use client";

import React from "react";
import YoutubePlayerWithTranscript from "./YoutubePlayerWithTranscript";
import { TranscriptDTO } from "@/services/transcriptService";
import { YoutubePlayerHandle } from "./YoutubePlayer";

interface VideoPlayerSectionProps {
  playerRef: React.RefObject<YoutubePlayerHandle | null>;
  videoId: string;
  videoTitle: string;
  transcripts: TranscriptDTO[];
  seekTimeMs: number | null;
  onSeekHandled: () => void;
  onTimeUpdate: (timeMs: number) => void;
  hideWordBar?: boolean;
  onVocabSaved?: () => void;
  isDarkMode?: boolean;
}

export default function VideoPlayerSection({
  playerRef,
  videoId,
  videoTitle,
  transcripts,
  seekTimeMs,
  onSeekHandled,
  onTimeUpdate,
  hideWordBar = false,
  onVocabSaved,
  isDarkMode = false,
}: VideoPlayerSectionProps) {
  return (
    <div
      id="video-content-scroll-container"
      className={`flex-1 overflow-y-auto custom-scrollbar transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Video Player */}
          <YoutubePlayerWithTranscript
            ref={playerRef}
            videoId={videoId}
            transcripts={transcripts}
            seekTimeMs={seekTimeMs}
            onSeekHandled={onSeekHandled}
            onTimeUpdate={onTimeUpdate}
            hideWordBar={hideWordBar}
            onVocabSaved={onVocabSaved}
          />

          {/* Video Info */}
          <div
            className={`rounded-2xl shadow-sm p-6 mt-6 transition-colors duration-300 ${
              isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-cyan-900/50 text-cyan-300"
                    : "bg-cyan-100 text-cyan-700"
                }`}
              >
                N5
              </span>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-purple-900/50 text-purple-300"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                Podcast
              </span>
            </div>
            <h1
              className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {videoTitle || "Đang tải..."}
            </h1>

            {/* Additional Info Section */}
            <div
              className={`border-t pt-4 mt-4 transition-colors duration-300 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-3 transition-colors duration-300 ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Mô tả
              </h3>
              <p
                className={`text-sm leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Video học tiếng Nhật với phụ đề tiếng Việt. Click vào từng từ để
                xem nghĩa chi tiết và lưu vào bộ từ vựng của bạn.
              </p>
            </div>

            <div
              className={`border-t pt-4 mt-4 transition-colors duration-300 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h3
                className={`text-lg font-semibold mb-3 transition-colors duration-300 ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Thông tin
              </h3>
              <div
                className={`space-y-2 text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">Độ khó:</span>
                  <span>N5 - Cơ bản</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Thể loại:</span>
                  <span>Podcast</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Số câu:</span>
                  <span>{transcripts.length} câu</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode
            ? "rgba(31, 41, 55, 0.5)"
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
