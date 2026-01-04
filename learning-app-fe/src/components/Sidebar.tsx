"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Play,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Gift,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  currentStreak: number;
  onStreakUpdate?: (newStreak: number) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  isDarkMode,
  currentStreak,
  onStreakUpdate,
}: SidebarProps) {
  const router = useRouter();
  const [streakDays, setStreakDays] = React.useState<number[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // Set isClient flag first
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Load and calculate streak on mount
  React.useEffect(() => {
    if (!isClient) return; // Only run on client

    const loadStreak = () => {
      const lastStudyDate = localStorage.getItem("lastStudyDate");
      const storedStreak = localStorage.getItem("currentStreak");
      const today = new Date();
      const todayStr = today.toDateString();
      const todayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      setCurrentDayIndex(todayIndex);

      if (!lastStudyDate) {
        // First time user
        localStorage.setItem("lastStudyDate", todayStr);
        localStorage.setItem("currentStreak", "1");
        setStreakDays([todayIndex]);
        if (onStreakUpdate) onStreakUpdate(1);
        return;
      }

      const lastDate = new Date(lastStudyDate);
      const todayDate = new Date(todayStr);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = parseInt(storedStreak || "0");

      if (diffDays === 0) {
        // Same day - keep current streak
        setStreakDays([todayIndex]);
      } else if (diffDays === 1) {
        // Next day - increment streak
        newStreak += 1;
        localStorage.setItem("lastStudyDate", todayStr);
        localStorage.setItem("currentStreak", newStreak.toString());
        setStreakDays([todayIndex]);
        if (onStreakUpdate) onStreakUpdate(newStreak);
      } else {
        // Missed days - reset streak
        newStreak = 1;
        localStorage.setItem("lastStudyDate", todayStr);
        localStorage.setItem("currentStreak", "1");
        setStreakDays([todayIndex]);
        if (onStreakUpdate) onStreakUpdate(1);
      }
    };

    loadStreak();
  }, [isClient, onStreakUpdate]);

  return (
    <div
      className={`${sidebarOpen ? "w-72" : "w-24"} ${
        isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white/90 backdrop-blur-sm border-cyan-100"
      } border-r transition-all duration-300 flex flex-col shadow-lg`}
    >
      {/* Logo Section */}
      <div
        className={`p-4 ${
          isDarkMode ? "border-gray-700" : "border-cyan-100"
        } border-b flex items-center justify-between`}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-3">
              <div
                onClick={() => router.push("/video")}
                className="cursor-pointer group"
              >
                <img
                  src="/logo-cat.png"
                  alt="NIBO Academy"
                  className="w-14 h-14 object-contain transform group-hover:scale-110 transition-transform"
                />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 bg-clip-text text-transparent leading-tight">
                  NIBO
                </div>
                <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent leading-tight -mt-1">
                  ACADEMY
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-cyan-500 hover:bg-cyan-50"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <div
              onClick={() => router.push("/video")}
              className="cursor-pointer group"
            >
              <img
                src="/logo-cat.png"
                alt="NIBO Academy"
                className="w-12 h-12 object-contain transform group-hover:scale-110 transition-transform"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                isDarkMode
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-cyan-400 hover:bg-cyan-50"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Streak Section */}
      {sidebarOpen && (
        <div
          className={`p-4 ${
            isDarkMode ? "border-gray-700" : "border-cyan-100"
          } border-b`}
        >
          <div
            className={`${
              isDarkMode
                ? "from-yellow-900/30 to-orange-900/30"
                : "from-cyan-50 via-blue-50 to-indigo-50"
            } bg-gradient-to-r rounded-xl p-3 shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-gray-300" : "text-cyan-700"
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
                    isClient && i === currentDayIndex
                      ? "bg-gradient-to-t from-cyan-400 to-cyan-300 shadow-md"
                      : isDarkMode
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  } flex items-end justify-center pb-1`}
                >
                  <Star
                    className={`w-3 h-3 ${
                      isClient && i === currentDayIndex
                        ? "text-white drop-shadow"
                        : isDarkMode
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}
                    fill={
                      isClient && i === currentDayIndex
                        ? "currentColor"
                        : "none"
                    }
                  />
                </div>
              ))}
            </div>
            <div
              className={`flex justify-between mt-2 text-xs ${
                isDarkMode ? "text-gray-400" : "text-cyan-600"
              }`}
            >
              {days.map((day, i) => (
                <span
                  key={i}
                  className={
                    isClient && i === currentDayIndex
                      ? "font-bold text-cyan-500"
                      : ""
                  }
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 rounded-xl font-medium hover:from-cyan-100 hover:to-blue-100 transition shadow-sm hover:shadow-md transform hover:scale-105">
            <Video className="w-5 h-5" />
            {sidebarOpen && <span>Danh sách video</span>}
          </button>
          <button
            className={`w-full flex items-center gap-3 px-4 py-3 ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-cyan-50"
            } rounded-xl transition transform hover:scale-105`}
          >
            <Play className="w-5 h-5" />
            {sidebarOpen && <span>Video của tôi</span>}
          </button>
          <button
            onClick={() => router.push("/learningProgress")}
            className={`w-full flex items-center gap-3 px-4 py-3 ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-cyan-50"
            } rounded-xl transition transform hover:scale-105`}
          >
            <Clock className="w-5 h-5" />
            {sidebarOpen && <span>Xem gần đây</span>}
          </button>
          <button
            onClick={() => router.push("/practice")}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 rounded-xl font-medium hover:from-cyan-100 hover:to-blue-100 transition shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <BookOpen className="w-5 h-5" />
            {sidebarOpen && <span>Luyện đề</span>}
          </button>
        </div>
      </div>

      {/* Upgrade Button */}
      {sidebarOpen && (
        <div className="p-4">
          <button className="w-full bg-gradient-to-r from-pink-400 via-rose-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition flex items-center justify-center gap-2 transform hover:scale-105">
            <Gift className="w-5 h-5" />
            Nâng cấp Plus
          </button>
        </div>
      )}
    </div>
  );
}
