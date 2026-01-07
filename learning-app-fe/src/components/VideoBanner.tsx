import React from "react";
import { Video, Play, Search } from "lucide-react";

// JLPT Level type
type JLPTLevel = "N1" | "N2" | "N3" | "N4" | "N5";

interface VideoBannerProps {
  isDarkMode: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUploadClick: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeLevel?: JLPTLevel | "ALL";
  onLevelChange?: (level: JLPTLevel | "ALL") => void;
}

const VideoBanner: React.FC<VideoBannerProps> = ({
  isDarkMode,
  searchQuery,
  onSearchChange,
  onUploadClick,
  activeTab,
  onTabChange,
  activeLevel = "ALL",
  onLevelChange,
}) => {
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

  const jlptLevels: Array<JLPTLevel | "ALL"> = [
    "ALL",
    "N5",
    "N4",
    "N3",
    "N2",
    "N1",
  ];

  return (
    <>
      {/* Title and Actions Bar */}
      <div
        className={`${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        } border-b px-6 py-4 shadow-sm transition-colors duration-300`}
      >
        <div className="mb-4">
          <h1
            className={`text-2xl font-bold ${
              isDarkMode
                ? "text-gray-100"
                : "bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent"
            }`}
          >
            Luyện Shadowing để dàng thông qua bất kỳ video nào bạn yêu thích
          </h1>
        </div>

        <div className="flex gap-4">
          {/* YouTube/Upload Buttons */}
          <div className="flex gap-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white px-4 py-3 rounded-xl shadow-md">
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-cyan-500 rounded-lg font-medium shadow-sm hover:shadow-md transition transform hover:scale-105">
              <Video className="w-4 h-4" />
              Youtube
            </button>
            <button
              onClick={onUploadClick}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/20 rounded-lg font-medium transition"
            >
              <Play className="w-4 h-4" />
              Tải lên
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm video..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 border-2"
                  : "bg-gray-50 border-gray-200 text-gray-700 border-2"
              }`}
            />
            <Search
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Categories/Tabs Section */}
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } px-6 py-3 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } transition-colors duration-300`}
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => onTabChange(tab.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                activeTab === tab.label
                  ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-md"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* JLPT Level Filter Section */}
      {onLevelChange && (
        <div
          className={`${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } px-6 py-3 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } transition-colors duration-300`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-semibold ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              JLPT Level:
            </span>
            <div className="flex gap-2">
              {jlptLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => onLevelChange(level)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all ${
                    activeLevel === level
                      ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-md"
                      : isDarkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {level === "ALL" ? "Toàn bộ" : level}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoBanner;
