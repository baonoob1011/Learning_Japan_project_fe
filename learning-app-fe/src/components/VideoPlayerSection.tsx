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
}: VideoPlayerSectionProps) {
  return (
    <div
      id="video-content-scroll-container"
      className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar"
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
          />

          {/* Video Info */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">
                N5
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                Podcast
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {videoTitle || "Đang tải..."}
            </h1>

            {/* Additional Info Section */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Mô tả
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Video học tiếng Nhật với phụ đề tiếng Việt. Click vào từng từ để
                xem nghĩa chi tiết và lưu vào bộ từ vựng của bạn.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Thông tin
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
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
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
