"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import { getRolesFromToken } from "@/utils/jwt";
import ForgotPasswordModal from "../../components/profile/ForgotPasswordModal"; // Đảm bảo đường dẫn đúng

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await login({ email: username, password });
      console.log("Login result:", result);

      const roles = getRolesFromToken(result.accessToken);
      console.log("Decoded roles:", roles);

      if (roles.includes("ADMIN")) {
        console.log("Redirecting to /adminDashboard");
        router.push("/admin");
      } else {
        console.log("Redirecting to /video");
        router.push("/video");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 px-4">
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-6 border border-cyan-100">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 rounded-full blur-md opacity-40"></div>
              <img
                src="/logo-cat.png"
                alt="NIBO Academy Logo"
                className="w-14 h-14 object-contain relative z-10 drop-shadow-lg"
              />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent text-center">
          Chào mừng đến với NIBO Academy
        </h2>
        <p className="text-gray-600 text-center text-sm">
          Vui lòng chọn phương thức đăng nhập
        </p>

        {/* Social login buttons */}
        <div className="space-y-3">
          <button className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:from-cyan-500 hover:to-cyan-600 transition font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng nhập bằng Google
          </button>

          <div className="flex justify-between gap-3">
            <button className="flex-1 border-2 border-cyan-200 rounded-xl py-3 flex justify-center items-center hover:bg-cyan-50 hover:border-cyan-300 transition transform hover:scale-105">
              <svg
                className="w-5 h-5 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </button>
            <button className="flex-1 border-2 border-cyan-200 rounded-xl py-3 flex justify-center items-center hover:bg-cyan-50 hover:border-cyan-300 transition transform hover:scale-105">
              <span className="text-gray-800 font-bold text-lg">𝕏</span>
            </button>
            <button className="flex-1 border-2 border-cyan-200 rounded-xl py-3 flex justify-center items-center hover:bg-cyan-50 hover:border-cyan-300 transition transform hover:scale-105">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm text-center">
          Đăng nhập bằng tài khoản của bạn
        </p>

        {/* Error message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Tài khoản
            </label>
            <input
              type="text"
              placeholder="Tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl
              text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-cyan-400
              focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-cyan-200 rounded-xl
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-cyan-400
                focus:border-transparent transition pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-cyan-500 hover:text-cyan-600 font-medium hover:underline"
            >
              Quên mật khẩu?
            </button>
            <Link
              href="/register"
              className="text-cyan-500 hover:text-cyan-600 font-medium"
            >
              Đăng ký
            </Link>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white py-3 rounded-xl transition disabled:opacity-50 font-medium shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
