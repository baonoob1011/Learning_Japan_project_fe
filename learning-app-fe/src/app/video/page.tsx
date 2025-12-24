"use client";
import { useRouter } from "next/navigation";

import React, { useState } from "react";
import {
  Search,
  Video,
  Play,
  Clock,
  Users,
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
} from "lucide-react";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  views: number | string;
  duration: string;
  tag: string;
  uploadTime: string;
  isDark: boolean; // ✅ THÊM
}
const VideoCard: React.FC<VideoCardProps> = ({
  title,
  thumbnail,
  views,
  duration,
  tag,
  uploadTime,
  isDark, // ✅ THÊM
}) => (
  <div
    className={`${
      isDark ? "bg-gray-800" : "bg-white"
    } rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group`}
  >
    <div className="relative">
      <img src={thumbnail} alt={title} className="w-full h-40 object-cover" />
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {duration}
      </div>
      <div className="absolute top-2 left-2">
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          {tag}
        </span>
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
          <Play className="w-6 h-6 text-teal-500 ml-1" />
        </div>
      </div>
    </div>
    <div className="p-4">
      <h3
        className={`font-semibold ${
          isDark ? "text-gray-100" : "text-gray-800"
        } text-sm line-clamp-2 mb-2`}
      >
        {title}
      </h3>
      <div
        className={`flex items-center gap-3 text-xs ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {views}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {uploadTime}
        </div>
      </div>
    </div>
  </div>
);

export default function VideoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JA");
  const [activeTab, setActiveTab] = useState("Toàn bộ");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

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

  const videos = [
    {
      title:
        "Real Japanese for Restaurants (Part 2) | Japanese Listening Practice",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      views: "4",
      duration: "16:32",
      tag: "Mới bắt đầu",
      uploadTime: "an hour ago",
    },
    {
      title:
        "Real Japanese for Restaurants (Part1) | Japanese Listening Practice",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      views: "20",
      duration: "14:15",
      tag: "Mới bắt đầu",
      uploadTime: "an hour ago",
    },
    {
      title:
        "[20-min] Listen to Transportation🚃 Phrases in Japanese - Learn 70+ Japanese Phrases",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      views: "4",
      duration: "21:13",
      tag: "Mới bắt đầu",
      uploadTime: "an hour ago",
    },
    {
      title:
        "Real Japanese for Convenience Store🏪 | Japanese Listening Practice",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      views: "1",
      duration: "18:04",
      tag: "Mới bắt đầu",
      uploadTime: "an hour ago",
    },
    {
      title:
        "Japanese Podcast | What do Japanese People REALLY Think of Japan?",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      views: "4.1K",
      duration: "10:23",
      tag: "Podcast",
      uploadTime: "23 days ago",
    },
    {
      title: "Japanese Podcast | What is IKIGAI? | Japanese Culture Explained",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      views: "4.4K",
      duration: "09:42",
      tag: "Podcast",
      uploadTime: "a month ago",
    },
  ];

  return (
    <div
      className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-72" : "w-20"} ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-r transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
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

        {/* Streak */}
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

        {/* Menu */}
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
              className={`w-full flex items-center gap-3 px-4 py-3 ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-50"
              } rounded-xl transition`}
            >
              <Clock className="w-5 h-5" />
              {sidebarOpen && <span>Xem gần đây</span>}
            </button>

            {/* ✅ Luyện đề – Y CHANG Danh sách video */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-medium hover:bg-emerald-100 transition"
              onClick={() => router.push("/practice")}
            >
              <BookOpen className="w-5 h-5" />
              {sidebarOpen && <span>Luyện đề</span>}
            </button>
          </div>
        </div>

        {/* Language Selector */}
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

        {/* Upgrade Button */}
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
        {/* Header */}
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

          {/* Search and Filters */}
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
                  placeholder="Dán link Youtube để bắt đầu"
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

              <select
                className={`px-4 py-3 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-700"
                } border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400`}
              >
                <option>Chọn ngôn ngữ</option>
                <option>Tiếng Nhật</option>
                <option>Tiếng Anh</option>
              </select>

              <select
                className={`px-4 py-3 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-700"
                } border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400`}
              >
                <option>Chọn phụ đề</option>
                <option>Có phụ đề</option>
                <option>Không phụ đề</option>
              </select>

              <button className="px-6 py-3 bg-gradient-to-r from-teal-400 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center gap-2">
                <Video className="w-4 h-4" />
                Tạo video
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Video Grid */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video, index) => (
              <VideoCard key={index} {...video} isDark={isDarkMode} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
