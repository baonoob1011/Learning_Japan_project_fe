"use client";
import { youtubeService } from "@/services/videoService";
import { useRouter, useSearchParams } from "next/navigation";

import React, { useState, useEffect } from "react";
import {
  Search,
  Video,
  Play,
  Clock,
  Star,
  ChevronLeft,
  Menu,
  Bell,
  Gift,
  Settings,
  Globe,
  ChevronDown,
  BookOpen,
  Sun,
  Moon,
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
    // Extract video ID from various YouTube URL formats
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
        {/* Header */}
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

        {/* Video Player */}
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={getYouTubeEmbedUrl(video.urlVideo)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Video Info */}
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
    // Extract video ID and return thumbnail
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/
    );
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
    }
    // Fallback gradient
    return null;
  };

  const thumbnailUrl = getYouTubeThumbnail(video.urlVideo);

  const getThumbnailGradient = (videoId: string) => {
    const colors = [
      "from-blue-400 to-purple-500",
      "from-green-400 to-teal-500",
      "from-orange-400 to-red-500",
      "from-pink-400 to-rose-500",
      "from-indigo-400 to-blue-500",
      "from-yellow-400 to-orange-500",
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
        {/* Thumbnail */}
        {thumbnailUrl ? (
          <div className="w-full h-40 relative bg-gray-200">
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to gradient if image fails to load
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

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
            <Play className="w-7 h-7 text-teal-500 ml-1" />
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
  const [selectedLanguage, setSelectedLanguage] = useState("JA");
  const [activeTab, setActiveTab] = useState("Toàn bộ");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [videos, setVideos] = useState<YoutubeVideoSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] =
    useState<YoutubeVideoSummary | null>(null);

  const languages = [
    { code: "JA", label: "🇯🇵 Tiếng Nhật", flag: "🇯🇵" },
    { code: "EN", label: "🇺🇸 Tiếng Anh", flag: "🇺🇸" },
    { code: "ZH-CN", label: "🇨🇳 Tiếng Trung", flag: "🇨🇳" },
    { code: "KO", label: "🇰🇷 Tiếng Hàn", flag: "🇰🇷" },
  ];

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
    router.push(`/video/${video.id}`);
  };

  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isDark={isDarkMode}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-72" : "w-20"} ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-r transition-all duration-300 flex flex-col`}
      >
        <div
          className={`p-4 ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } border-b flex items-center justify-between`}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐸</span>
              </div>
              <div>
                <div className="text-emerald-500 font-bold text-lg leading-tight">
                  Goro
                </div>
                <div className="text-teal-400 font-bold text-lg leading-tight -mt-1">
                  Domo
                </div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🐸</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${
              isDarkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {sidebarOpen && (
          <div
            className={`p-4 ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            } border-b`}
          >
            <div
              className={`${
                isDarkMode
                  ? "from-yellow-900/30 to-orange-900/30"
                  : "from-yellow-50 to-orange-50"
              } bg-gradient-to-r rounded-xl p-3`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Streak
                </span>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="flex items-baseline gap-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded ${
                      i < currentStreak
                        ? "bg-gradient-to-t from-emerald-400 to-emerald-300"
                        : isDarkMode
                        ? "bg-gray-700"
                        : "bg-gray-200"
                    } flex items-end justify-center pb-1`}
                  >
                    <Star
                      className={`w-3 h-3 ${
                        i < currentStreak
                          ? "text-white"
                          : isDarkMode
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                      fill={i < currentStreak ? "currentColor" : "none"}
                    />
                  </div>
                ))}
              </div>
              <div
                className={`flex justify-between mt-2 text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <span>Th2</span>
                <span>Th3</span>
                <span>Th4</span>
                <span>Th5</span>
                <span>Th6</span>
                <span>Th7</span>
                <span>CN</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-medium hover:bg-emerald-100 transition">
              <Video className="w-5 h-5" />
              {sidebarOpen && <span>Danh sách video</span>}
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-50"
              } rounded-xl transition`}
            >
              <Play className="w-5 h-5" />
              {sidebarOpen && <span>Video của tôi</span>}
            </button>
            <button
              onClick={() => router.push("/learningProgress")}
              className={`w-full flex items-center gap-3 px-4 py-3 ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-50"
              } rounded-xl transition`}
            >
              <Clock className="w-5 h-5" />
              {sidebarOpen && <span>Xem gần đây</span>}
            </button>
            <button
              onClick={() => router.push("/practice")}
              className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-medium hover:bg-emerald-100 transition"
            >
              <BookOpen className="w-5 h-5" />
              {sidebarOpen && <span>Luyện đề</span>}
            </button>
          </div>
        </div>

        {sidebarOpen && (
          <div
            className={`p-4 ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            } border-t`}
          >
            <div
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } mb-2`}
            >
              Language
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                    selectedLanguage === lang.code
                      ? "bg-emerald-500 text-white"
                      : isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {lang.flag} {lang.code}
                </button>
              ))}
            </div>
          </div>
        )}

        {sidebarOpen && (
          <div className="p-4">
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              Nâng cấp Plus
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className={`${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } border-b px-6 py-4`}
        >
          <div className="flex items-center justify-between mb-4">
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Luyện Shadowing để dàng thông qua bất kỳ video nào bạn yêu thích
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-lg transition`}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                className={`p-2 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-lg transition`}
              >
                <Bell
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                />
              </button>
              <button
                className={`p-2 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-lg transition`}
              >
                <Settings
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                <Globe className="w-4 h-4" />
                VN
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-xl">🐸</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex gap-3 bg-teal-500 text-white px-4 py-3 rounded-xl">
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-teal-500 rounded-lg font-medium">
                <Video className="w-4 h-4" />
                Youtube
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-white hover:bg-teal-600 rounded-lg font-medium transition">
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
                      : "bg-white border-gray-300 text-gray-700"
                  } border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400`}
                />
                <Search
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-400"
                  }`}
                />
              </div>

              <button
                onClick={fetchVideos}
                className="px-6 py-3 bg-gradient-to-r from-teal-400 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2"
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
              : "bg-white border-gray-200"
          } border-b px-6 py-3 overflow-x-auto`}
        >
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  activeTab === tab.label
                    ? "bg-teal-500 text-white"
                    : isDarkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h2
              className={`text-xl font-bold ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              N5 - N4
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
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
                  className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
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
                    isDarkMode ? "text-gray-600" : "text-gray-400"
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
