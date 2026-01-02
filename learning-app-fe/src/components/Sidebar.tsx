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
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  isDarkMode,
  currentStreak,
}: SidebarProps) {
  const router = useRouter();

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
                className="relative cursor-pointer group"
              >
                <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-40 group-hover:opacity-60 transition"></div>
                <img
                  src="/logo-cat.png"
                  alt="NIBO Academy"
                  className="w-12 h-12 object-contain relative z-10 rounded-full drop-shadow-lg transform group-hover:scale-110 transition-transform"
                />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent leading-tight">
                  NIBO
                </div>
                <div className="text-lg font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent leading-tight -mt-1">
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
              className="relative cursor-pointer group"
            >
              <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-40 group-hover:opacity-60 transition"></div>
              <img
                src="/logo-cat.png"
                alt="NIBO Academy"
                className="w-10 h-10 object-contain relative z-10 rounded-full drop-shadow-lg transform group-hover:scale-110 transition-transform"
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
                : "from-cyan-50 via-blue-50 to-teal-50"
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
                    i < currentStreak
                      ? "bg-gradient-to-t from-cyan-400 to-cyan-300 shadow-md"
                      : isDarkMode
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  } flex items-end justify-center pb-1`}
                >
                  <Star
                    className={`w-3 h-3 ${
                      i < currentStreak
                        ? "text-white drop-shadow"
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
                isDarkMode ? "text-gray-400" : "text-cyan-600"
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
