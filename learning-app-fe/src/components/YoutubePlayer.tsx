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
  destroy: () => void;
};

type YTPlayerStateChangeEvent = {
  data: number;
  target: YTPlayer;
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
            onStateChange?: (event: YTPlayerStateChangeEvent) => void;
          };
        }
      ) => YTPlayer;
      PlayerState?: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface YoutubePlayerHandle extends YTPlayer {
  playSegment: (startMs: number, endMs: number) => void;
  stopSegment: () => void;
  onDictationSegmentEnd?: () => void;
  onPronunciationSegmentEnd?: () => void;
}

interface YoutubePlayerProps {
  videoId: string;
  onPlayerReady?: (player: YTPlayer) => void;
  onSegmentEnd?: () => void;
  onStateChange?: (event: YTPlayerStateChangeEvent) => void; // ✅ NEW
}

const YoutubePlayer = forwardRef<YoutubePlayerHandle, YoutubePlayerProps>(
  ({ videoId, onPlayerReady, onSegmentEnd, onStateChange }, ref) => {
    const playerRef = useRef<YTPlayer | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const handleRef = useRef<YoutubePlayerHandle | null>(null);
    const isInitializedRef = useRef(false);

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

      stopSegment();

      try {
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

            onSegmentEnd?.();

            if (handleRef.current?.onDictationSegmentEnd) {
              console.log("📞 Calling onDictationSegmentEnd");
              handleRef.current.onDictationSegmentEnd();
            }

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
          destroy: () => playerRef.current?.destroy(),
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
      if (!window.YT || isInitializedRef.current) {
        console.log(
          "⏳ YoutubePlayer: Waiting for YT API or already initialized"
        );
        return;
      }

      console.log("🚀 YoutubePlayer: Initializing player for video", videoId);

      try {
        // ✅ Destroy existing player first
        if (playerRef.current) {
          console.log("🧹 YoutubePlayer: Destroying existing player");
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.warn("Error destroying player:", e);
          }
          playerRef.current = null;
        }

        playerRef.current = new window.YT.Player("youtube-player", {
          videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            autoplay: 0,
          },
          events: {
            onReady: () => {
              console.log("✅ YoutubePlayer: Player ready for", videoId);
              isInitializedRef.current = true;
              if (playerRef.current) {
                onPlayerReady?.(playerRef.current);
              }
            },
            onStateChange: (event) => {
              console.log("🎬 Player state changed:", event.data);
              onStateChange?.(event); // ✅ NEW: Forward state change to parent
            },
          },
        });
      } catch (error) {
        console.error("❌ Error initializing player:", error);
        isInitializedRef.current = false;
      }
    };

    /** ======================
     * LOAD YOUTUBE API & INIT
     ====================== */
    useEffect(() => {
      console.log("🔄 YoutubePlayer: Effect triggered for videoId", videoId);

      // ✅ Reset initialization flag when videoId changes
      isInitializedRef.current = false;

      const initializePlayer = () => {
        if (window.YT && window.YT.Player) {
          console.log("✅ YT API available, initializing player");
          initPlayer();
        }
      };

      if (window.YT && window.YT.Player) {
        // API already loaded
        console.log("✅ YT API already loaded, initializing immediately");
        // ✅ Small delay to ensure DOM is ready
        setTimeout(initializePlayer, 100);
      } else {
        // Load API
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
          console.log("📥 Loading YouTube IFrame API");
          const tag = document.createElement("script");
          tag.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(tag);
        }

        // ✅ Set up callback that will be called when API loads
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          console.log("✅ YouTube IFrame API Ready");
          if (originalCallback) originalCallback();
          initializePlayer();
        };

        // ✅ Polling fallback
        const checkInterval = setInterval(() => {
          if (window.YT && window.YT.Player) {
            console.log("✅ YT API detected via polling");
            clearInterval(checkInterval);
            initializePlayer();
          }
        }, 100);

        // ✅ Cleanup check interval after 5 seconds
        const timeoutId = setTimeout(() => {
          clearInterval(checkInterval);
          console.warn("⏰ YT API loading timeout");
        }, 5000);

        return () => {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
        };
      }

      return () => {
        console.log("🧹 YoutubePlayer: Cleaning up for videoId", videoId);
        stopSegment();
        isInitializedRef.current = false;

        // ✅ Destroy player on unmount
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.warn("Error destroying player on cleanup:", e);
          }
          playerRef.current = null;
        }
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
