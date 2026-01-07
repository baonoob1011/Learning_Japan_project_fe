import React from "react";
import { Search, Bell, Settings } from "lucide-react";
import UserDropdown from "@/components/UserDropdown";

interface SimpleHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({
  isDarkMode,
  onToggleDarkMode,
}: SimpleHeaderProps) {
  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-b px-4 py-2 transition-colors duration-300`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar - Left */}
        <div className="flex-1 max-w-sm relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <input
            type="text"
            placeholder="Nhập từ khóa để tìm kiếm"
            className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all ${
              isDarkMode
                ? "bg-gray-700 text-gray-100 placeholder:text-gray-400"
                : "bg-gray-50 text-gray-800 placeholder:text-gray-500 border border-gray-200"
            }`}
          />
        </div>

        {/* Actions - Right */}
        <div className="flex items-center gap-2">
          <button
            className={`p-1.5 rounded-lg transition-all ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
          </button>
          <button
            className={`p-1.5 rounded-lg transition-all ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Cài đặt"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* UserDropdown component - import từ @/components/UserDropdown */}
          <UserDropdown
            isDark={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        </div>
      </div>
    </div>
  );
}
