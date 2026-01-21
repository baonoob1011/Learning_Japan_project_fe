"use client";

import React from "react";
import YoutubePlayerWithTranscript from "./YoutubePlayerWithTranscript";
import { TranscriptDTO } from "@/services/transcriptService";
import { YoutubePlayerHandle } from "./YoutubePlayer";
import { JLPTLevel, VideoTag } from "@/types/video";

interface VideoPlayerSectionProps {
  playerRef: React.RefObject<YoutubePlayerHandle | null>;
  videoId: string;
  videoTitle: string;
  transcripts: TranscriptDTO[];
  seekTimeMs: number | null;
  onSeekHandled: () => void;
  onTimeUpdate: (timeMs: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void; // ✅ NEW
  hideWordBar?: boolean;
  onVocabSaved?: () => void;
  isDarkMode?: boolean;
  level: JLPTLevel;
  videoTag: VideoTag;
}

// Mapping cho JLPT Level
const levelDisplay: Record<JLPTLevel, string> = {
  N5: "N5 - Cơ bản",
  N4: "N4 - Sơ cấp",
  N3: "N3 - Trung cấp",
  N2: "N2 - Trung cao cấp",
  N1: "N1 - Nâng cao",
};

// Mapping cho Video Tag
const tagDisplay: Record<VideoTag, string> = {
  NEWS: "Tin tức",
  BEGINNER: "Mới bắt đầu",
  PODCAST: "Podcast",
  TECHNOLOGY: "Công nghệ",
  BUSINESS: "Kinh doanh",
  TED: "TED",
  GRAMMAR: "Ngữ pháp",
  ANIME: "Hoạt hình",
  SHORT_VIDEO: "Video ngắn",
  MOVIE: "Phim",
  TRAVEL: "Du lịch",
  CULTURE: "Văn hóa",
  FOOD: "Ẩm thực",
  KIDS: "Kids",
};

export default function VideoPlayerSection({
  playerRef,
  videoId,
  videoTitle,
  transcripts,
  seekTimeMs,
  onSeekHandled,
  onTimeUpdate,
  onPlayingChange, // ✅ NEW
  hideWordBar = false,
  onVocabSaved,
  isDarkMode = false,
  level,
  videoTag,
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
            onPlayingChange={onPlayingChange} // ✅ NEW - Pass down
            hideWordBar={hideWordBar}
            onVocabSaved={onVocabSaved}
            isDarkMode={isDarkMode}
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
                {level}
              </span>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-300 ${
                  isDarkMode
                    ? "bg-purple-900/50 text-purple-300"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {tagDisplay[videoTag]}
              </span>
            </div>
            <h1
              className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {videoTitle || "Đang tải..."}
            </h1>

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
                  <span>{levelDisplay[level]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Thể loại:</span>
                  <span>{tagDisplay[videoTag]}</span>
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
