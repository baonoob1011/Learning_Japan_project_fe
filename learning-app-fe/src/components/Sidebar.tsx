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
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-r transition-all duration-300 flex flex-col`}
    >
      {/* Logo Section */}
      <div
        className={`p-4 ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } border-b flex items-center justify-between`}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-2">
              <div
                onClick={() => router.push("/video")}
                className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              >
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
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDarkMode
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <div
              onClick={() => router.push("/video")}
              className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
            >
              <span className="text-2xl">🐸</span>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                isDarkMode
                  ? "text-gray-400 hover:bg-gray-700"
                  : "text-gray-400 hover:bg-gray-100"
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

      {/* Navigation Menu */}
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
  );
}
