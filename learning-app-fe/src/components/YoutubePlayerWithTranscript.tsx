"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import YoutubePlayer, { YoutubePlayerHandle } from "./YoutubePlayer";
import TranscriptWordBar from "./transcriptWordBar";
import { TranscriptDTO } from "@/services/transcriptService";

interface Props {
  videoId: string;
  transcripts: TranscriptDTO[];
  seekTimeMs?: number | null;
  onSeekHandled?: () => void;
  onTimeUpdate?: (timeMs: number) => void;
  hideWordBar?: boolean; // ✅ Thêm prop mới để ẩn WordBar
}

const YoutubePlayerWithTranscript = forwardRef<YoutubePlayerHandle, Props>(
  (
    {
      videoId,
      transcripts,
      seekTimeMs,
      onSeekHandled,
      onTimeUpdate,
      hideWordBar = false,
    },
    ref
  ) => {
    const playerRef = useRef<YoutubePlayerHandle | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [currentTimeMs, setCurrentTimeMs] = useState(0);

    // Expose playerRef to parent component
    useImperativeHandle(
      ref,
      () => {
        // Tạo handle object và return về
        const handle: YoutubePlayerHandle = {
          getCurrentTime: () => playerRef.current?.getCurrentTime(),
          seekTo: (seconds: number, allowSeekAhead: boolean) =>
            playerRef.current?.seekTo(seconds, allowSeekAhead),
          playVideo: () => playerRef.current?.playVideo(),
          pauseVideo: () => playerRef.current?.pauseVideo(),
          playSegment: (startMs: number, endMs: number) =>
            playerRef.current?.playSegment(startMs, endMs),
          stopSegment: () => playerRef.current?.stopSegment(),
          // ✅ Expose onDictationSegmentEnd property
          get onDictationSegmentEnd() {
            return playerRef.current?.onDictationSegmentEnd;
          },
          set onDictationSegmentEnd(callback: (() => void) | undefined) {
            if (playerRef.current) {
              playerRef.current.onDictationSegmentEnd = callback;
            }
          },
        };
        return handle;
      },
      []
    );

    /** ======================
     * HANDLE PLAYER READY
     ====================== */
    const handlePlayerReady = () => {
      // Player is ready, ref is already set by YoutubePlayer component

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
    };

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

    /** ======================
     * CLEANUP
     ====================== */
    useEffect(() => {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    return (
      <>
        {/* VIDEO */}
        <YoutubePlayer
          ref={playerRef}
          videoId={videoId}
          onPlayerReady={handlePlayerReady}
        />

        {/* WORD BAR - Chỉ hiện khi hideWordBar = false */}
        {!hideWordBar && (
          <TranscriptWordBar
            transcripts={transcripts}
            currentTimeMs={currentTimeMs}
            videoId={videoId}
          />
        )}
      </>
    );
  }
);

YoutubePlayerWithTranscript.displayName = "YoutubePlayerWithTranscript";

export default YoutubePlayerWithTranscript;
