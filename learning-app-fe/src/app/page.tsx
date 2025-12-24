"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-white shadow">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-400 rounded-full flex items-center justify-center">
            <span className="text-xl">🐸</span>
          </div>
          <span className="text-xl font-bold text-emerald-500">Corodomo</span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-600 text-sm">
                Xin chào, <b>{user?.fullName || user?.email}</b>
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg text-sm"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-white rounded-lg text-sm"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          📚 Chào mừng đến với Corodomo
        </h1>

        <p className="text-gray-600 mb-10 max-w-2xl">
          Nền tảng học tập thông minh giúp bạn luyện tập, kiểm tra và nâng cao
          kiến thức mỗi ngày 🚀
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="📝 Luyện tập"
            desc="Làm bài tập, câu hỏi trắc nghiệm theo từng cấp độ."
          />
          <FeatureCard
            title="📊 Thi thử"
            desc="Thi thử như thi thật, chấm điểm tự động."
          />
          <FeatureCard
            title="🤖 AI hỗ trợ"
            desc="AI giải thích đáp án, gợi ý cách học hiệu quả."
          />
        </div>

        {/* Actions */}
        <div className="mt-12 flex gap-4">
          <Link
            href="/courses"
            className="px-6 py-3 bg-emerald-400 hover:bg-emerald-500 text-white rounded-xl font-medium"
          >
            Bắt đầu học
          </Link>

          <Link
            href="/exams"
            className="px-6 py-3 border-2 border-emerald-400 text-emerald-500 hover:bg-emerald-50 rounded-xl font-medium"
          >
            Làm bài kiểm tra
          </Link>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
