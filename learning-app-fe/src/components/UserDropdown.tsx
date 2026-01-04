"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Mail, LogOut, Moon, Sun } from "lucide-react";

interface UserDropdownProps {
  isDark: boolean;
  onToggleDarkMode: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  isDark,
  onToggleDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer group relative z-[9999]"
        >
          <img
            src="/logo-cat.png"
            alt="User Menu"
            className="w-10 h-10 object-contain transform group-hover:scale-110 transition-transform"
          />
        </button>

        {isOpen && (
          <div
            className={`absolute right-0 top-full mt-2 w-64 ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } border rounded-xl shadow-2xl overflow-hidden z-[9999]`}
          >
            <div
              className={`p-3 border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold text-sm truncate ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    Bảo
                  </div>
                  <div
                    className={`text-xs truncate ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    trandinhbao222@gmail.com
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`p-2 border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={onToggleDarkMode}
                className={`w-full flex items-center justify-between px-3 py-2 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-lg transition`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                    {isDark ? (
                      <Moon className="w-4 h-4 text-white" />
                    ) : (
                      <Sun className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    Dark Mode
                  </span>
                </div>
                <div
                  className={`relative w-10 h-5 ${
                    isDark ? "bg-green-500" : "bg-gray-300"
                  } rounded-full transition-colors`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      isDark ? "translate-x-5" : ""
                    }`}
                  ></div>
                </div>
              </button>
            </div>

            <div className="p-2">
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-lg transition`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    Corodomo Plus
                  </div>
                </div>
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full font-medium">
                  Khuyến mãi
                </span>
              </button>

              <button
                className={`w-full flex items-center gap-2 px-3 py-2 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-lg transition mt-1`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Hỗ trợ & Phản hồi
                </span>
              </button>

              <button
                className={`w-full flex items-center gap-2 px-3 py-2 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-lg transition mt-1`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  Đăng xuất
                </span>
              </button>
            </div>

            <div
              className={`p-2 border-t ${
                isDark
                  ? "border-gray-700 bg-gray-900/50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div
                className={`text-xs text-center ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                Version 1.1.2
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserDropdown;
