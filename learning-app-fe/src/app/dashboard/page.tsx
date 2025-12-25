"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminBreakPage() {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 phút nghỉ
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPage = searchParams.get("nextPage") ?? "/admin/dashboard";

  /* ------------------ PREVENT BACK NAVIGATION ------------------ */
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Countdown timer → hết giờ tự chuyển
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
          router.push(nextPage);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, nextPage]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleContinue = () => {
    localStorage.removeItem("breakStartTime");
    router.push(nextPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-7xl">☕</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Nghỉ giải lao Admin
          </h1>
          <p className="text-lg text-gray-600">Chuẩn bị tiếp tục công việc</p>
        </div>

        <div className="mb-12">
          <div className="inline-flex items-center justify-center bg-white rounded-3xl shadow-2xl px-12 py-8 mb-6">
            <span className="font-mono text-8xl font-bold text-emerald-500">
              {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-xl text-gray-700">
            Bạn có thể tiếp tục ngay hoặc đợi hết thời gian nghỉ
          </p>
        </div>

        <button
          onClick={handleContinue}
          className="px-16 py-5 bg-emerald-500 text-white text-xl font-bold rounded-full hover:bg-emerald-600 transition shadow-2xl transform hover:scale-105"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
