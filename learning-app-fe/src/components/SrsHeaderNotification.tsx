"use client";
import React, { useEffect, useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { reviewService } from "@/services/reviewService";

interface Props {
  isDarkMode: boolean;
}

const SrsHeaderNotification: React.FC<Props> = ({ isDarkMode }) => {
  const router = useRouter();
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const fetchSrs = async () => {
      try {
        const data = await reviewService.getToday();
        setOverdueCount(data.summary.overdueCount || 0);
      } catch (err) {
        console.error("Header SRS fetch failed", err);
      }
    };
    fetchSrs();
    const timer = setInterval(fetchSrs, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (overdueCount === 0) return null;

  return (
    <button
      onClick={() => router.push("/vocabulary")}
      className={`
        flex items-center gap-2 px-3 py-1.5 rounded-full border 
        transition-all duration-300 hover:scale-105 active:scale-95
        animate-in slide-in-from-right-4 fade-in
        bg-red-500/10 border-red-500/20 hover:bg-red-500/20
      `}
      title="Ôn tập từ vựng ngay!"
    >
      <div className="relative">
        <AlertCircle size={16} className="text-red-500" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
      </div>
      
      <span className="text-[11px] font-black text-red-500 uppercase tracking-tighter whitespace-nowrap">
        {overdueCount} từ quá hạn
      </span>
      
      <ArrowRight size={12} className="text-red-400 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
};

export default SrsHeaderNotification;
