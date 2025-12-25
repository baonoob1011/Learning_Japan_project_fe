"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/components/backButton";

export default function BreakPage() {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 phút nghỉ
  const router = useRouter();
  const searchParams = useSearchParams();

  const participantId = searchParams.get("participantId");
  const nextSection = Number(searchParams.get("nextSection") ?? 2);

  // Countdown timer → hết giờ tự chuyển section
  useEffect(() => {
    const breakStartTimeRaw = localStorage.getItem("breakStartTime");
    const breakStartTime = breakStartTimeRaw
      ? Number(breakStartTimeRaw)
      : Date.now();

    if (!breakStartTimeRaw) {
      localStorage.setItem("breakStartTime", breakStartTime.toString());
    }

    setTimeout(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - breakStartTime) / 1000);
      const remaining = 5 * 60 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 0);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem("breakStartTime");
          router.push(
            `/exam?participantId=${participantId}&section=${nextSection}`
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, nextSection, participantId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStartTest = () => {
    // Xóa breakStartTime khi user click bắt đầu sớm
    localStorage.removeItem("breakStartTime");
    router.push(`/exam?participantId=${participantId}&section=${nextSection}`);
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
          {/* Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-7xl">☕</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Nghỉ giải lao
            </h1>
            <p className="text-lg text-gray-600">
              Chuẩn bị cho phần thi tiếp theo (Phần {nextSection})
            </p>
          </div>

          {/* Timer */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center bg-white rounded-3xl shadow-2xl px-12 py-8 mb-6">
              <span className="font-mono text-8xl font-bold text-emerald-500">
                {formatTime(timeLeft)}
              </span>
            </div>
            <p className="text-xl text-gray-700">
              Bạn có thể bắt đầu ngay hoặc đợi hết thời gian nghỉ
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartTest}
            className="px-16 py-5 bg-emerald-500 text-white text-xl font-bold rounded-full hover:bg-emerald-600 transition shadow-2xl transform hover:scale-105"
          >
            Bắt đầu phần tiếp theo
          </button>

          {/* Decorative Icons */}
          <div className="mt-12 opacity-50">
            <div className="text-6xl">🎧 📘 ✏️</div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-md max-w-md mx-auto">
            <div className="flex items-start gap-3 text-left">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Lưu ý:</h3>
                <p className="text-sm text-gray-600">
                  Câu trả lời của Phần 1 đã được lưu tự động. Bạn sẽ không thể
                  quay lại chỉnh sửa sau khi bắt đầu Phần {nextSection}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
