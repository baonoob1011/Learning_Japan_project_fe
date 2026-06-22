"use client";

import { useMemo, useState, useEffect } from "react";
import { reviewService, ReviewGrade, TodayReviewResponse } from "@/services/reviewService";
import { BookOpen, RefreshCw, CheckCircle2, Zap, Brain, Clock, Flame } from "lucide-react";

type Props = {
  isDarkMode?: boolean;
};

const gradeButtons: Array<{
  grade: ReviewGrade;
  label: string;
  emoji: string;
  bg: string;
  text: string;
  border: string;
  shadow: string;
}> = [
  {
    grade: "AGAIN",
    label: "Quên rồi",
    emoji: "😵",
    bg: "bg-red-500 hover:bg-red-600",
    text: "text-white",
    border: "border-red-600",
    shadow: "shadow-red-500/30",
  },
  {
    grade: "HARD",
    label: "Khó",
    emoji: "😓",
    bg: "bg-amber-500 hover:bg-amber-600",
    text: "text-white",
    border: "border-amber-600",
    shadow: "shadow-amber-500/30",
  },
  {
    grade: "GOOD",
    label: "Ổn rồi",
    emoji: "😊",
    bg: "bg-cyan-500 hover:bg-cyan-600",
    text: "text-white",
    border: "border-cyan-600",
    shadow: "shadow-cyan-500/30",
  },
  {
    grade: "EASY",
    label: "Dễ thôi",
    emoji: "🏆",
    bg: "bg-emerald-500 hover:bg-emerald-600",
    text: "text-white",
    border: "border-emerald-600",
    shadow: "shadow-emerald-500/30",
  },
];

export default function TodayReviewDashboard({ isDarkMode = false }: Props) {
  const [data, setData] = useState<TodayReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reviewService.getToday();
      setData(res);
      setShowAnswer(false);
    } catch (e) {
      console.error(e);
      setError("Không tải được phiên ôn hôm nay.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const current = useMemo(() => data?.todayQueue.find((x) => !x.completed), [data]);
  const completedCount = useMemo(() => data?.todayQueue.filter((x) => x.completed).length ?? 0, [data]);
  const totalCount = data?.todayQueue.length ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const queueTypeLabel = (type: "NEW" | "DUE_TODAY" | "OVERDUE") => {
    if (type === "DUE_TODAY") return "Den han hom nay - On tap";
    if (type === "OVERDUE") return "Qua han - Uu tien on";
    return "Chua thuoc - Hoc moi";
  };

  const onGrade = async (grade: ReviewGrade) => {
    if (!current) return;
    try {
      setGrading(true);
      await reviewService.grade(current.wordProgressId, grade);
      await load();
    } catch (e) {
      console.error(e);
      setError("Chấm điểm thất bại.");
    } finally {
      setGrading(false);
    }
  };

  const card = isDarkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  const subText = isDarkMode ? "text-gray-400" : "text-gray-500";

  // Estimate next interval based on current word progress
  const estimateNextInterval = (grade: ReviewGrade, interval: number) => {
    const currentInterval = interval || 0;
    if (grade === "AGAIN") return "8 giờ";
    if (grade === "HARD") {
      if (currentInterval <= 1) return "3 ngày";
      return `${Math.max(currentInterval + 1, Math.ceil(currentInterval * 1.2))} ngày`;
    }
    if (grade === "GOOD") {
      if (currentInterval <= 0) return "1 ngày";
      if (currentInterval === 1) return "3 ngày";
      if (currentInterval === 3) return "7 ngày";
      if (currentInterval === 7) return "14 ngày";
      if (currentInterval === 14) return "30 ngày";
      return `${Math.max(currentInterval + 1, Math.round(currentInterval * 2.5))} ngày`;
    }
    if (grade === "EASY") {
      if (currentInterval <= 0) return "4 ngày";
      if (currentInterval <= 3) return "7 ngày";
      return `${Math.max(currentInterval + 2, Math.round(currentInterval * 2.5 * 1.3))} ngày`;
    }
    return "";
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center">
            <Brain size={18} className="text-cyan-500" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Ôn tập hôm nay
            </h2>
            <p className={`text-xs ${subText}`}>Hệ thống lặp lại theo khoảng cách (SRS)</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
            isDarkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={`rounded-2xl border ${card} p-8 flex items-center justify-center`}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-sm ${subText}`}>Đang tải danh sách ôn tập...</p>
          </div>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Từ mới", value: data.summary.newCount, icon: <BookOpen size={16} />, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Đến hạn", value: data.summary.dueCount, icon: <Clock size={16} />, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Quá hạn", value: data.summary.overdueCount, icon: <Flame size={16} />, color: "text-red-500", bg: "bg-red-500/10" },
              { label: "Hàng đợi", value: data.summary.todayQueueCount, icon: <Zap size={16} />, color: "text-cyan-500", bg: "bg-cyan-500/10" },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl border p-3.5 ${card}`}>
                <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} mb-2`}>
                  {stat.icon}
                </div>
                <p className={`text-2xl font-black ${isDarkMode ? "text-white" : "text-gray-800"}`}>{stat.value}</p>
                <p className={`text-xs mt-0.5 ${subText}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className={`rounded-2xl border p-4 ${card}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Tiến độ hôm nay
                </span>
                <span className={`text-sm font-bold ${progress === 100 ? "text-emerald-500" : isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                  {completedCount}/{totalCount} từ ({progress}%)
                </span>
              </div>
              <div className={`h-2.5 rounded-full ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${progress === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 to-blue-500"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Recovery Message */}
          {data.recoveryMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
              💬 {data.recoveryMessage}
            </div>
          )}

          {/* Current Word Card */}
          {current ? (
            <div className={`rounded-2xl border ${card} overflow-hidden`}>
              {/* Card Header */}
              <div className={`px-5 pt-5 pb-3 border-b ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${subText}`}>
                    {queueTypeLabel(current.type)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                    {completedCount + 1}/{totalCount}
                  </span>
                </div>
                <p className={`text-4xl font-black tracking-tight mt-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {current.word}
                </p>
              </div>

              {/* Answer Area */}
              <div className="px-5 py-4">
                {showAnswer ? (
                      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className={`text-lg font-semibold mb-3 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                          {current.meaning}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                          {gradeButtons.map((btn) => (
                            <button
                              key={btn.grade}
                              disabled={grading}
                              onClick={() => onGrade(btn.grade)}
                              className={`${btn.bg} ${btn.text} rounded-xl px-2 py-3 shadow-lg ${btn.shadow} transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 flex flex-col items-center justify-center`}
                            >
                              <span className="text-xl block mb-0.5">{btn.emoji}</span>
                              <span className="font-black text-xs uppercase tracking-tighter">{btn.label}</span>
                              <span className="text-[10px] opacity-70 font-medium mt-1 bg-black/10 px-1.5 py-0.5 rounded-full">
                                {estimateNextInterval(btn.grade, current.intervalDays)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-500/20"
                  >
                    👀 Xem nghĩa
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* All Done or Empty */
            <div className={`rounded-2xl border ${card} p-10 text-center`}>
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/15 rounded-full flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
              </div>
              <h3 className={`text-xl font-black mb-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Hoàn thành rồi! 🎉
              </h3>
              <p className={`text-sm ${subText}`}>
                {totalCount > 0 
                  ? `Bạn đã ôn xong ${totalCount} từ hôm nay. Thật tuyệt vời!`
                  : "Hôm nay chưa có bài ôn tập nào. Bạn hãy học thêm từ mới nhé!"}
              </p>
            </div>
          )}

          {/* SRS Legend / Explanation - ALWAYS VISIBLE */}
          <div className={`p-5 rounded-2xl border bg-opacity-50 ${isDarkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1 px-2 rounded-lg bg-cyan-500/10 text-cyan-500 font-black text-[10px] tracking-tight">SRS GUIDE</div>
              <span className={`text-[12px] font-black uppercase tracking-wider ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>Hướng dẫn hệ thống ôn tập lặp lại định kỳ</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-500 font-bold flex-shrink-0">😵</div>
                  <div>
                    <h4 className={`text-xs font-black ${isDarkMode ? "text-red-400" : "text-red-600"} uppercase`}>Again (Quên rồi)</h4>
                    <p className={`text-[11px] leading-relaxed mt-1 ${subText}`}>Hệ thống hiểu bạn vừa quên từ này. Nó sẽ bắt bạn học lại sớm (trong 8 - 24 tiếng tới).</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 font-bold flex-shrink-0">😓</div>
                  <div>
                    <h4 className={`text-xs font-black ${isDarkMode ? "text-amber-400" : "text-amber-600"} uppercase`}>Hard (Khó)</h4>
                    <p className={`text-[11px] leading-relaxed mt-1 ${subText}`}>Bạn nhớ nhưng phải suy nghĩ lâu. Lịch ôn tập sẽ được lùi lại nhẹ nhàng (khoảng 3 ngày).</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-500 font-bold flex-shrink-0">😊</div>
                  <div>
                    <h4 className={`text-xs font-black ${isDarkMode ? "text-cyan-400" : "text-cyan-600"} uppercase`}>Good (Ổn rồi)</h4>
                    <p className={`text-[11px] leading-relaxed mt-1 ${subText}`}>Bạn nhớ rõ và phản xạ tự nhiên. Đây là mức lý tưởng để dãn lịch ôn xa hơn (7 - 14 ngày).</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-500 font-bold flex-shrink-0">🏆</div>
                  <div>
                    <h4 className={`text-xs font-black ${isDarkMode ? "text-emerald-400" : "text-emerald-600"} uppercase`}>Easy (Dễ thôi)</h4>
                    <p className={`text-[11px] leading-relaxed mt-1 ${subText}`}>Từ này quá dễ với bạn. Hệ thống sẽ lùi lịch nhắc ra rất xa (ít nhất 1-2 tháng sau mới gặp lại).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !data && !error && (
        <div className={`rounded-2xl border ${card} p-10 text-center`}>
          <BookOpen size={40} className={`mx-auto mb-3 opacity-30 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
          <p className={`text-sm ${subText}`}>Chưa có dữ liệu ôn tập.</p>
        </div>
      )}
    </div>
  );
}

