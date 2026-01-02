"use client";
import { youtubeService } from "@/services/videoService";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import Sidebar from "@/components/Sidebar";

import React, { useState, useEffect } from "react";
import {
  Search,
  Video,
  Play,
  Clock,
  Bell,
  Gift,
  Settings,
  Globe,
  ChevronDown,
  AlertCircle,
  X,
} from "lucide-react";

// Types matching backend response
interface YoutubeVideoSummary {
  id: string;
  title: string;
  urlVideo: string;
  duration: string;
  createdAt: string;
}

interface VideoCardProps {
  video: YoutubeVideoSummary;
  isDark: boolean;
  onClick: () => void;
}

// Video Modal Component
interface VideoModalProps {
  video: YoutubeVideoSummary;
  isDark: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ video, isDark, onClose }) => {
  const getYouTubeEmbedUrl = (url: string) => {
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/
    );
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`${
          isDark ? "bg-gray-800" : "bg-white"
        } rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-gray-100" : "text-gray-800"
            } line-clamp-1`}
          >
            {video.title}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition ${
              isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <X
              className={`w-5 h-5 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={getYouTubeEmbedUrl(video.urlVideo)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-4">
          <div
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(video.duration)}
              </span>
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Video Card Component
const VideoCard: React.FC<VideoCardProps> = ({ video, isDark, onClick }) => {
  const getYouTubeThumbnail = (url: string) => {
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/
    );
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  const thumbnailUrl = getYouTubeThumbnail(video.urlVideo);

  const getThumbnailGradient = (videoId: string) => {
    const colors = [
      "from-cyan-400 to-blue-500",
      "from-teal-400 to-cyan-500",
      "from-blue-400 to-indigo-500",
      "from-cyan-500 to-teal-600",
      "from-sky-400 to-blue-500",
      "from-teal-500 to-emerald-500",
    ];
    let hash = 0;
    for (let i = 0; i < videoId.length; i++) {
      hash = videoId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div
      onClick={onClick}
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group`}
    >
      <div className="relative">
        {thumbnailUrl ? (
          <div className="w-full h-40 relative bg-gray-200">
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add(
                  "bg-gradient-to-br",
                  getThumbnailGradient(video.id)
                );
              }}
            />
          </div>
        ) : (
          <div
            className={`w-full h-40 bg-gradient-to-br ${getThumbnailGradient(
              video.id
            )} flex items-center justify-center`}
          >
            <Play className="w-16 h-16 text-white/80" />
          </div>
        )}

        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
            <Play className="w-7 h-7 text-cyan-500 ml-1" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3
          className={`font-semibold ${
            isDark ? "text-gray-100" : "text-gray-800"
          } text-sm line-clamp-2 mb-2 min-h-[40px]`}
        >
          {video.title}
        </h3>
        <div
          className={`flex items-center gap-3 text-xs ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(video.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility functions
const formatDuration = (duration?: string): string => {
  if (!duration) return "00:00";
  if (duration.includes(":")) return duration;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "00:00";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "Gần đây";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
};

// Main Component
export default function VideoListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Toàn bộ");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [videos, setVideos] = useState<YoutubeVideoSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] =
    useState<YoutubeVideoSummary | null>(null);

  const tabs = [
    { icon: "✨", label: "Toàn bộ" },
    { icon: "⏰", label: "Tin tức" },
    { icon: "🔥", label: "Mới bắt đầu" },
    { icon: "🎙️", label: "Podcast" },
    { icon: "💻", label: "Công nghệ" },
    { icon: "💼", label: "Kinh doanh" },
    { icon: "🎯", label: "TED" },
    { icon: "⚖️", label: "Ngữ pháp" },
    { icon: "🎬", label: "Hoạt hình" },
    { icon: "🧠", label: "Video ngắn" },
    { icon: "🎭", label: "Phim" },
    { icon: "🏫", label: "Du lịch" },
    { icon: "🎵", label: "Văn hóa" },
    { icon: "🍱", label: "Ẩm thực" },
    { icon: "😊", label: "Kids" },
  ];

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    try {
      const videosData = await youtubeService.getAll();
      setVideos(videosData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải video. Vui lòng thử lại."
      );
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoClick = (video: YoutubeVideoSummary) => {
    youtubeService.getById(video.id).catch((err) => console.error(err));
    router.push(`/video/${video.id}`);
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex h-screen ${
        isDarkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50"
      }`}
    >
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isDark={isDarkMode}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isDarkMode={isDarkMode}
        currentStreak={currentStreak}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white/80 backdrop-blur-sm border-cyan-100"
          } border-b px-6 py-4 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h1
              className={`text-2xl font-bold ${
                isDarkMode
                  ? "text-gray-100"
                  : "bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent"
              }`}
            >
              Luyện Shadowing để dàng thông qua bất kỳ video nào bạn yêu thích
            </h1>
            <div className="flex items-center gap-3">
              <ThemeToggle
                isDarkMode={isDarkMode}
                onToggle={() => setIsDarkMode(!isDarkMode)}
              />
              <button
                className={`p-2 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-50"
                } rounded-lg transition`}
              >
                <Bell
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-300" : "text-cyan-600"
                  }`}
                />
              </button>
              <button
                className={`p-2 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-cyan-50"
                } rounded-lg transition`}
              >
                <Settings
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-300" : "text-cyan-600"
                  }`}
                />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-lg hover:from-rose-500 hover:to-pink-600 transition shadow-md">
                <Globe className="w-4 h-4" />
                VN
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-40"></div>
                <img
                  src="/logo-cat.png"
                  alt="NIBO Academy"
                  className="w-10 h-10 object-contain relative z-10 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex gap-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 text-white px-4 py-3 rounded-xl shadow-lg">
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-500 rounded-lg font-medium shadow-md hover:shadow-lg transition transform hover:scale-105">
                <Video className="w-4 h-4" />
                Youtube
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/20 rounded-lg font-medium transition">
                <Play className="w-4 h-4" />
                Tải lên
              </button>
            </div>

            <div className="flex-1 flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm video..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-3 ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100"
                      : "bg-white border-cyan-200 text-gray-700"
                  } border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition`}
                />
                <Search
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-cyan-400"
                  }`}
                />
              </div>

              <button
                onClick={fetchVideos}
                className="px-6 py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-xl transition transform hover:scale-105 flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Tải lại
              </button>
            </div>
          </div>
        </div>

        <div
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white/80 backdrop-blur-sm border-cyan-100"
          } border-b px-6 py-3 overflow-x-auto shadow-md`}
        >
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.label
                    ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg"
                    : isDarkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-cyan-50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p
                  className={`mt-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Đang tải video...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle
                  className={`w-12 h-12 mx-auto mb-4 ${
                    isDarkMode ? "text-red-400" : "text-red-500"
                  }`}
                />
                <p
                  className={`text-lg font-medium mb-2 ${
                    isDarkMode ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  Không thể tải video
                </p>
                <p
                  className={`mb-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {error}
                </p>
                <button
                  onClick={fetchVideos}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:shadow-lg transition"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Video
                  className={`w-12 h-12 mx-auto mb-4 ${
                    isDarkMode ? "text-gray-600" : "text-cyan-400"
                  }`}
                />
                <p
                  className={`text-lg ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {searchQuery
                    ? "Không tìm thấy video nào"
                    : "Chưa có video nào"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isDark={isDarkMode}
                  onClick={() => handleVideoClick(video)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
