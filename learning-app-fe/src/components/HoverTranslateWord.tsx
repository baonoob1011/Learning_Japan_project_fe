"use client";

import React, { useState, useRef, useEffect } from "react";
import { translateService, TranslateResult } from "@/services/translateService";

interface HoverTranslateWordProps {
  word: string;
  sourceLang?: string;
  targetLang?: string;
}

const translateCache = new Map<string, TranslateResult>();

export default function HoverTranslateWord({
  word,
  sourceLang = "ja",
  targetLang = "vi",
}: HoverTranslateWordProps) {
  const [loading, setLoading] = useState(false);
  const [translateData, setTranslateData] = useState<TranslateResult | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  // Đóng tooltip khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        wordRef.current &&
        !wordRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleTranslate = async () => {
    const cacheKey = `${word}_${sourceLang}_${targetLang}`;

    if (translateCache.has(cacheKey)) {
      setTranslateData(translateCache.get(cacheKey)!);
      setOpen(true);
      return;
    }

    try {
      setLoading(true);
      setOpen(true);

      const res = await translateService.translate({
        text: word,
        sourceLang,
        targetLang,
      });

      translateCache.set(cacheKey, res);
      setTranslateData(res);
    } catch (err) {
      console.error("Translate error", err);
      setTranslateData({
        original: word,
        translated: "Lỗi dịch",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translateData) return;

    const textToCopy = `
${translateData.original}
${translateData.reading ? `đọc: ${translateData.reading}` : ""}
${translateData.romaji ? `Romaji: ${translateData.romaji}` : ""}
${translateData.translated ? `Nghĩa: ${translateData.translated}` : ""}
${translateData.explanation ? `Giải thích: ${translateData.explanation}` : ""}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <span className="relative inline-block mx-0.5">
      {/* WORD - Click to translate */}
      <span
        ref={wordRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!open) {
            handleTranslate();
          } else {
            setOpen(false);
          }
        }}
        className="cursor-pointer hover:bg-yellow-200/50 px-1 rounded transition-colors duration-150 select-none"
      >
        {word}
      </span>

      {/* TOOLTIP POPUP - Compact Version */}
      {open && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] left-1/2 -translate-x-1/2"
          style={{
            top: wordRef.current
              ? `${Math.min(
                  wordRef.current.getBoundingClientRect().bottom + 8,
                  window.innerHeight - 400
                )}px`
              : "50%",
          }}
        >
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-white drop-shadow-lg"></div>

          {/* Popup Content - Compact */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-[280px]">
            {/* Header - Compact */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 flex items-center justify-between">
              <span className="text-white text-sm font-semibold">
                {translateData?.original || word}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="text-white hover:bg-white/20 rounded p-1 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body - Compact */}
            <div className="p-3">
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-gray-400 py-8">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-xs">Đang dịch...</span>
                </div>
              ) : translateData ? (
                <div className="space-y-2">
                  {/* Translation - Main */}
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <div className="text-xl font-bold text-emerald-600">
                      {translateData.translated}
                    </div>
                  </div>

                  {/* Reading */}
                  {translateData.reading && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium min-w-[50px]">
                        Kanji:
                      </span>
                      <span className="text-pink-600 font-medium">
                        {translateData.reading}
                      </span>
                    </div>
                  )}

                  {/* Romaji */}
                  {translateData.romaji && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium min-w-[50px]">
                        Romaji:
                      </span>
                      <span className="text-purple-600">
                        {translateData.romaji}
                      </span>
                    </div>
                  )}

                  {/* Explanation */}
                  {translateData.explanation && (
                    <div className="bg-amber-50 rounded-lg p-2 border border-amber-200 mt-2">
                      <div className="text-xs text-gray-600 leading-relaxed">
                        {translateData.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer - Compact */}
            <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                disabled={!translateData}
                className="flex-1 text-xs text-gray-700 hover:text-gray-900 font-medium flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Sao chép
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
