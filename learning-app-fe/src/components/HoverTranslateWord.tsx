"use client";

import React, { useState, useRef, useEffect } from "react";
import { translateService, TranslateResult } from "@/services/translateService";

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
  const [expanded, setExpanded] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  // Update position when popup opens or word position changes
  useEffect(() => {
    if (open && wordRef.current && tooltipRef.current) {
      const updatePosition = () => {
        const rect = wordRef.current!.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current!.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Kiểm tra xem có đủ chỗ ở phía dưới không
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Nếu không đủ chỗ ở dưới HOẶC có nhiều chỗ hơn ở trên → hiện ở trên
        const shouldShowAbove =
          spaceBelow < tooltipHeight + 20 && spaceAbove > spaceBelow;
        setShowAbove(shouldShowAbove);

        setPosition({
          top: shouldShowAbove ? rect.top - tooltipHeight - 8 : rect.bottom + 8,
          left: rect.left + rect.width / 2,
        });
      };

      // Đợi một chút để tooltip render xong rồi mới tính position
      setTimeout(updatePosition, 10);

      // Update position on scroll
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
  }, [open, expanded, translateData]);

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
        setExpanded(false);
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
${translateData.reading ? `Đọc: ${translateData.reading}` : ""}
${translateData.romaji ? `Romaji: ${translateData.romaji}` : ""}
${translateData.partOfSpeech ? `Loại từ: ${translateData.partOfSpeech}` : ""}
${translateData.translated ? `Nghĩa: ${translateData.translated}` : ""}
${translateData.targetDefs ? `Định nghĩa: ${translateData.targetDefs}` : ""}
${translateData.explain ? `Giải thích: ${translateData.explain}` : ""}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
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
            setExpanded(false);
          }
        }}
        className="cursor-pointer hover:bg-yellow-300/40 active:bg-yellow-400/50 px-1.5 py-0.5 rounded-md transition-all duration-200 select-none hover:shadow-sm active:scale-95"
      >
        {word}
      </span>

      {/* TOOLTIP POPUP - Fixed Position with scroll tracking */}
      {open && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] transition-all duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          {/* Arrow - Dynamic direction based on position */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-l-transparent border-r-transparent drop-shadow-xl ${
              showAbove
                ? "-bottom-2 border-t-8 border-t-white"
                : "-top-2 border-b-8 border-b-white"
            }`}
          ></div>

          {/* Popup Content */}
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden w-[240px] max-h-[400px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 px-3 py-2 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <span className="text-white text-sm font-bold truncate max-w-[160px]">
                {translateData?.original || word}
              </span>
              <div className="flex items-center gap-2">
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
                    setOpen(false);
                    setExpanded(false);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-all duration-200 flex-shrink-0 hover:rotate-90"
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
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
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
                  {/* Translation - Main - Always show */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2.5 border border-emerald-200">
                    <div className="text-lg font-bold text-emerald-700">
                      {translateData.translated}
                    </div>
                  </div>

                  {/* Compact view - Show only Reading & Romaji */}
                  {!expanded ? (
                    <>
                      {translateData.reading && (
                        <div className="bg-pink-50 rounded-md px-2 py-1.5 border border-pink-200">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-pink-700 uppercase">
                              Kanji
                            </span>
                            <span className="text-xs font-bold text-pink-600">
                              {translateData.reading}
                            </span>
                          </div>
                        </div>
                      )}

                      {translateData.romaji && (
                        <div className="bg-purple-50 rounded-md px-2 py-1.5 border border-purple-200">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-purple-700 uppercase">
                              Romaji
                            </span>
                            <span className="text-xs font-medium text-purple-600">
                              {translateData.romaji}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Show "Xem thêm" button if there's more content */}
                      {(translateData.partOfSpeech ||
                        translateData.targetDefs ||
                        translateData.explain ||
                        translateData.audioUrl) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(true);
                          }}
                          className="w-full text-xs font-semibold text-emerald-600 hover:text-emerald-700 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all duration-200 border border-emerald-200"
                        >
                          Xem thêm ↓
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Expanded view - Show everything */}
                      <div className="space-y-1.5">
                        {translateData.reading && (
                          <div className="bg-pink-50 rounded-md px-2 py-1.5 border border-pink-200">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-pink-700 uppercase">
                                Kanji
                              </span>
                              <span className="text-xs font-bold text-pink-600">
                                {translateData.reading}
                              </span>
                            </div>
                          </div>
                        )}

                        {translateData.romaji && (
                          <div className="bg-purple-50 rounded-md px-2 py-1.5 border border-purple-200">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-purple-700 uppercase">
                                Romaji
                              </span>
                              <span className="text-xs font-medium text-purple-600">
                                {translateData.romaji}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Part of Speech */}
                      {translateData.partOfSpeech && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">
                            Loại:
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-300">
                            {translateData.partOfSpeech}
                          </span>
                        </div>
                      )}

                      {/* Target Definitions */}
                      {translateData.targetDefs && (
                        <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <svg
                              className="w-3 h-3 text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                            </svg>
                            <span className="text-[10px] font-bold text-blue-700 uppercase">
                              Định nghĩa
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 leading-snug">
                            {translateData.targetDefs}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {translateData.explain && (
                        <div className="bg-amber-50 rounded-lg p-2 border border-amber-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <svg
                              className="w-3 h-3 text-amber-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-[10px] font-bold text-amber-700 uppercase">
                              Giải thích
                            </span>
                          </div>
                          <div className="text-xs text-gray-700 leading-snug">
                            {translateData.explain}
                          </div>
                        </div>
                      )}

                      {/* Audio Button */}
                      {translateData.audioUrl && (
                        <div className="pt-2 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const audio = new Audio(translateData.audioUrl);
                              audio.play();
                            }}
                            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-xs font-semibold">
                              Phát âm
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Show "Thu gọn" button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(false);
                        }}
                        className="w-full text-xs font-semibold text-gray-600 hover:text-gray-700 py-1.5 px-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-all duration-200 border border-gray-200"
                      >
                        Thu gọn ↑
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer - Always show when has data */}
            {translateData && (
              <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 sticky bottom-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className={`w-full text-xs font-semibold flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all duration-200 ${
                    copiedSuccess
                      ? "bg-green-500 text-white scale-105"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-sm hover:shadow-md hover:scale-105"
                  }`}
                >
                  {copiedSuccess ? (
                    <>
                      <svg
                        className="w-3.5 h-3.5 animate-in zoom-in duration-200"
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
                      Đã sao chép
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
