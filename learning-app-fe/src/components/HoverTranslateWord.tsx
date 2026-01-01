"use client";

import React, { useState, useRef, useEffect } from "react";
import { translateService, TranslateResult } from "@/services/translateService";
import { vocabService } from "@/services/vocabService";

interface HoverTranslateWordProps {
  word: string;
  sourceLang?: string;
  targetLang?: string;
  videoId?: string;
}

const translateCache = new Map<string, TranslateResult>();

export default function HoverTranslateWord({
  word,
  sourceLang = "ja",
  targetLang = "vi",
  videoId,
}: HoverTranslateWordProps) {
  const [loading, setLoading] = useState(false);
  const [translateData, setTranslateData] = useState<TranslateResult | null>(
    null
  );
  const [open, setOpen] = useState(false);

  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingVocab, setSavingVocab] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  // Update position when popup opens
  useEffect(() => {
    if (open && wordRef.current && tooltipRef.current) {
      const updatePosition = () => {
        const rect = wordRef.current!.getBoundingClientRect();
        const tooltipRect = tooltipRef.current!.getBoundingClientRect();

        // Calculate position relative to viewport
        const top = rect.bottom + window.scrollY + 8;
        let left = rect.left + window.scrollX + rect.width / 2;

        // Check if tooltip would go off-screen to the right
        const tooltipWidth = tooltipRect.width || 280;
        const viewportWidth = window.innerWidth;

        if (left + tooltipWidth / 2 > viewportWidth - 10) {
          left = viewportWidth - tooltipWidth / 2 - 10 + window.scrollX;
        }

        // Check if tooltip would go off-screen to the left
        if (left - tooltipWidth / 2 < 10) {
          left = tooltipWidth / 2 + 10 + window.scrollX;
        }

        setPosition({ top, left });
      };

      // Initial position update with slight delay to ensure tooltip is rendered
      setTimeout(updatePosition, 0);

      const scrollContainer = document.getElementById(
        "video-content-scroll-container"
      );
      const updateOnScroll = () => {
        if (wordRef.current && tooltipRef.current) {
          updatePosition();
        }
      };

      if (scrollContainer) {
        scrollContainer.addEventListener("scroll", updateOnScroll);
      }
      window.addEventListener("scroll", updateOnScroll, true);
      window.addEventListener("resize", updateOnScroll);

      return () => {
        if (scrollContainer) {
          scrollContainer.removeEventListener("scroll", updateOnScroll);
        }
        window.removeEventListener("scroll", updateOnScroll, true);
        window.removeEventListener("resize", updateOnScroll);
      };
    }
  }, [open, translateData]);

  // Close tooltip when clicking outside
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
    const cacheKey = `${word}_${sourceLang}_${targetLang}_${videoId ?? ""}`;

    if (translateCache.has(cacheKey)) {
      setTranslateData(translateCache.get(cacheKey)!);
      setOpen(true);
      return;
    }

    try {
      setLoading(true);
      setOpen(true);

      const res = await translateService.translate({
        videoId,
        text: word,
        sourceLang,
        targetLang,
      });

      translateCache.set(cacheKey, res);
      setTranslateData(res);
    } catch (err) {
      console.error("Translate error", err);
      setTranslateData({
        surface: word,
        translated: "Lỗi dịch",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!translateData?.surface) return;

    navigator.clipboard.writeText(translateData.surface);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleSaveVocab = async () => {
    if (!translateData?.surface || savingVocab) return;

    try {
      setSavingVocab(true);
      await vocabService.save(translateData.surface);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error("Save vocab error", err);
      alert("Lỗi khi lưu từ vựng");
    } finally {
      setSavingVocab(false);
    }
  };

  return (
    <>
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
        className="cursor-pointer hover:bg-yellow-300/40 active:bg-yellow-400/50 px-1 py-0.5 rounded-md transition-all duration-200 select-none hover:shadow-sm active:scale-95 inline-block"
      >
        {word}
      </span>

      {/* TOOLTIP POPUP - Absolute Position, Always Below */}
      {open && (
        <div
          ref={tooltipRef}
          className="absolute z-[9999] transition-all duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          {/* Arrow pointing up */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-l-8 border-r-8 border-l-transparent border-r-transparent border-b-8 border-b-emerald-400 drop-shadow-xl"></div>

          {/* Popup Content - Compact */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-[280px] max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header - Compact */}
            <div className="bg-gradient-to-r from-emerald-400 to-teal-400 px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {translateData?.audioUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const audio = new Audio(translateData.audioUrl);
                      audio.play();
                    }}
                    className="text-white hover:bg-white/20 rounded-lg p-1 transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className={`text-white hover:bg-white/20 rounded-lg p-1 transition-all duration-200 ${
                    copiedSuccess ? "bg-white/30" : ""
                  }`}
                >
                  {copiedSuccess ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveVocab();
                }}
                disabled={savingVocab}
                className={`text-white hover:bg-white/20 rounded-lg p-1 transition-all duration-200 ${
                  savedSuccess ? "bg-white/30" : ""
                }`}
              >
                {savedSuccess ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : savingVocab ? (
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
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Body - Compact */}
            <div className="p-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400 py-6">
                  <svg
                    className="animate-spin h-5 w-5 text-emerald-500"
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
                  {/* Original Word */}
                  {translateData.surface && (
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-2 border border-cyan-200">
                      <div className="text-lg font-bold text-cyan-700">
                        {translateData.surface}
                      </div>
                    </div>
                  )}

                  {/* Translation */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-200">
                    <div className="text-base font-bold text-emerald-700">
                      {translateData.translated}
                    </div>
                  </div>

                  {/* Always show full details */}
                  {translateData.reading && (
                    <div className="bg-pink-50 rounded-lg px-2 py-1.5 border border-pink-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-pink-700 uppercase">
                          KANJI
                        </span>
                        <span className="text-xs font-bold text-pink-600">
                          {translateData.reading}
                        </span>
                      </div>
                    </div>
                  )}

                  {translateData.romaji && (
                    <div className="bg-purple-50 rounded-lg px-2 py-1.5 border border-purple-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-purple-700 uppercase">
                          ROMAJI
                        </span>
                        <span className="text-xs font-medium text-purple-600">
                          {translateData.romaji}
                        </span>
                      </div>
                    </div>
                  )}

                  {translateData.partOfSpeech && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">
                        LOẠI:
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-300">
                        {translateData.partOfSpeech}
                      </span>
                    </div>
                  )}

                  <a
                    href={`https://mazii.net/vi-VN/search/word/javi/${encodeURIComponent(
                      translateData.surface
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-blue-600 hover:text-blue-700 py-2 px-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 border border-blue-200"
                  >
                    <img
                      src="https://mazii.net/favicon.ico"
                      alt="Mazii"
                      className="w-4 h-4"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span>Tra từ điển Mazii</span>
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
