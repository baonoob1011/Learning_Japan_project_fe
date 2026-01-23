"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { youtubeService, YoutubeVideoSummary } from "@/services/videoService";
import {
  History,
  Play,
  Video,
  Loader2,
  Eye,
  Clock,
  Calendar,
} from "lucide-react";

type RecentlyViewedVideo = YoutubeVideoSummary & {
  lastViewedAt?: string;
  completionPercentage?: number;
  completed?: boolean;
};

export default function RecentlyViewedPage() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentStreak] = useState(4);
  const [isMounted, setIsMounted] = useState(false);

  const [videos, setVideos] = useState<RecentlyViewedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ State để force re-render mỗi phút
  const [currentTime, setCurrentTime] = useState(new Date());

  /* ===================== MOUNT FIX ===================== */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadRecentlyViewedVideos();
    }
  }, [isMounted]);

  /* ===================== ✅ REALTIME TIME UPDATE (mỗi 1 phút) ===================== */
  useEffect(() => {
    if (!isMounted) return;

    // Cập nhật thời gian mỗi 1 phút để tự động update "X phút trước"
    const timeUpdateInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60 seconds = 1 phút

    return () => clearInterval(timeUpdateInterval);
  }, [isMounted]);

  /* ===================== ✅ REALTIME VIDEO UPDATES ===================== */
  useEffect(() => {
    if (!isMounted) return;

    // Auto-refresh every 10 seconds when page is visible
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadRecentlyViewedVideos();
      }
    }, 10000); // 10 seconds

    // Refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadRecentlyViewedVideos();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMounted]);

  /* ===================== ✅ LISTEN TO STORAGE EVENTS ===================== */
  useEffect(() => {
    if (!isMounted) return;

    const handleStorageChange = (e: StorageEvent) => {
      // Listen for video progress updates
      if (
        e.key?.startsWith("video_progress_") ||
        e.key === "video_progress_update"
      ) {
        console.log("📡 Video progress updated, refreshing list...");
        loadRecentlyViewedVideos();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isMounted]);

  /* ===================== ✅ LISTEN TO CUSTOM EVENTS ===================== */
  useEffect(() => {
    if (!isMounted) return;

    const handleVideoProgressUpdate = () => {
      console.log("📡 Video progress update event received");
      loadRecentlyViewedVideos();
    };

    // Listen for custom events from video player
    window.addEventListener("videoProgressUpdated", handleVideoProgressUpdate);

    return () => {
      window.removeEventListener(
        "videoProgressUpdated",
        handleVideoProgressUpdate
      );
    };
  }, [isMounted]);

  /* ===================== LOAD DATA ===================== */
  const loadRecentlyViewedVideos = async () => {
    try {
      // Don't show loading spinner for background updates
      const isInitialLoad = videos.length === 0;
      if (isInitialLoad) {
        setIsLoading(true);
      }
      setError(null);

      // 1️⃣ progress
      const progressList = await youtubeService.getAllVideoProgress();
      if (!progressList || progressList.length === 0) {
        setVideos([]);
        if (isInitialLoad) {
          setIsLoading(false);
        }
        return;
      }

      // 2️⃣ all videos
      const allVideos = await youtubeService.getAll();

      // 3️⃣ merge
      const merged: RecentlyViewedVideo[] = progressList
        .map((p) => {
          const video = allVideos.find((v) => v.id === p.videoId);
          if (!video) return null;

          const durationSeconds = parseDurationToSeconds(video.duration);
          const completionPercentage =
            durationSeconds > 0
              ? Math.min(
                  100,
                  Math.floor((p.lastPositionSeconds / durationSeconds) * 100)
                )
              : 0;

          return {
            ...video,
            lastViewedAt: p.lastWatchedAt,
            completionPercentage,
            completed: p.completed,
          };
        })
        .filter(Boolean) as RecentlyViewedVideo[];

      // 4️⃣ sort recent
      merged.sort(
        (a, b) =>
          new Date(b.lastViewedAt || b.createdAt).getTime() -
          new Date(a.lastViewedAt || a.createdAt).getTime()
      );

      setVideos(merged);
    } catch (err) {
      console.error("❌ Failed to load recently viewed videos:", err);
      setError("Không thể tải danh sách video đã xem");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== HELPERS ===================== */
  const handleVideoClick = (videoId: string) => {
    router.push(`/video/${videoId}`);
  };

  const getYoutubeThumbnail = (videoId: string) =>
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const formatDuration = (duration: string) => {
    const seconds = parseDurationToSeconds(duration);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  /* ===================== ✅ REALTIME TIME AGO (tự động update) ===================== */
  const getTimeAgo = (date?: string) => {
    if (!date) return "";

    const now = currentTime; // Sử dụng state currentTime để auto-update
    const viewed = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - viewed.getTime()) / 1000);

    // Dưới 1 phút
    if (diffInSeconds < 60) return "Vừa xem";

    // Phút
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    // Giờ
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    // Ngày
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;

    // Tuần
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} tuần trước`;
    }

    // Tháng
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} tháng trước`;
    }

    // Năm hoặc hiển thị ngày cụ thể
    return viewed.toLocaleDateString("vi-VN");
  };

  /* ===================== HYDRATION FIX ===================== */
  if (!isMounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
      </div>
    );
  }

  /* ===================== UI ===================== */
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
        <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

        <div
          className={`backdrop-blur-sm border-b px-6 py-3 flex items-center justify-between ${
            isDarkMode
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/80 border-cyan-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <History
              className={`w-6 h-6 ${
                isDarkMode ? "text-cyan-400" : "text-cyan-600"
              }`}
            />
            <h1
              className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                isDarkMode
                  ? "from-cyan-400 to-cyan-500"
                  : "from-cyan-500 to-cyan-600"
              }`}
            >
              Xem gần đây
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDarkMode
                  ? "bg-gray-700 text-gray-300"
                  : "bg-cyan-100 text-cyan-700"
              }`}
            >
              {videos.length} video
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2
                className={`w-12 h-12 animate-spin ${
                  isDarkMode ? "text-cyan-400" : "text-cyan-600"
                }`}
              />
              <p className="mt-4 text-lg">Đang tải video...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-lg">{error}</p>
              <button
                onClick={loadRecentlyViewedVideos}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-lg"
              >
                Thử lại
              </button>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-6xl mb-4 opacity-50">👀</div>
              <p className="text-xl font-medium mb-2">Chưa xem video nào</p>
              <button
                onClick={() => router.push("/video")}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-full flex items-center gap-2"
              >
                <Video className="w-5 h-5" />
                Khám phá video
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-w-5xl mx-auto">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`group rounded-xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer border ${
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-cyan-500"
                      : "bg-white border-gray-200 hover:border-cyan-400 hover:shadow-lg"
                  }`}
                  onClick={() => handleVideoClick(video.id)}
                >
                  <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-48 h-28 rounded-lg overflow-hidden">
                      <img
                        src={getYoutubeThumbnail(video.id)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />

                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>

                      {/* Progress Bar */}
                      {video.completionPercentage !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/50">
                          <div
                            className="h-full bg-cyan-500 transition-all duration-300"
                            style={{
                              width: `${video.completionPercentage}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3
                          className={`font-semibold text-base line-clamp-2 mb-2 ${
                            isDarkMode ? "text-gray-100" : "text-gray-900"
                          }`}
                        >
                          {video.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div
                          className={`flex items-center gap-2 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>

                        <div
                          className={`flex items-center gap-2 ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>
                            {getTimeAgo(video.lastViewedAt || video.createdAt)}
                          </span>
                        </div>

                        {video.completionPercentage !== undefined && (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                                video.completionPercentage === 100
                                  ? "bg-green-500/20 text-green-500"
                                  : "bg-cyan-500/20 text-cyan-500"
                              }`}
                            >
                              {video.completionPercentage}%
                            </span>
                          </div>
                        )}
                      </div>
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

/* ===================== UTILS ===================== */
const parseDurationToSeconds = (duration: string): number => {
  const match = duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, h, m, s] = match;
  return (
    parseInt(h || "0") * 3600 + parseInt(m || "0") * 60 + parseInt(s || "0")
  );
};
