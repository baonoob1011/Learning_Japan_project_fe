"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

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

// Extended interface with segment playback methods
export interface YoutubePlayerHandle extends YTPlayer {
  playSegment: (startMs: number, endMs: number) => void;
  stopSegment: () => void;
  onDictationSegmentEnd?: () => void; // ✅ Callback cho Dictation
}

interface YoutubePlayerProps {
  videoId: string;
  onPlayerReady?: (player: YTPlayer) => void;
  onSegmentEnd?: () => void;
}

const YoutubePlayer = forwardRef<YoutubePlayerHandle, YoutubePlayerProps>(
  ({ videoId, onPlayerReady, onSegmentEnd }, ref) => {
    const playerRef = useRef<YTPlayer | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const handleRef = useRef<YoutubePlayerHandle | null>(null);

    /** ======================
     * STOP SEGMENT PLAYBACK
     ====================== */
    const stopSegment = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (playerRef.current) {
        try {
          playerRef.current.pauseVideo();
        } catch {}
      }
    };

    /** ======================
     * PLAY SEGMENT (startMs to endMs)
     ====================== */
    const playSegment = (startMs: number, endMs: number) => {
      if (!playerRef.current) return;

      const startSec = startMs / 1000;
      const endSec = endMs / 1000;

      // ✅ Hard reset trước mỗi lần play
      stopSegment();

      try {
        // ✅ Seek + play NGAY, không setTimeout
        playerRef.current.seekTo(startSec, true);
        playerRef.current.playVideo();

        intervalRef.current = setInterval(() => {
          if (!playerRef.current) {
            stopSegment();
            return;
          }

          const currentTime = playerRef.current.getCurrentTime();

          if (typeof currentTime === "number" && currentTime >= endSec) {
            stopSegment();

            // ✅ Gọi callback từ props
            onSegmentEnd?.();

            // ✅ Gọi callback từ Dictation nếu có
            if (handleRef.current?.onDictationSegmentEnd) {
              handleRef.current.onDictationSegmentEnd();
            }
          }
        }, 50);
      } catch (error) {
        console.warn("Error playing segment:", error);
        stopSegment();
      }
    };

    // Expose all methods to parent component
    useImperativeHandle(
      ref,
      () => {
        const handle: YoutubePlayerHandle = {
          getCurrentTime: () => playerRef.current?.getCurrentTime(),
          seekTo: (seconds: number, allowSeekAhead: boolean) =>
            playerRef.current?.seekTo(seconds, allowSeekAhead),
          playVideo: () => playerRef.current?.playVideo(),
          pauseVideo: () => playerRef.current?.pauseVideo(),
          playSegment,
          stopSegment,
        };
        handleRef.current = handle;
        return handle;
      },
      []
    );

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
            if (playerRef.current) {
              onPlayerReady?.(playerRef.current);
            }
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

      return () => {
        stopSegment();
      };
    }, [videoId]);

    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-2">
        <div className="relative pt-[56.25%] bg-black">
          <div
            id="youtube-player"
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      </div>
    );
  }
);

YoutubePlayer.displayName = "YoutubePlayer";

export default YoutubePlayer;
