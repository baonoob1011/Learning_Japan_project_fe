"use client";
import React, { useRef, useState, useEffect } from "react";
import { Camera, Calendar, Target, Star, Crown } from "lucide-react";
import { UserProfileResponse } from "@/services/userService";
import { getAccessTokenFromStorage, getRolesFromToken } from "@/utils/jwt";

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
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    const token = getAccessTokenFromStorage();
    if (token) {
      const roles = getRolesFromToken(token);
      setIsVip(roles.includes("USER_VIP"));
    }
  }, []);

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
  ];

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden w-full ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
    >
      {/* VIP shimmer keyframes */}
      {isVip && (
        <style>{`
          @keyframes vipBannerShimmer {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes vipCrownBob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes vipStarTwinkle {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.4); }
          }
        `}</style>
      )}

      {/* Banner */}
      <div
        className="h-20 relative overflow-hidden"
        style={isVip ? {
          background: "linear-gradient(135deg, #f59e0b, #d97706, #fbbf24, #b45309)",
          backgroundSize: "200% 200%",
          animation: "vipBannerShimmer 4s ease infinite",
        } : {
          background: "linear-gradient(to right, #22d3ee, #06b6d4)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {isVip && (
          <div className="absolute top-2 right-3 flex items-center gap-1">
            {[0, 0.25, 0.5].map((d, i) => (
              <Star
                key={i}
                className="w-3 h-3"
                style={{
                  fill: "rgba(255,255,255,0.8)",
                  color: "rgba(255,255,255,0.8)",
                  animation: `vipStarTwinkle 1.5s ease-in-out ${d}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="relative -mt-10 mb-3 inline-block">
          {/* VIP crown ring */}
          {isVip && (
            <div
              style={{
                position: "absolute",
                inset: -3,
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #fbbf24, #d97706, #fbbf24)",
                backgroundSize: "200% 200%",
                animation: "vipBannerShimmer 3s ease infinite",
                zIndex: 0,
              }}
            />
          )}
          <div
            className="w-20 h-20 rounded-full border-4 shadow-lg overflow-hidden bg-gray-200 relative z-[1]"
            style={{ borderColor: isVip ? "transparent" : (isDark ? "#1f2937" : "#fff") }}
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
          {/* VIP crown icon on top of avatar */}
          {isVip && (
            <div
              style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
                animation: "vipCrownBob 2s ease-in-out infinite",
                zIndex: 2,
              }}
            >
              <Crown className="w-5 h-5" style={{ color: "#d97706", filter: "drop-shadow(0 1px 3px rgba(217,119,6,0.7))" }} />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all z-[2]"
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
          className={`text-lg font-bold ${isDark ? "text-gray-100" : "text-gray-800"
            }`}
        >
          {user.fullName || "Chưa cập nhật tên"}
        </h2>
        <p
          className={`text-sm mb-3 break-all ${isDark ? "text-gray-400" : "text-gray-500"
            }`}
        >
          {user.email}
        </p>

        {/* Level badge + VIP badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white text-xs font-bold rounded-full shadow-sm">
            N2 LEVEL
          </span>
          {isVip && (
            <span
              className="inline-flex items-center gap-1 px-3 py-1 text-white text-xs font-bold rounded-full shadow-sm"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                boxShadow: "0 0 8px rgba(251,191,36,0.5)",
              }}
            >
              <Crown className="w-3 h-3" />
              VIP
            </span>
          )}
        </div>

        <div
          className={`border-t mb-4 ${isDark ? "border-gray-700" : "border-gray-100"
            }`}
        />

        {/* Stats */}
        <div className="flex flex-col gap-2.5">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm ${isDark ? "text-gray-300" : "text-gray-600"
                }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark
                    ? "bg-gray-700 text-cyan-400"
                    : "bg-cyan-50 text-cyan-500"
                  }`}
              >
                {stat.icon}
              </div>
              <span
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                {stat.label}:
              </span>
              <span className="font-medium ml-auto">{stat.value}</span>
            </div>
          ))}
          {/* Account type row */}
          <div
            className={`flex items-center gap-3 text-sm ${isDark ? "text-gray-300" : "text-gray-600"
              }`}
          >
            <div
              style={isVip ? {
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg, #fbbf24, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 0 8px rgba(251,191,36,0.5)",
              } : undefined}
              className={isVip ? "" : `w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? "bg-gray-700 text-cyan-400" : "bg-cyan-50 text-cyan-500"
                }`}
            >
              {isVip
                ? <Crown className="w-3.5 h-3.5 text-white" />
                : <Star className="w-3.5 h-3.5" />}
            </div>
            <span
              className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"
                }`}
            >
              Tài khoản:
            </span>
            {isVip ? (
              <span
                className="font-bold ml-auto text-xs"
                style={{
                  background: "linear-gradient(90deg, #d97706, #fbbf24)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                VIP Member
              </span>
            ) : (
              <span className="font-medium ml-auto">Miễn phí</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
