import React, { useState } from "react";
import { BookOpen, PlayCircle } from "lucide-react";

interface Section {
  id: string;
  title: string;
  lessonCount: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  lastAccessed?: string;
  instructor: string;
  duration?: string;
  createdAt?: string;
  sections: Section[];
  expanded?: boolean;
  currentLesson?: string;
  totalSongs?: number;
  price?: number;
  isPaid?: boolean;
  isBought?: boolean;
}

interface CourseCardProps {
  course: Course;
  isDark: boolean;
  onClick: () => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isDark,
  onClick,
  onToggleExpand,
  isExpanded,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getGradientByLevel = (level: string) => {
    const gradients: Record<string, string> = {
      N5: "from-green-400 to-green-500",
      N4: "from-blue-400 to-blue-500",
      N3: "from-purple-400 to-purple-500",
      N2: "from-orange-400 to-orange-500",
      N1: "from-cyan-400 to-cyan-500",
    };
    return gradients[level] || "from-cyan-400 to-cyan-500";
  };

  const formatVND = (price?: number, isPaid?: boolean) => {
    if (isPaid === false) return "Miễn phí";
    if (price === undefined || price === null || price === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatCreatedDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-[2rem] border overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? "bg-gray-800 border-gray-700/50 hover:border-cyan-500/50" : "bg-white border-gray-100 hover:border-cyan-200"}`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
        {course.thumbnail && !imageError ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-cyan-50 dark:bg-cyan-900/20">
            <BookOpen className="w-12 h-12 text-cyan-300 dark:text-cyan-700" />
          </div>
        )}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-xl bg-cyan-500 text-white text-[10px] font-black tracking-widest uppercase shadow-lg border border-white/20">
            {course.level}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col min-h-0">
        <h3 className={`font-black text-lg line-clamp-2 leading-tight mb-2 ${isDark ? "text-white" : "text-gray-900"} group-hover:text-cyan-500 transition-colors`}>
          {course.title}
        </h3>

        <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {course.description}
        </p>

        {/* Bottom Section Pushed to Bottom */}
        <div className="mt-auto pt-4 flex flex-col gap-4">
          <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-100"}`}>
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? "text-cyan-500" : "text-cyan-600"}`}>
                {course.isPaid ? "Premium Course" : "Free Course"}
              </span>
              <span className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                {formatVND(course.price, course.isPaid)}
              </span>
            </div>

            <div className={`flex flex-col items-end text-[10px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              <span>Giảng viên</span>
              <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-700"}`}>{course.instructor}</span>
            </div>
          </div>

          <button
            className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${course.isBought || !course.isPaid
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/20 hover:shadow-cyan-500/40"
              : "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-orange-500/20 hover:shadow-orange-500/40"
              } active:scale-95`}
          >
            <PlayCircle className="w-5 h-5" />
            {course.isBought || !course.isPaid ? "Bắt đầu học ngay" : `Mua ngay - ${formatVND(course.price, course.isPaid)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
