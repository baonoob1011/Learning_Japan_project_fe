import React, { useEffect, useState } from "react";
import {
  Target,
  Zap,
  Clock,
  AlertCircle,
  ArrowRight,
  Bell,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Award
} from "lucide-react";
import { reviewService, TodayReviewResponse } from "@/services/reviewService";

interface VocabDashboardProps {
  isDarkMode: boolean;
  totalVocabs: number;
  onStartSmartStudy: () => void;
}

const VocabDashboard: React.FC<VocabDashboardProps> = ({
  isDarkMode,
  totalVocabs,
  onStartSmartStudy
}) => {
  const [reviewData, setReviewData] = useState<TodayReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewStats();
  }, []);

  const fetchReviewStats = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getToday();
      setReviewData(data);
    } catch (err) {
      console.error("Failed to fetch review summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const cardBg = isDarkMode ? "bg-gray-800/80 border-gray-700" : "bg-white border-gray-100 shadow-sm";
  const mainText = isDarkMode ? "text-white" : "text-gray-900";
  const subText = isDarkMode ? "text-gray-400" : "text-gray-500";

  const stats = [
    {
      label: "Tổng số từ",
      value: totalVocabs,
      icon: Target,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "Vốn từ của bạn"
    },
    {
      label: "Từ mới",
      value: reviewData?.summary.newCount || 0,
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      desc: "Sẵn sàng học"
    },
    {
      label: "Đến hạn",
      value: reviewData?.summary.dueCount || 0,
      icon: Clock,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      desc: "Cần ôn tập"
    },
    {
      label: "Quá hạn",
      value: reviewData?.summary.overdueCount || 0,
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
      desc: "Ưu tiên nhắc",
      animate: reviewData?.summary.overdueCount ? "animate-pulse" : ""
    },
  ];
  const todayQueueCount = reviewData?.summary.todayQueueCount || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Notification Bell */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-black ${mainText}`}>Chào ngày mới! 👋</h2>
          <p className={subText}>Hôm nay bạn muốn chinh phục bao nhiêu từ?</p>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-4 rounded-3xl border ${cardBg} transition-all duration-300 hover:scale-105 hover:shadow-xl group`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} ${stat.animate}`}>
                <stat.icon size={20} />
              </div>
              <div className="text-xs font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={14} />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className={`text-2xl font-black ${mainText}`}>{stat.value}</div>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${subText}`}>{stat.label}</div>
              <div className="text-[10px] opacity-60 italic">{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Central Action Card */}
      <div className={`relative overflow-hidden rounded-[32px] p-1 border-2 border-transparent bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600`}>
        <div className={`rounded-[30px] p-8 ${isDarkMode ? "bg-gray-900/90" : "bg-white/95"} backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 relative z-10`}>
          <div className="space-y-4 max-w-md text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500">
              <BrainCircuit size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Hệ thống lặp lại ngắt quãng (SRS)</span>
            </div>
            <h3 className={`text-3xl font-black leading-tight ${mainText}`}>
              Sẵn sàng cho <br /> phiên ôn tập hôm nay?
            </h3>
            <p className={`${subText} text-sm leading-relaxed`}>
              Khoa học chứng minh rằng việc ôn lại đúng lúc là chìa khóa của trí nhớ vĩnh cửu.
              Bạn đang có <span className="text-cyan-500 font-bold">{todayQueueCount} flashcards</span> đang đợi.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto min-w-[220px]">
            <button
              onClick={onStartSmartStudy}
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all group"
            >
              <Zap size={20} className="fill-current" />
              <span>BẮT ĐẦU HỌC ({todayQueueCount})</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Abstract blobs for aesthetics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none -z-10"></div>
        </div>
      </div>

    </div>
  );
};

export default VocabDashboard;
