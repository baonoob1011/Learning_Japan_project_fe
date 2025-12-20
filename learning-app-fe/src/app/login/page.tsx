"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await AuthService.login({ email: username, password });
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      localStorage.setItem("email", username);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra thông tin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 space-y-6">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src="/logo.png" alt="Corodomo Logo" className="h-12 w-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
          Chào mừng đến với Corodomo
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-center text-sm">
          Vui lòng chọn phương thức đăng nhập
        </p>

        {/* Social login buttons */}
        <div className="space-y-2">
          <button className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition">
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Đăng nhập bằng Google
          </button>
          <div className="flex justify-between gap-2">
            <button className="w-1/3 border border-gray-300 rounded-lg py-2 flex justify-center items-center hover:bg-gray-100 transition">
              <img src="/linkedin.svg" alt="LinkedIn" className="w-5 h-5" />
            </button>
            <button className="w-1/3 border border-gray-300 rounded-lg py-2 flex justify-center items-center hover:bg-gray-100 transition">
              X
            </button>
            <button className="w-1/3 border border-gray-300 rounded-lg py-2 flex justify-center items-center hover:bg-gray-100 transition">
              <img src="/github.svg" alt="Github" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-sm text-center">
          Đăng nhập bằng tài khoản của bạn
        </p>

        {/* Error message */}
        {error && (
          <div className="text-red-600 text-sm bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-gray-700 dark:text-white transition"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-gray-700 dark:text-white transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex justify-between text-sm text-teal-500">
            <a href="/forgot-password" className="hover:underline">
              Quên mật khẩu?
            </a>
            <a href="/register" className="hover:underline">
              Đăng ký
            </a>
          </div>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}
