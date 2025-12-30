"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import TranscriptWordBar from "./transcriptWordBar";
import { TranscriptDTO } from "@/services/transcriptService";

/* ===== TYPES ===== */
type YTPlayer = {
  getCurrentTime: () => number | undefined;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
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
  onTimeUpdate?: (timeMs: number) => void;
}

const YoutubePlayerWithTranscript = forwardRef<YTPlayer, Props>(
  ({ videoId, transcripts, seekTimeMs, onSeekHandled, onTimeUpdate }, ref) => {
    const playerRef = useRef<YTPlayer | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [currentTimeMs, setCurrentTimeMs] = useState(0);

    // Expose playerRef to parent component
    useImperativeHandle(ref, () => playerRef.current!, []);

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
            // ✅ Clear previous interval if exists
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            // ✅ Start tracking time
            intervalRef.current = setInterval(() => {
              if (!playerRef.current) return;

              try {
                const time = playerRef.current.getCurrentTime();

                // ✅ Check if time is valid number
                if (typeof time === "number" && !isNaN(time)) {
                  const timeMs = Math.floor(time * 1000);
                  setCurrentTimeMs(timeMs);
                  onTimeUpdate?.(timeMs);
                }
              } catch (error) {
                console.warn("Error getting current time:", error);
              }
            }, 300);
          },
        },
      });
    };

    useEffect(() => {
      if (window.YT) {
        initPlayer();
        return;
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = initPlayer;

      // ✅ Cleanup on unmount
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
        try {
          playerRef.current.seekTo(seekTimeMs / 1000, true);
          playerRef.current.playVideo();
          onSeekHandled?.();
        } catch (error) {
          console.warn("Error seeking video:", error);
        }
      }
    }, [seekTimeMs, onSeekHandled]);

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
          videoId={videoId}
        />
      </>
    );
  }
);

YoutubePlayerWithTranscript.displayName = "YoutubePlayerWithTranscript";

export default YoutubePlayerWithTranscript;
