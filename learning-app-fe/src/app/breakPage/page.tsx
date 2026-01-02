"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BreakPage() {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 phút nghỉ
  const router = useRouter();
  const searchParams = useSearchParams();

  const participantId = searchParams.get("participantId");
  const nextSection = Number(searchParams.get("nextSection") ?? 2);
  const examId = searchParams.get("examId");

  /* ------------------ PREVENT BACK NAVIGATION ------------------ */
  useEffect(() => {
    // Prevent browser back button
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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
            `/exam?participantId=${participantId}&section=${nextSection}&examId=${examId}`
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, nextSection, participantId, examId]);

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
    router.push(
      `/exam?participantId=${participantId}&section=${nextSection}&examId=${examId}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cyan-100 px-6 py-3 flex items-center justify-between">
        <div className="w-24"></div> {/* Spacer for layout balance */}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
          Thời gian nghỉ
        </h1>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
            B
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-cyan-100 via-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-7xl">☕</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
              Nghỉ giải lao
            </h1>
            <p className="text-lg text-gray-600">
              Chuẩn bị cho phần thi tiếp theo (Phần {nextSection})
            </p>
          </div>

          {/* Timer */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center bg-white rounded-3xl shadow-2xl px-12 py-8 mb-6 border-2 border-cyan-100">
              <span className="font-mono text-8xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 bg-clip-text text-transparent">
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
            className="px-16 py-5 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white text-xl font-bold rounded-full hover:shadow-2xl transition transform hover:scale-105"
          >
            Bắt đầu phần tiếp theo
          </button>

          {/* Decorative Icons */}
          <div className="mt-12 opacity-50">
            <div className="text-6xl">🎧 📘 ✏️</div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-md max-w-md mx-auto border border-cyan-100">
            <div className="flex items-start gap-3 text-left">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-cyan-700 mb-1">Lưu ý:</h3>
                <p className="text-sm text-gray-600">
                  Câu trả lời của Phần {nextSection - 1} đã được lưu tự động.
                  Bạn sẽ không thể quay lại chỉnh sửa sau khi bắt đầu Phần{" "}
                  {nextSection}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
