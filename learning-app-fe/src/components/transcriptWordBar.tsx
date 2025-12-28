"use client";

import React, { useMemo } from "react";
import TinySegmenter from "tiny-segmenter";

interface TranscriptDTO {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
}

interface WordItem {
  word: string;
  startOffset: number;
  endOffset: number;
}

interface Props {
  transcripts: TranscriptDTO[];
  currentTimeMs: number;
  onWordClick?: (timeMs: number) => void;
}

const segmenter = new TinySegmenter();

export default function TranscriptWordBar({
  transcripts,
  currentTimeMs,
  onWordClick,
}: Props) {
  /**
   * 1️⃣ Transcript đang active
   */
  const activeTranscript = useMemo(() => {
    return transcripts.find(
      (t) => currentTimeMs >= t.startOffset && currentTimeMs < t.endOffset
    );
  }, [transcripts, currentTimeMs]);

  /**
   * 2️⃣ Segment + chia time đều cho từng từ
   */
  const words: WordItem[] = useMemo(() => {
    if (!activeTranscript) return [];

    const segmented = segmenter
      .segment(activeTranscript.text)
      .filter((w) => w.trim() !== "");

    const duration = activeTranscript.endOffset - activeTranscript.startOffset;
    const step = duration / segmented.length;

    return segmented.map((word, index) => ({
      word,
      startOffset: activeTranscript.startOffset + index * step,
      endOffset: activeTranscript.startOffset + (index + 1) * step,
    }));
  }, [activeTranscript]);

  if (!activeTranscript) return null;

  return (
    <div className="relative px-8 py-6">
      {/* Words Container */}
      <div className="flex flex-wrap gap-2.5 items-baseline">
        {words.map((item, index) => {
          const isActive =
            currentTimeMs >= item.startOffset && currentTimeMs < item.endOffset;

          return (
            <span
              key={index}
              onClick={() => onWordClick?.(item.startOffset)}
              className={`
                relative cursor-pointer transition-all duration-200
                px-3 py-1.5 rounded-lg font-medium
                ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/40 scale-105 -translate-y-0.5"
                    : "bg-white/80 text-slate-700 hover:bg-white hover:shadow-md border border-slate-200/50"
                }
                backdrop-blur-sm
              `}
            >
              {isActive && (
                <>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-lg blur-md opacity-40 -z-10"></div>
                </>
              )}
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
