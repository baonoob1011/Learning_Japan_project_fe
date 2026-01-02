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
  onPronunciationSegmentEnd?: () => void; // ✅ Callback cho Pronunciation
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
      console.log("🎬 YoutubePlayer: playSegment called", { startMs, endMs });

      if (!playerRef.current) {
        console.error("❌ YoutubePlayer: playerRef.current is null!");
        return;
      }

      const startSec = startMs / 1000;
      const endSec = endMs / 1000;

      // ✅ Hard reset trước mỗi lần play
      stopSegment();

      try {
        // ✅ Seek + play NGAY, không setTimeout
        playerRef.current.seekTo(startSec, true);
        playerRef.current.playVideo();
        console.log(
          "✅ YoutubePlayer: Video playing from",
          startSec,
          "to",
          endSec
        );

        intervalRef.current = setInterval(() => {
          if (!playerRef.current) {
            stopSegment();
            return;
          }

          const currentTime = playerRef.current.getCurrentTime();

          if (typeof currentTime === "number" && currentTime >= endSec) {
            console.log(
              "🎯 YoutubePlayer: Segment END reached at",
              currentTime
            );
            stopSegment();

            // ✅ Gọi callback từ props
            onSegmentEnd?.();

            // ✅ Gọi callback từ Dictation nếu có
            if (handleRef.current?.onDictationSegmentEnd) {
              console.log("📞 Calling onDictationSegmentEnd");
              handleRef.current.onDictationSegmentEnd();
            }

            // ✅ Gọi callback từ Pronunciation nếu có
            if (handleRef.current?.onPronunciationSegmentEnd) {
              console.log("📞 Calling onPronunciationSegmentEnd");
              handleRef.current.onPronunciationSegmentEnd();
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
        console.log("🔗 YoutubePlayer: Handle created and stored");
        return handle;
      },
      []
    );

    /** ======================
     * INIT YOUTUBE PLAYER
     ====================== */
    const initPlayer = () => {
      if (!window.YT) return;

      console.log("🚀 YoutubePlayer: Initializing player for video", videoId);

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            console.log("✅ YoutubePlayer: Player ready!");
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
        console.log("🧹 YoutubePlayer: Cleaning up");
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
