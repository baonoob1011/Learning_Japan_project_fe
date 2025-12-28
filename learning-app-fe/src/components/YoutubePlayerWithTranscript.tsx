"use client";

import React, { useEffect, useRef, useState } from "react";
import TranscriptWordBar from "./transcriptWordBar";
import { TranscriptDTO } from "@/services/transcriptService";

/* ===== TYPES ===== */
type YTPlayer = {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: () => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface Props {
  videoId: string;
  transcripts: TranscriptDTO[];
  seekTimeMs?: number | null;
  onSeekHandled?: () => void;
  onTimeUpdate?: (timeMs: number) => void; // ✅ Thêm prop này
}

export default function YoutubePlayerWithTranscript({
  videoId,
  transcripts,
  seekTimeMs,
  onSeekHandled,
  onTimeUpdate, // ✅ Nhận prop từ parent
}: Props) {
  const playerRef = useRef<YTPlayer | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /** ======================
   * INIT YOUTUBE PLAYER
   ====================== */
  const initPlayer = () => {
    if (!window.YT) return;

    playerRef.current = new window.YT.Player("youtube-player", {
      videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: () => {
          // ✅ Lưu interval reference để cleanup sau
          intervalRef.current = setInterval(() => {
            const time = playerRef.current?.getCurrentTime();
            if (typeof time === "number") {
              const timeMs = time * 1000;
              setCurrentTimeMs(timeMs);
              onTimeUpdate?.(timeMs); // ✅ Gửi time về parent
            }
          }, 300);
        },
      },
    });
  };

  useEffect(() => {
    if (window.YT) {
      initPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = initPlayer;
    }

    // ✅ Cleanup interval khi component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId]);

  /** ======================
   * SEEK FROM OUTSIDE
   ====================== */
  useEffect(() => {
    if (seekTimeMs != null && playerRef.current) {
      playerRef.current.seekTo(seekTimeMs / 1000, true);
      playerRef.current.playVideo();
      onSeekHandled?.();
    }
  }, [seekTimeMs, onSeekHandled]);

  /**
   * ✅ HANDLE WORD CLICK - Click vào từ để seek video
   */
  const handleWordClick = (timeMs: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timeMs / 1000, true);
      playerRef.current.playVideo();
    }
  };

  return (
    <>
      {/* VIDEO */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-2">
        <div className="relative pt-[56.25%] bg-black">
          <div
            id="youtube-player"
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>

      {/* WORD BAR */}
      <TranscriptWordBar
        transcripts={transcripts}
        currentTimeMs={currentTimeMs}
        onWordClick={handleWordClick} // ✅ Truyền handler xuống WordBar
      />
    </>
  );
}
