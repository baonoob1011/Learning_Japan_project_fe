"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Target,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  Brain,
  BarChart3,
  MessageSquare,
  Clock,
  User,
  Loader2,
  Mail,
  ShieldAlert,
  X, // Thêm icon đóng
  History
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
import BackButton from "../../components/backButton";

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

// --- Sub-components ---

const StatCard = React.memo(({ stat }: { stat: StatType }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`${stat.color} p-3 rounded-lg`}>
        <stat.icon className="w-6 h-6 text-white" />
      </div>
      <div className={`${stat.bgLight} px-3 py-1 rounded-full`}>
        <span className={`text-xs font-semibold ${stat.textColor}`}>
          {stat.label === "Độ chính xác" && stat.rawAccuracy !== undefined
            ? stat.rawAccuracy < 50 ? "Cần cải thiện" : "Tốt"
            : "Tổng quan"}
        </span>
      </div>
    </div>
    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
  </div>
));
StatCard.displayName = "StatCard";

const LevelDetail = React.memo(
  ({ level, formatDate }: { level: LevelData; formatDate: (date?: string) => string }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-500" />
          Chi tiết cấp độ {level.level}
        </h2>
        <span className="text-sm text-gray-500">
          Lần thi cuối: {formatDate(level.lastExamAt)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600 mb-1">Số bài thi</p>
          <p className="text-2xl font-bold text-blue-700">{level.totalExamsTaken}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-600 mb-1">Câu hỏi</p>
          <p className="text-2xl font-bold text-purple-700">{level.totalQuestionsDone}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
          <p className="text-sm text-green-600 mb-1">Đúng</p>
          <p className="text-2xl font-bold text-green-700">{level.correctQuestions}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
          <p className="text-sm text-orange-600 mb-1">Điểm TB</p>
          <p className="text-2xl font-bold text-orange-700">
            {level.averageScore ? level.averageScore.toFixed(1) : level.accuracy.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Độ chính xác tổng thể</span>
          <span className="text-sm font-bold text-indigo-600">{level.accuracy.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(level.accuracy, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
);
LevelDetail.displayName = "LevelDetail";

// --- Main Component ---

export default function UserDetail({ userId }: UserDetailProps) {
  const [dashboardData, setDashboardData] = useState<UserLearningDashboardResponse | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State điều khiển Modal Hoạt động cộng đồng
  const [showActivityModal, setShowActivityModal] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    if (userId) fetchUserSpecificData(userId);
  }, [userId]);

  const fetchUserSpecificData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardResult, dailyResult] = await Promise.all([
        learningProgressService.getAdminUserProgress(id),
        learningProgressService.getAdminDailyProgress(id, 7).catch(() => []),
      ]);

      setDashboardData(dashboardResult);
      setDailyProgress(dailyResult);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu người dùng này");
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers & Memoized Data ---
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return "Chưa có dữ liệu";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
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

  const levelComparison = useMemo(() => {
    if (!dashboardData) return [];
    const allLevels = ["N5", "N4", "N3", "N2", "N1"];
    return allLevels.map((level) => {
      const levelData = dashboardData.levels.find((l) => l.level === level);
      return {
        level,
        exams: levelData?.totalExamsTaken || 0,
        accuracy: levelData?.accuracy || 0,
      };
    });
  }, [dashboardData]);

  const stats = useMemo(() => {
    if (!dashboardData) return [];
    return [
      { icon: BookOpen, label: "Tổng số bài thi", value: dashboardData.totalExamsTaken, color: "bg-blue-500", bgLight: "bg-blue-50", textColor: "text-blue-600" },
      { icon: Target, label: "Câu hỏi đã làm", value: dashboardData.totalQuestionsDone, color: "bg-purple-500", bgLight: "bg-purple-50", textColor: "text-purple-600" },
      { icon: CheckCircle2, label: "Câu trả lời đúng", value: dashboardData.correctQuestions, color: "bg-green-500", bgLight: "bg-green-50", textColor: "text-green-600" },
      { icon: TrendingUp, label: "Độ chính xác", value: `${dashboardData.accuracy.toFixed(1)}%`, color: "bg-orange-500", bgLight: "bg-orange-50", textColor: "text-orange-600", rawAccuracy: dashboardData.accuracy },
    ];
  }, [dashboardData]);

  // Tooltip configs
  const barTooltipContentStyle = { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
  if (error || !dashboardData) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      
      {/* 1. Header Admin: Thông tin người dùng */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton to="/admin" label="home" />
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200 overflow-hidden">
                {dashboardData.user?.avatarUrl ? (
                   <img src={dashboardData.user.avatarUrl} alt="User" className="w-full h-full object-cover"/>
                ) : (
                   <User className="w-7 h-7 text-indigo-600" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {dashboardData.user?.fullName || "Người dùng ẩn danh"}
                  {dashboardData.lastLevel && (
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs rounded-full shadow-sm">
                      Level {dashboardData.lastLevel}
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                   <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {dashboardData.user?.email || "No Email"}</span>
                   <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> Join: {formatDate(dashboardData.user?.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
                  <ShieldAlert className="w-4 h-4 text-red-500"/> Chặn người dùng
               </button>
               
               {/* Nút Hoạt động cộng đồng MỚI */}
               <button 
                onClick={() => setShowActivityModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
               >
                  <History className="w-4 h-4 text-blue-500"/> Hoạt động cộng đồng
               </button>

               <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md text-sm font-medium">
                  <Mail className="w-4 h-4"/> Gửi Email
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* 2. Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => <StatCard key={index} stat={stat} />)}
        </div>

        {/* 3. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột Trái (2/3): Chi tiết Level & Biểu đồ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Level Details List */}
            {dashboardData.levels.length > 0 ? (
               dashboardData.levels.map((level) => (
                  <LevelDetail key={level.level} level={level} formatDate={formatDate} />
               ))
            ) : (
               <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-dashed border-gray-300">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                  <p className="text-gray-500">Người dùng chưa hoàn thành bài thi nào.</p>
               </div>
            )}

            {/* Line Chart: Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-indigo-500" /> Tiến độ 7 ngày qua
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={barTooltipContentStyle} />
                  <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart: Level Comparison */}
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-500" /> Thống kê theo cấp độ
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={levelComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="level" tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                  <Tooltip contentStyle={barTooltipContentStyle} />
                  <Bar dataKey="exams" fill="#6366f1" radius={[8, 8, 0, 0]} name="Số bài thi" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cột Phải (1/3): Pie Chart, Goals, Activity Log Summary */}
          <div className="space-y-6">
            
            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-500" /> Tỷ lệ trả lời
              </h2>
              <div className="flex justify-center mb-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={barTooltipContentStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                 <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                    <span className="flex items-center gap-2 text-sm text-gray-700"><div className="w-2 h-2 rounded-full bg-green-500"></div>Câu đúng</span>
                    <span className="font-bold text-green-600">{dashboardData.correctQuestions}</span>
                 </div>
                 <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                    <span className="flex items-center gap-2 text-sm text-gray-700"><div className="w-2 h-2 rounded-full bg-red-500"></div>Câu sai</span>
                    <span className="font-bold text-red-600">{dashboardData.totalQuestionsDone - dashboardData.correctQuestions}</span>
                 </div>
              </div>
            </div>

            {/* Goals */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5" /> Tiến độ mục tiêu</h2>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-sm mb-2 opacity-90">
                       <span>Tổng bài thi (Target: 50)</span>
                       <span>{Math.round((dashboardData.totalExamsTaken / 50) * 100)}%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2">
                       <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min((dashboardData.totalExamsTaken / 50) * 100, 100)}%` }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-2 opacity-90">
                       <span>Độ chính xác (Target: 80%)</span>
                       <span>{dashboardData.accuracy.toFixed(1)}%</span>
                    </div>
                     <div className="w-full bg-black/20 rounded-full h-2">
                       <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min((dashboardData.accuracy / 80) * 100, 100)}%` }} />
                    </div>
                 </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                 <MessageSquare className="w-5 h-5 text-indigo-500" /> Hoạt động gần đây
              </h3>
              <div className="space-y-4">
                 <div className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="mt-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div></div>
                    <div>
                       <p className="text-sm text-gray-700 font-medium">Hoàn thành bài thi N4</p>
                       <p className="text-xs text-gray-400">2 giờ trước</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="mt-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>
                    <div>
                       <p className="text-sm text-gray-700 font-medium">Bình luận bài viết Kanji</p>
                       <p className="text-xs text-gray-400">5 giờ trước</p>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MODAL HOẠT ĐỘNG CỘNG ĐỒNG --- */}
      {showActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                <History className="w-6 h-6 text-indigo-500" /> 
                Lịch sử hoạt động cộng đồng
              </h3>
              <button 
                onClick={() => setShowActivityModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="overflow-y-auto p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 z-10">
                  <tr>
                    <th className="p-4 border-b">Nội dung</th>
                    <th className="p-4 border-b">Loại</th>
                    <th className="p-4 border-b">Thời gian</th>
                    <th className="p-4 border-b text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Mock Data */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-700">Đã chia sẻ tài liệu "Tổng hợp Kanji N3"</td>
                    <td className="p-4"><span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-bold">Tài liệu</span></td>
                    <td className="p-4 text-gray-500">2 giờ trước</td>
                    <td className="p-4 text-right">
                      <button className="text-red-500 hover:text-red-700 hover:underline text-xs font-bold">Gỡ bỏ</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-700">Bình luận tại bài viết "Lộ trình học N2"</td>
                    <td className="p-4"><span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">Bình luận</span></td>
                    <td className="p-4 text-gray-500">5 giờ trước</td>
                    <td className="p-4 text-right">
                      <button className="text-red-500 hover:text-red-700 hover:underline text-xs font-bold">Gỡ bỏ</button>
                    </td>
                  </tr>
                  {/* Thêm dữ liệu mẫu để test scroll */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-700">Đăng câu hỏi "Ngữ pháp N1 này dùng sao?"</td>
                    <td className="p-4"><span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs font-bold">Q&A</span></td>
                    <td className="p-4 text-gray-500">1 ngày trước</td>
                    <td className="p-4 text-right">
                      <button className="text-red-500 hover:text-red-700 hover:underline text-xs font-bold">Gỡ bỏ</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}