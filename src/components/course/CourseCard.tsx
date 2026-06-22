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
      className={`group cursor-pointer rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg ${isDark ? "bg-gray-800 border-gray-700 hover:border-indigo-500/50" : "bg-white border-gray-200 hover:border-indigo-300"}`}
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0">
        {course.thumbnail && !imageError ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-700" />
          </div>
        )}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-2.5 py-1 rounded-md bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase border border-white/20">
            {course.level}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col min-h-0">
        <h3 className={`font-bold text-base line-clamp-2 leading-snug mb-2 ${isDark ? "text-gray-100" : "text-gray-900"} group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors`}>
          {course.title}
        </h3>

        <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {course.description}
        </p>

        {/* Bottom Section */}
        <div className="mt-auto">
          <div className={`flex items-center justify-between pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-100"} mb-4`}>
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Học phí
              </span>
              <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {formatVND(course.price, course.isPaid)}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                Giảng viên
              </span>
              <span className={`text-xs font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {course.instructor}
              </span>
            </div>
          </div>

          <button
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${course.isBought || !course.isPaid
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              : isDark
                ? "bg-gray-700 text-white hover:bg-gray-600 border border-gray-600"
                : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
              }`}
          >
            <PlayCircle className="w-4 h-4" />
            {course.isBought || !course.isPaid ? "Vào học ngay" : "Đăng ký khóa học"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
