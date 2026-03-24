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
      className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border flex flex-col h-full`}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-full aspect-video">
        <div
          className={`w-full h-full bg-gradient-to-br ${getGradientByLevel(
            course.level
          )} flex items-center justify-center relative overflow-hidden`}
        >
          {course.thumbnail && !imageError ? (
            <>
              <img
                src={course.thumbnail}
                alt={course.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/80 animate-pulse" />
                </div>
              )}
            </>
          ) : (
            <BookOpen className="w-12 h-12 text-white/80" />
          )}

          <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black rounded-lg uppercase tracking-wider border border-white/10 z-10">
            {course.level}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col min-h-0">
        <h3
          className={`font-bold ${isDark ? "text-gray-100" : "text-gray-800"
            } text-[15px] leading-tight line-clamp-2 h-[2.5rem] mb-2`}
        >
          {course.title}
        </h3>

        <div className="mb-3">
          <span className={`text-lg font-black ${isDark ? "text-cyan-400" : "text-cyan-600"}`}>
            {formatVND(course.price, course.isPaid)}
          </span>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <p
            className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
              } line-clamp-3 mb-4 leading-relaxed overflow-hidden`}
          >
            {course.description}
          </p>
        </div>

        {/* Instructor & Created Date */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? "bg-cyan-900/30" : "bg-cyan-100"
                }`}
            >
              <svg
                className={`w-3.5 h-3.5 ${isDark ? "text-cyan-400" : "text-cyan-600"
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span
              className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"
                }`}
            >
              {course.instructor}
            </span>
          </div>

          {course.createdAt && (
            <div
              className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"
                }`}
            >
              {formatCreatedDate(course.createdAt)}
            </div>
          )}
        </div>

        <div
          className={`border-t pt-3 ${isDark ? "border-gray-700" : "border-gray-200"
            }`}
        >
          <button
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 group ${course.isBought || !course.isPaid
              ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-white hover:shadow-lg"
              : "bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:shadow-lg"
              }`}
          >
            <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {course.isBought || !course.isPaid
              ? "Vào học"
              : `Mua khóa học - ${formatVND(course.price, course.isPaid)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
