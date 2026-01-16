"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Target,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Award,
  Brain,
  BarChart3,
  MessageSquare,
  Clock,
  User,
  Shield,
  MoreVertical,
  Loader2
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  learningProgressService,
  UserLearningDashboardResponse,
  DailyProgressDto,
} from "@/services/learningProgressService";

// --- Types & Interfaces ---
interface UserDetailProps {
  userId: string;
}

interface StatType {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  bgLight: string;
  textColor: string;
  rawAccuracy?: number;
}

interface LevelData {
  level: string;
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  accuracy: number;
  averageScore?: number;
  lastExamAt?: string;
}

// --- Sub-components (Memoized) ---

const StatCard = React.memo(({ stat }: { stat: StatType }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-4">
      <div className={`${stat.color} p-3 rounded-lg shadow-sm`}>
        <stat.icon className="w-5 h-5 text-white" />
      </div>
      {stat.rawAccuracy !== undefined && (
        <div className={`${stat.bgLight} px-2 py-1 rounded-full`}>
          <span className={`text-xs font-bold ${stat.textColor}`}>
            {stat.rawAccuracy < 50 ? "Cần chú ý" : "Tốt"}
          </span>
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{stat.label}</p>
      <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
    </div>
  </div>
));
StatCard.displayName = "StatCard";

// Tooltip formatter cho PieChart
const pieTooltipFormatter = (value: number, name: string) => {
  return [value, name];
};

// Style chung cho tooltip
const barTooltipContentStyle: React.CSSProperties = {
  borderRadius: "8px",
  border: "none",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

const LevelDetailRow = React.memo(
  ({
    level,
    formatDate,
  }: {
    level: LevelData;
    formatDate: (date?: string) => string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
          {level.level}
        </div>
        <div>
          <p className="font-semibold text-gray-800">Cấp độ {level.level}</p>
          <p className="text-xs text-gray-500">
            Lần cuối: {formatDate(level.lastExamAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-6 text-sm">
        <div className="text-center">
          <p className="text-gray-500 text-xs">Bài thi</p>
          <p className="font-bold">{level.totalExamsTaken}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-xs">Chính xác</p>
          <p
            className={`font-bold ${level.accuracy >= 80
              ? "text-green-600"
              : level.accuracy >= 50
                ? "text-yellow-600"
                : "text-red-600"
              }`}
          >
            {level.accuracy.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  )
);
LevelDetailRow.displayName = "LevelDetailRow";

// --- Main Component ---

export default function UserDetail({ userId }: UserDetailProps) {
  // State
  const [dashboardData, setDashboardData] = useState<UserLearningDashboardResponse | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock User Profile Info (Trong thực tế bạn sẽ fetch thông tin user theo userId)
  const userProfile = {
    name: "Nguyễn Văn A", // Giả lập
    email: "nguyenvana@example.com",
    role: "Premium Member",
    joinDate: "20/12/2025",
    avatar: "/avatar-mock.jpg",
  };

  // --- Fetch Data ---
  useEffect(() => {
    if (!userId) return;
    fetchUserSpecificData(userId);
  }, [userId]);

  // Trong file UserDetail.tsx

  const fetchUserSpecificData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Dashboard Data (Critical)
      // We await this separately because if this fails, the page is useless.
      const dashboardResult = await learningProgressService.getAdminUserProgress(id);

      // 2. Fetch Daily Progress (Optional)
      // We try to fetch it, but if it fails (404/500), we just use an empty array.
      let dailyResult: DailyProgressDto[] = [];
      try {
        dailyResult = await learningProgressService.getAdminDailyProgress(id, 7);
      } catch (e) {
        console.warn("Could not fetch daily progress, using empty data:", e);
        dailyResult = []; // Fallback to empty array
      }

      setDashboardData(dashboardResult);
      setDailyProgress(dailyResult);

    } catch (err) {
      console.error("Critical Error fetching user data:", err);
      setError(err instanceof Error ? err.message : "Failed to load user data");
    } finally {
      // THIS IS KEY: This ensures the loading spinner ALWAYS stops
      setLoading(false);
    }
  };

  // --- Helpers & Memoized Data ---
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  }, []);

  const progressData = useMemo(() => {
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const displayDate = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      const dayData = dailyProgress.find((d) => d.date === dateStr);
      last7Days.push({
        date: displayDate,
        score: dayData ? dayData.accuracy : 0,
        exams: dayData ? dayData.totalExamsTaken : 0,
      });
    }
    return last7Days;
  }, [dailyProgress]);

  const pieData = useMemo(() => {
    if (!dashboardData) return [];
    return [
      { name: "Đúng", value: dashboardData.correctQuestions, color: "#10B981" },
      { name: "Sai", value: dashboardData.totalQuestionsDone - dashboardData.correctQuestions, color: "#EF4444" },
    ];
  }, [dashboardData]);

  const stats = useMemo(() => {
    if (!dashboardData) return [];
    return [
      {
        icon: BookOpen,
        label: "Tổng bài thi",
        value: dashboardData.totalExamsTaken,
        color: "bg-blue-500",
        bgLight: "bg-blue-50",
        textColor: "text-blue-600",
      },
      {
        icon: CheckCircle2,
        label: "Câu đúng",
        value: dashboardData.correctQuestions,
        color: "bg-green-500",
        bgLight: "bg-green-50",
        textColor: "text-green-600",
      },
      {
        icon: TrendingUp,
        label: "Độ chính xác TB",
        value: `${dashboardData.accuracy.toFixed(1)}%`,
        color: "bg-orange-500",
        bgLight: "bg-orange-50",
        textColor: "text-orange-600",
        rawAccuracy: dashboardData.accuracy,
      },
    ];
  }, [dashboardData]);

  // --- UI Render ---

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" /></div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  if (!dashboardData) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Profile (Style Admin cũ nhưng đẹp hơn) */}
      {/* 1. Header Profile (Dữ liệu thật từ API) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            {/* Logic: Nếu có avatarUrl thì hiện ảnh, nếu không thì hiện icon User */}
            {dashboardData.user?.avatarUrl ? (
              <img
                src={dashboardData.user.avatarUrl}
                alt={dashboardData.user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>
          {/* Hiển thị chấm xanh nếu account enabled (kích hoạt) */}
          {dashboardData.user?.enabled && (
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Đang hoạt động"></span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {dashboardData.user?.fullName || "Người dùng"} {/* Tên thật */}

                {/* Hiển thị Level hiện tại */}
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-bold border border-indigo-200">
                  {dashboardData.lastLevel || "N/A"}
                </span>
              </h2>

              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                {/* Email thật */}
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {dashboardData.user?.email}
                </span>

                <span>•</span>

                {/* Ngày tham gia thật (dùng hàm formatDate có sẵn) */}
                <span>Tham gia: {formatDate(dashboardData.user?.createdAt)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-2 md:mt-0">
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                Gửi thông báo
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Overview Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* 3. Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Learning Progress */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Hoạt động 7 ngày qua
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Chính xác']}
              />
              <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Accuracy Pie & Level Details */}
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-500" />
              Tỷ lệ trả lời
            </h2>
            <div className="flex justify-center mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={pieTooltipFormatter}
                    contentStyle={barTooltipContentStyle}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">
                    Câu đúng
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {dashboardData.correctQuestions}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">
                    Câu sai
                  </span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {dashboardData.totalQuestionsDone -
                    dashboardData.correctQuestions}
                </span>
              </div>
            </div>
          </div>

          {/* Current Level Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" /> Chi tiết cấp độ
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {dashboardData.levels.length > 0 ? (
                dashboardData.levels.map((level) => (
                  <LevelDetailRow key={level.level} level={level} formatDate={formatDate} />
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">Chưa có dữ liệu cấp độ</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Community Activity Log (Giữ lại từ Admin cũ nhưng style lại) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
          <MessageSquare className="w-5 h-5 text-indigo-500" /> Hoạt động cộng đồng
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="p-3 rounded-tl-lg">Nội dung</th>
                <th className="p-3">Loại</th>
                <th className="p-3">Thời gian</th>
                <th className="p-3 rounded-tr-lg text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Mock Data */}
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-3 font-medium text-gray-700">Đã chia sẻ tài liệu "Tổng hợp Kanji N3"</td>
                <td className="p-3"><span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">Tài liệu</span></td>
                <td className="p-3 text-gray-500">2 giờ trước</td>
                <td className="p-3 text-right">
                  <button className="text-red-500 hover:text-red-700 hover:underline text-xs font-bold">Gỡ bỏ</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-3 font-medium text-gray-700">Bình luận tại bài viết "Lộ trình học N2"</td>
                <td className="p-3"><span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">Bình luận</span></td>
                <td className="p-3 text-gray-500">5 giờ trước</td>
                <td className="p-3 text-right">
                  <button className="text-red-500 hover:text-red-700 hover:underline text-xs font-bold">Gỡ bỏ</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}