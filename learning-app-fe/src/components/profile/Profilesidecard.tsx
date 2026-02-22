"use client";
import React, { useRef } from "react";
import { Camera, Calendar, Target, Star } from "lucide-react";
import { UserProfileResponse } from "@/services/userService";

interface ProfileSideCardProps {
  user: UserProfileResponse;
  isDark: boolean;
  onUploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileSideCard({
  user,
  isDark,
  onUploadAvatar,
}: ProfileSideCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.fullName || "U"
  )}&background=06b6d4&color=fff&size=128`;

  const stats = [
    {
      icon: <Calendar className="w-3.5 h-3.5" />,
      label: "Tham gia",
      value: "Jan 2024",
    },
    {
      icon: <Target className="w-3.5 h-3.5" />,
      label: "Mục tiêu",
      value: "JLPT N2",
    },
    {
      icon: <Star className="w-3.5 h-3.5" />,
      label: "Tài khoản",
      value: "Miễn phí",
    },
  ];

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden w-full ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Banner */}
      <div className="h-20 bg-gradient-to-r from-cyan-400 to-cyan-500 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-10 mb-3 inline-block">
          <div
            className="w-20 h-20 rounded-full border-4 shadow-lg overflow-hidden bg-gray-200"
            style={{ borderColor: isDark ? "#1f2937" : "#fff" }}
          >
            <img
              src={user.avatarUrl || avatarFallback}
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = avatarFallback;
              }}
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUploadAvatar}
          />
        </div>

        {/* Name & email */}
        <h2
          className={`text-lg font-bold ${
            isDark ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {user.fullName || "Chưa cập nhật tên"}
        </h2>
        <p
          className={`text-sm mb-3 break-all ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {user.email}
        </p>

        {/* Level badge */}
        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white text-xs font-bold rounded-full shadow-sm mb-4">
          N2 LEVEL
        </span>

        <div
          className={`border-t mb-4 ${
            isDark ? "border-gray-700" : "border-gray-100"
          }`}
        />

        {/* Stats */}
        <div className="flex flex-col gap-2.5">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark
                    ? "bg-gray-700 text-cyan-400"
                    : "bg-cyan-50 text-cyan-500"
                }`}
              >
                {stat.icon}
              </div>
              <span
                className={`text-xs ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {stat.label}:
              </span>
              <span className="font-medium ml-auto">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
