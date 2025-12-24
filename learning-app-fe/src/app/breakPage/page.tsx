"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/backButton"; // đường dẫn tùy dự án

export default function BreakPage() {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 phút nghỉ
  const router = useRouter();

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartTest = () => {
    router.push("/practice");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <BackButton to="/practice" />
        <div className="text-2xl">🐸</div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            🛍️ Sản phẩm
          </button>
          <button className="text-xl">🍜</button>
          <button className="text-xl">🎮</button>
          <button className="flex items-center gap-1 text-gray-600">
            🇻🇳 VN
          </button>
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
            B
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Rest Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-7xl">☕</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Nghỉ 5 phút trước khi làm phần thi Nghe
            </h1>
          </div>

          {/* Countdown Timer */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center bg-white rounded-3xl shadow-2xl px-12 py-8 mb-6">
              <span className="font-mono text-8xl font-bold text-emerald-500">
                {formatTime(timeLeft)}
              </span>
            </div>
            <p className="text-xl text-gray-700">
              Bạn cần mở loa hoặc đeo tai nghe để có thể hoàn thành phần thi.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hướng dẫn</h2>
            <div className="space-y-4 text-left">
              {[
                "Chuẩn bị loa hoặc tai nghe để nghe được âm thanh rõ ràng",
                "Tìm một không gian yên tĩnh để tập trung làm bài",
                "Mỗi đoạn nghe sẽ được phát 2 lần, hãy chú ý lắng nghe",
                "Bạn có thể bắt đầu ngay hoặc đợi hết thời gian nghỉ",
              ].map((text, index) => (
                <div className="flex items-start gap-4" key={index}>
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 pt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartTest}
            className="px-16 py-5 bg-emerald-500 text-white text-xl font-bold rounded-full hover:bg-emerald-600 transition shadow-2xl transform hover:scale-105"
          >
            Bắt đầu
          </button>

          {/* Bottom Illustration */}
          <div className="mt-12 opacity-50">
            <div className="text-6xl">🎧 🎵 📻</div>
          </div>
        </div>
      </div>

      {/* Footer with progress indicator */}
      <div className="bg-white border-t border-gray-200 py-4 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Phần 1: Hoàn thành ✓</span>
            <span>Phần 2: Nghe (Sắp bắt đầu)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
