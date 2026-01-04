"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import Sidebar from "@/components/Sidebar";
import UserDropdown from "@/components/UserDropdown";
import { youtubeService, YoutubeVideoSummary } from "@/services/videoService";
import {
  Menu,
  BookmarkCheck,
  Play,
  Clock,
  Trash2,
  Video,
  Loader2,
  Clipboard,
} from "lucide-react";

export default function SavedVideosPage() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentStreak] = useState(4);
  const [isMounted, setIsMounted] = useState(false);

  const [videos, setVideos] = useState<YoutubeVideoSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPasting, setIsPasting] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadSavedVideos();
    }
  }, [isMounted]);

  const loadSavedVideos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await youtubeService.getMySavedVideos();
      setVideos(data);
    } catch (err) {
      console.error("❌ Failed to load saved videos:", err);
      setError("Không thể tải danh sách video đã lưu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    if (deletingId) return;

    try {
      setDeletingId(videoId);
      await youtubeService.removeSavedVideo(videoId);
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      console.log("✅ Video removed successfully");
    } catch (err) {
      console.error("❌ Failed to remove video:", err);
      alert("Không thể xóa video. Vui lòng thử lại!");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      setIsPasting(true);
      const text = await navigator.clipboard.readText();
      setYoutubeUrl(text);
    } catch (err) {
      console.error("Không thể đọc clipboard:", err);
      alert("Không thể dán từ clipboard. Vui lòng dán thủ công!");
    } finally {
      setIsPasting(false);
    }
  };

  const handleAddVideo = async () => {
    if (!youtubeUrl.trim() || isProcessing) return;

    try {
      setIsProcessing(true);

      // Extract video ID from URL
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        alert("Link YouTube không hợp lệ!");
        return;
      }

      // Navigate to video learning page
      router.push(`/video-learning/${videoId}`);
    } catch (err) {
      console.error("❌ Failed to process video:", err);
      alert("Không thể xử lý video. Vui lòng thử lại!");
    } finally {
      setIsProcessing(false);
      setYoutubeUrl("");
    }
  };

  const extractVideoId = (url: string): string | null => {
    // Support multiple YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If it's just the video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }

    return null;
  };

  const handleVideoClick = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  const getYoutubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const formatDuration = (duration: string) => {
    // Assuming duration is in format like "PT5M30S" or similar
    return duration;
  };

  // Prevent hydration mismatch - show loading until mounted
  if (!isMounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 flex transition-colors duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800"
          : "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"
      }`}
    >
      <Sidebar
        sidebarOpen={showSidebar}
        setSidebarOpen={setShowSidebar}
        isDarkMode={isDarkMode}
        currentStreak={currentStreak}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className={`backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-lg transition-colors duration-300 z-50 ${
            isDarkMode
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/80 border-cyan-100"
          }`}
        >
          <button
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-cyan-400 hover:bg-gray-700"
                : "text-cyan-500 hover:bg-cyan-50"
            }`}
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <BookmarkCheck
              className={`w-7 h-7 ${
                isDarkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
            <h1
              className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode
                  ? "from-cyan-400 to-cyan-500"
                  : "from-cyan-500 to-cyan-600"
              }`}
            >
              Video đã lưu
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-cyan-100 text-cyan-700"
              }`}
            >
              {videos.length} video
            </span>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[10000]">
            <UserDropdown
              isDark={isDarkMode}
              onToggleDarkMode={toggleDarkMode}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* YouTube URL Input Section */}
          <div
            className={`w-full max-w-6xl mx-auto mb-8 p-8 rounded-2xl backdrop-blur-sm border-2 ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-800/90 via-slate-800/90 to-gray-900/90 border-cyan-500/30"
                : "bg-gradient-to-br from-white via-cyan-50/50 to-blue-50/50 border-cyan-300"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 text-center tracking-wide bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode
                  ? "from-cyan-400 to-cyan-500"
                  : "from-cyan-500 to-cyan-600"
              }`}
            >
              DÁN LINK YOUTUBE ĐỂ BẮT ĐẦU
            </h2>
            <div className="flex gap-3 items-stretch">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddVideo()}
                placeholder="Dán link Youtube để bắt đầu"
                disabled={isProcessing || isPasting}
                className={`flex-1 min-w-0 px-6 py-4 text-base rounded-xl border-2 font-medium transition-all outline-none ${
                  isDarkMode
                    ? "bg-gray-700/80 border-gray-600 text-gray-200 placeholder-gray-400 focus:border-cyan-400 focus:bg-gray-600/80"
                    : "bg-white border-cyan-200 text-gray-900 placeholder-gray-500 focus:border-cyan-400 focus:bg-cyan-50/70"
                } ${
                  isProcessing || isPasting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              />

              {/* Paste button */}
              <button
                onClick={handlePasteFromClipboard}
                disabled={isProcessing || isPasting}
                className={`px-5 py-4 rounded-xl font-bold text-base transition-all flex-shrink-0 flex items-center gap-2 ${
                  isPasting
                    ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white cursor-wait"
                    : isDarkMode
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 hover:scale-105 active:scale-95"
                    : "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 hover:scale-105 active:scale-95"
                } ${
                  isProcessing || isPasting
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                title="Dán từ clipboard"
              >
                {isPasting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="hidden sm:inline">Đang dán...</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-5 h-5" />
                    <span className="hidden sm:inline">Dán</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAddVideo}
                disabled={!youtubeUrl.trim() || isProcessing || isPasting}
                className={`px-12 py-4 rounded-xl font-bold text-base transition-all flex-shrink-0 ${
                  isProcessing
                    ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white cursor-wait"
                    : !youtubeUrl.trim()
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-white text-cyan-500 hover:scale-105 active:scale-95"
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  "Bắt đầu"
                )}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2
                className={`w-12 h-12 animate-spin ${
                  isDarkMode ? "text-cyan-400" : "text-cyan-600"
                }`}
              />
              <p
                className={`mt-4 text-lg ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Đang tải video...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div
                className={`text-6xl mb-4 ${
                  isDarkMode ? "opacity-50" : "opacity-40"
                }`}
              >
                ❌
              </div>
              <p
                className={`text-lg font-medium ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {error}
              </p>
              <button
                onClick={loadSavedVideos}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-6xl mb-4 opacity-50">📚</div>
              <p
                className={`text-xl font-medium mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Chưa có video nào được lưu
              </p>
              <p
                className={`text-sm mb-6 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Bắt đầu lưu video để học sau
              </p>
              <button
                onClick={() => router.push("/video")}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-full font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Video className="w-5 h-5" />
                Khám phá video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`group rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer border-2 ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/20"
                      : "bg-white border-gray-200 hover:border-cyan-400 hover:shadow-xl"
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-video overflow-hidden"
                    onClick={() => handleVideoClick(video.id)}
                  >
                    <img
                      src={getYoutubeThumbnail(video.id)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/640x360?text=Video";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded font-medium">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3
                      className={`font-semibold text-sm line-clamp-2 mb-2 group-hover:text-cyan-500 transition-colors ${
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      }`}
                      onClick={() => handleVideoClick(video.id)}
                    >
                      {video.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock
                          className={`w-4 h-4 ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {new Date(video.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVideo(video.id);
                        }}
                        disabled={deletingId === video.id}
                        className={`p-2 rounded-lg transition-all ${
                          deletingId === video.id
                            ? "opacity-50 cursor-not-allowed"
                            : isDarkMode
                            ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            : "hover:bg-red-50 text-red-500 hover:text-red-600"
                        }`}
                        title="Xóa khỏi danh sách đã lưu"
                      >
                        {deletingId === video.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
