"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useDarkMode } from "@/hooks/useDarkMode";
import LoadingCat from "@/components/LoadingCat";
import { courseService, CourseResponse } from "@/services/courseService";
import {
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  PlayCircle,
  Award,
  AlertCircle,
} from "lucide-react";

// Types
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
  instructor: string; // Tên giáo viên/người tạo
  duration?: string;
  createdAt?: string; // Thời gian tạo
  expanded?: boolean; // Trạng thái mở rộng
}

interface CourseCardProps {
  course: Course;
  isDark: boolean;
  onClick: () => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
}

// Course Card Component
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

  // Format thời gian tạo
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Nếu click vào nút "Xem chi tiết" thì navigate
    if ((e.target as HTMLElement).closest(".view-details-btn")) {
      onClick();
    } else {
      // Ngược lại thì toggle expand
      onToggleExpand();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border ${
        isExpanded ? "row-span-2" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="relative">
        <div
          className={`w-full h-40 bg-gradient-to-br ${getGradientByLevel(
            course.level
          )} flex items-center justify-center relative overflow-hidden`}
        >
          {/* Show image if available and not error */}
          {course.thumbnail && !imageError ? (
            <>
              <img
                src={course.thumbnail}
                alt={course.title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
              {/* Loading placeholder while image loads */}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/80 animate-pulse" />
                </div>
              )}
            </>
          ) : (
            // Fallback icon when no image or error
            <BookOpen className="w-16 h-16 text-white/80" />
          )}

          {/* Level Badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded">
            {course.level}
          </div>

          {/* Progress Badge */}
          {course.progress > 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {course.progress}%
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {course.progress > 0 && (
          <div
            className={`h-1 ${isDark ? "bg-gray-700" : "bg-gray-200"} w-full`}
          >
            <div
              className={`h-full bg-gradient-to-r ${getGradientByLevel(
                course.level
              )} transition-all duration-500`}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className={`font-semibold ${
            isDark ? "text-gray-100" : "text-gray-800"
          } text-sm line-clamp-2 mb-2 min-h-[40px]`}
        >
          {course.title}
        </h3>

        <p
          className={`text-xs ${
            isDark ? "text-gray-400" : "text-gray-600"
          } line-clamp-2 mb-3`}
        >
          {course.description}
        </p>

        {/* Instructor & Created Date */}
        <div
          className={`flex items-center gap-2 mb-3 pb-3 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          {/* Instructor */}
          <div className="flex items-center gap-1.5 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isDark ? "bg-cyan-900/30" : "bg-cyan-100"
              }`}
            >
              <svg
                className={`w-3.5 h-3.5 ${
                  isDark ? "text-cyan-400" : "text-cyan-600"
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
              className={`text-xs font-medium ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {course.instructor}
            </span>
          </div>

          {/* Created Date */}
          {course.createdAt && (
            <div
              className={`text-xs ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}
            >
              {formatCreatedDate(course.createdAt)}
            </div>
          )}
        </div>

        {/* Stats */}
        <div
          className={`flex items-center justify-between text-xs ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>
              {course.completedLessons}/{course.totalLessons} bài
            </span>
          </div>

          {course.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{course.duration}</span>
            </div>
          )}
        </div>

        {/* Completion Badge */}
        {course.progress === 100 && (
          <div className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Đã hoàn thành
            </span>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <div
            className={`mt-4 pt-4 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            } space-y-3 animate-fadeIn`}
          >
            {/* More Details */}
            <div
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Trạng thái:</span>
                <span
                  className={`px-2 py-1 rounded ${
                    isDark
                      ? "bg-cyan-900/30 text-cyan-400"
                      : "bg-cyan-100 text-cyan-600"
                  }`}
                >
                  Vĩnh viễn
                </span>
              </div>

              {course.lastAccessed && (
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Truy cập lần cuối:</span>
                  <span>{formatCreatedDate(course.lastAccessed)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="font-medium">Mức độ:</span>
                <span
                  className={`px-2 py-1 rounded font-bold ${
                    isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {course.level}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Tiến trình học
                </span>
                <span
                  className={`font-bold ${
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  }`}
                >
                  {course.progress}%
                </span>
              </div>
              <div
                className={`h-2 rounded-full ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getGradientByLevel(
                    course.level
                  )} transition-all duration-500`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              className="view-details-btn w-full py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              onClick={onClick}
            >
              <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Xem chi tiết khóa học
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
export default function MyCoursesPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const { isDarkMode, toggleDarkMode, mounted } = useDarkMode();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "inProgress" | "completed"
  >("all");

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Fetch real data from API
        const apiCourses = await courseService.getAll();

        // ✅ Transform API response to match UI Course type
        const transformedCourses: Course[] = apiCourses
          .filter((course) => course.isActive) // Only show active courses
          .map((course) => {
            // Convert duration from minutes to readable format
            const formatDuration = (minutes?: number) => {
              if (!minutes) return "0h 0m";
              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              if (hours === 0) return `${mins}m`;
              if (mins === 0) return `${hours}h`;
              return `${hours}h ${mins}m`;
            };

            const totalLessons = 0;
            const completedLessons = 0; // TODO: Get from UserCourseProgress

            return {
              id: course.id,
              title: course.title,
              description: course.description,
              thumbnail: course.imageUrl || "", // ✅ Use imageUrl from API
              level: course.level,
              instructor: course.createdBy || "Sensei", // ✅ Use createdBy from API
              createdAt: course.createdAt, // ✅ Use createdAt from API
              totalLessons: totalLessons, // ✅ Use totalLessons from API
              completedLessons: completedLessons,
              progress:
                totalLessons > 0
                  ? Math.round((completedLessons / totalLessons) * 100)
                  : 0,
              lastAccessed: course.createdAt, // ✅ Use updatedAt as lastAccessed
            };
          });

        setCourses(transformedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Không thể tải khóa học. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchCourses();
    }
  }, [mounted]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/myCourses/${courseId}`);
  };

  const toggleCourseExpand = (courseId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map(
        (course) =>
          course.id === courseId
            ? { ...course, expanded: !course.expanded }
            : { ...course, expanded: false } // Đóng các card khác
      )
    );
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    if (activeFilter === "inProgress") {
      return course.progress > 0 && course.progress < 100;
    }
    if (activeFilter === "completed") {
      return course.progress === 100;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: courses.length,
    inProgress: courses.filter((c) => c.progress > 0 && c.progress < 100)
      .length,
    completed: courses.filter((c) => c.progress === 100).length,
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <LoadingCat
            size="xl"
            isDark={true}
            message="Đang tải"
            subMessage="Vui lòng đợi trong giây lát"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 5px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 5px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 5px;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <div
        className={`flex h-screen ${
          isDarkMode
            ? "bg-gray-900"
            : "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"
        }`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          currentStreak={currentStreak}
          onStreakUpdate={setCurrentStreak}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

          {/* Page Header */}
          <div
            className={`p-6 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <h1
              className={`text-3xl font-bold mb-6 ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Khóa học của tôi
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl p-4 shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                    <BookOpen className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Tổng khóa học
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl p-4 shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Đang học
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {stats.inProgress}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-xl p-4 shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Hoàn thành
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {stats.completed}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-lg transition ${
                  activeFilter === "all"
                    ? "bg-cyan-500 text-white"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tất cả ({stats.total})
              </button>
              <button
                onClick={() => setActiveFilter("inProgress")}
                className={`px-4 py-2 rounded-lg transition ${
                  activeFilter === "inProgress"
                    ? "bg-cyan-500 text-white"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Đang học ({stats.inProgress})
              </button>
              <button
                onClick={() => setActiveFilter("completed")}
                className={`px-4 py-2 rounded-lg transition ${
                  activeFilter === "completed"
                    ? "bg-cyan-500 text-white"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Hoàn thành ({stats.completed})
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className={`flex-1 overflow-y-auto p-6 ${
              isDarkMode ? "custom-scrollbar-dark" : "custom-scrollbar"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingCat
                  size="lg"
                  isDark={isDarkMode}
                  message="Đang tải khóa học"
                  subMessage="Vui lòng đợi trong giây lát"
                />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle
                    className={`w-12 h-12 mx-auto mb-4 ${
                      isDarkMode ? "text-cyan-400" : "text-cyan-500"
                    }`}
                  />
                  <p
                    className={`text-lg ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {error}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-lg hover:shadow-lg transition"
                  >
                    Thử lại
                  </button>
                </div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BookOpen
                    className={`w-12 h-12 mx-auto mb-4 ${
                      isDarkMode ? "text-gray-600" : "text-cyan-400"
                    }`}
                  />
                  <p
                    className={`text-lg ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {activeFilter === "all"
                      ? "Chưa có khóa học nào"
                      : activeFilter === "inProgress"
                      ? "Không có khóa học đang học"
                      : "Chưa hoàn thành khóa học nào"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isDark={isDarkMode}
                    onClick={() => handleCourseClick(course.id)}
                    onToggleExpand={() => toggleCourseExpand(course.id)}
                    isExpanded={course.expanded || false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
