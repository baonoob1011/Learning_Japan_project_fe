"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import VideoPlayerSection from "@/components/VideoPlayerSection";
import DictationPractice from "@/components/Dictation";
import Sidebar from "@/components/Sidebar";
import { YoutubePlayerHandle } from "@/components/YoutubePlayer";
import AutoScrollToggle from "@/components/AutoScrollToggle";
import PronunciationPractice from "@/components/PronunciationPractice";
import VocabularySidebar from "@/components/VocabularySidebar";
import {
  Video,
  X,
  FileText,
  Menu,
  Play,
  Volume2,
  BookOpen,
} from "lucide-react";

import {
  transcriptService,
  YoutubeTranscriptResponse,
  TranscriptDTO,
} from "@/services/transcriptService";

type ViewMode = "video" | "dictation" | "pronunciation";

export default function VideoLearningPage() {
  const router = useRouter();
  const pathname = usePathname();
  const videoId = pathname.split("/").pop() || "";
  const [seekTimeMs, setSeekTimeMs] = useState<number | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);

  const [showSidebar, setShowSidebar] = useState(true);
  const [showVocabSidebar, setShowVocabSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("video");
  const [transcripts, setTranscripts] = useState<TranscriptDTO[]>([]);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");
  const [isDarkMode] = useState(false);
  const [currentStreak] = useState(4);

  // Refs for auto-scroll and YouTube player
  const transcriptRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayerHandle | null>(null);

  // State for auto-scroll
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSeekToTime = (timeMs: number) => {
    setSeekTimeMs(timeMs);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // Find active transcript
  const activeTranscript = transcripts.find(
    (t) => currentTimeMs >= t.startOffset && currentTimeMs < t.endOffset
  );

  // Auto-scroll logic
  useEffect(() => {
    if (
      autoScrollEnabled &&
      !isUserScrolling &&
      activeTranscript &&
      transcriptRefs.current[activeTranscript.id]
    ) {
      const element = transcriptRefs.current[activeTranscript.id];
      const container = scrollContainerRef.current;

      if (element && container) {
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const containerHeight = container.clientHeight;
        const scrollTop = elementTop - containerHeight / 2 + elementHeight / 2;

        container.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      }
    }
  }, [activeTranscript, isUserScrolling, autoScrollEnabled]);

  // Fetch transcripts
  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;

    async function fetchTranscript() {
      try {
        const data: YoutubeTranscriptResponse =
          await transcriptService.getTranscripts(videoId);

        if (isMounted) {
          setTranscripts(data.transcriptsDTOS);
          setVideoTitle(data.title);
        }
      } catch (err) {
        console.error("Failed to fetch transcripts", err);
        if (isMounted) {
          setTranscripts([]);
          setVideoTitle("Không tải được video");
        }
      }
    }

    fetchTranscript();

    return () => {
      isMounted = false;
    };
  }, [videoId]);

  // Handle user scroll
  const handleUserScroll = () => {
    if (!autoScrollEnabled) return;

    setIsUserScrolling(true);

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000);
  };

  // Toggle auto-scroll
  const toggleAutoScroll = () => {
    setAutoScrollEnabled((prev) => !prev);
    setIsUserScrolling(false);
  };

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 0 && text.length < 50) {
        setSelectedText(text);
        setShowVocabSidebar(true);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex">
      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={showSidebar}
        setSidebarOpen={setShowSidebar}
        isDarkMode={isDarkMode}
        currentStreak={currentStreak}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-center flex-shrink-0 relative">
          {/* Menu button - absolute left */}
          <button
            className="lg:hidden absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center Navigation Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("video")}
              className={`px-8 py-3.5 rounded-full text-base font-medium flex items-center gap-3 transition-all ${
                viewMode === "video"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                  : "text-gray-700 hover:bg-gray-100 bg-white"
              }`}
            >
              <Video className="w-5 h-5" />
              <span>Video</span>
            </button>

            <button
              onClick={() => setViewMode("dictation")}
              className={`px-8 py-3.5 rounded-full text-base font-medium flex items-center gap-3 transition-all ${
                viewMode === "dictation"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                  : "text-gray-700 hover:bg-gray-100 bg-white"
              }`}
            >
              <span className="text-lg">🎯</span>
              <span>Chép chính tả</span>
            </button>

            <button
              onClick={() => setViewMode("pronunciation")}
              className={`px-8 py-3.5 rounded-full text-base font-medium flex items-center gap-3 transition-all ${
                viewMode === "pronunciation"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                  : "text-gray-700 hover:bg-gray-100 bg-white"
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span>Phát âm</span>
            </button>

            <button className="px-8 py-3.5 text-gray-700 hover:bg-gray-100 rounded-full text-base font-medium flex items-center gap-3 transition-all bg-white">
              <span className="text-lg">❓</span>
              <span>Bài tập</span>
            </button>

            <button className="px-8 py-3.5 text-gray-700 hover:bg-gray-100 rounded-full text-base font-medium flex items-center gap-3 transition-all bg-white">
              <span className="text-lg">📊</span>
              <span>So đồ</span>
            </button>
          </div>

          {/* Action buttons - absolute right */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <FileText className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/video")}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area - Below Header */}
        <div className="flex-1 flex overflow-hidden">
          {/* Vocabulary Sidebar - Below Header */}
          {showVocabSidebar && (
            <VocabularySidebar
              videoId={videoId}
              isVisible={showVocabSidebar}
              onToggle={() => setShowVocabSidebar(false)}
              selectedText={selectedText}
              onAddFromSelection={setSelectedText}
            />
          )}

          {/* Toggle button when vocab sidebar is hidden */}
          {!showVocabSidebar && (
            <button
              onClick={() => setShowVocabSidebar(true)}
              className={`fixed ${
                showSidebar ? "left-72" : "left-24"
              } top-1/2 -translate-y-1/2 z-40 w-6 h-12 bg-white border border-gray-200 rounded-r-lg flex items-center justify-center hover:bg-gray-50 transition-all shadow-sm`}
              title="Mở từ vựng"
            >
              <BookOpen className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Video Player Section */}
          {(viewMode === "video" ||
            viewMode === "dictation" ||
            viewMode === "pronunciation") && (
            <VideoPlayerSection
              playerRef={playerRef}
              videoId={videoId}
              videoTitle={videoTitle}
              transcripts={transcripts}
              seekTimeMs={seekTimeMs}
              onSeekHandled={() => setSeekTimeMs(null)}
              onTimeUpdate={setCurrentTimeMs}
              hideWordBar={
                viewMode === "dictation" || viewMode === "pronunciation"
              }
            />
          )}

          {/* Right: Transcript Sidebar (only in video mode) */}
          {viewMode === "video" && (
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
              {/* Transcript Header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Phụ đề</h2>
                  <div className="flex items-center gap-2">
                    <AutoScrollToggle
                      autoScrollEnabled={autoScrollEnabled}
                      onToggle={toggleAutoScroll}
                    />
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Transcript List with Auto-scroll */}
              <div
                ref={scrollContainerRef}
                onScroll={handleUserScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
              >
                {transcripts.map((t) => {
                  const isActive = activeTranscript?.id === t.id;

                  return (
                    <div
                      key={t.id}
                      ref={(el) => {
                        transcriptRefs.current[t.id] = el;
                      }}
                      className={`group p-3 rounded-lg cursor-pointer transition-all duration-300 border ${
                        isActive
                          ? "bg-emerald-50 border-emerald-300 shadow-md scale-105"
                          : "hover:bg-gray-50 border-transparent hover:border-emerald-200"
                      }`}
                      onClick={() => handleSeekToTime(t.startOffset)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                            isActive
                              ? "bg-emerald-500"
                              : "bg-gray-100 group-hover:bg-emerald-100"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeekToTime(t.startOffset);
                          }}
                        >
                          <Play
                            className={`w-3 h-3 ${
                              isActive
                                ? "text-white"
                                : "text-gray-600 group-hover:text-emerald-600"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-medium ${
                            isActive ? "text-emerald-700" : "text-gray-500"
                          }`}
                        >
                          {formatTime(t.startOffset)}
                        </span>
                        {isActive && (
                          <div className="ml-auto">
                            <div className="flex gap-1">
                              <div className="w-1 h-3 bg-emerald-500 rounded animate-pulse"></div>
                              <div
                                className="w-1 h-3 bg-emerald-500 rounded animate-pulse"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="w-1 h-3 bg-emerald-500 rounded animate-pulse"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <p
                        className={`leading-relaxed text-sm ${
                          isActive
                            ? "text-gray-900 font-medium"
                            : "text-gray-900"
                        }`}
                      >
                        {t.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right: Dictation Component */}
          {viewMode === "dictation" && (
            <DictationPractice
              transcripts={transcripts}
              videoId={videoId}
              playerRef={playerRef}
            />
          )}

          {/* Right: Pronunciation Component */}
          {viewMode === "pronunciation" && (
            <PronunciationPractice
              transcripts={transcripts}
              videoId={videoId}
              playerRef={playerRef}
            />
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
