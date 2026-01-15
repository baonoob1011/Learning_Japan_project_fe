"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Mail, LogOut, Moon, Sun } from "lucide-react";
import { userService, UserProfileResponse } from "@/services/userService";
import { logout } from "@/services/authService";
import { useRouter } from "next/navigation";

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
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userService.getProfile();
        // Lưu ý: Kiểm tra xem res trả về trực tiếp object user hay bọc trong 'result'
        // Nếu API trả về: { result: { ...user data... } } thì dùng dòng dưới:
        // setUser(res.result);
        // Nếu userService đã xử lý lấy data ra rồi thì giữ nguyên:
        setUser(res);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };

    fetchUser();
  }, []);

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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Logout API failed", error);
      localStorage.removeItem("auth-storage");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setIsOpen(false);
      setIsLoggingOut(false);
      router.push("/login");
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="relative" ref={dropdownRef}>
        {/* --- 1. SỬA PHẦN NÚT BẤM (TRIGGER) --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer group relative z-[9999] flex items-center justify-center"
        >
          <img
            // Logic: Nếu có avatarUrl thì dùng, không thì dùng logo mặc định
            src={user?.avatarUrl || "/logo-cat.png"}
            alt="User Avatar"
            // Thêm rounded-full và object-cover để ảnh luôn tròn đẹp
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm transform group-hover:scale-105 transition-transform"
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
            {/* Header User Info */}
            <div
              className={`p-3 border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {/* --- 2. SỬA PHẦN AVATAR BÊN TRONG DROPDOWN --- */}
                <div
                  className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer shrink-0"
                  onClick={() => router.push("/profile")}
                >
                  {/* Kiểm tra: Có ảnh thì hiện ảnh, không thì hiện chữ cái đầu */}
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {user?.fullName
                        ? user.fullName.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold text-sm truncate ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    {user?.fullName || "Người dùng"}
                  </div>
                  <div
                    className={`text-xs truncate ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {user?.email || "email@example.com"}
                  </div>
                </div>
              </div>
            </div>

            {/* ... (Các phần còn lại giữ nguyên) ... */}
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
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`w-full flex items-center gap-2 px-3 py-2 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-lg transition mt-1 group/logout ${
                  isLoggingOut ? "opacity-50 cursor-wait" : ""
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg flex items-center justify-center group-hover/logout:from-red-500 group-hover/logout:to-red-600 transition-all">
                  <LogOut className="w-4 h-4 text-white" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isDark ? "text-gray-100" : "text-gray-900"
                  } group-hover/logout:text-red-500 transition-colors`}
                >
                  {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
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
