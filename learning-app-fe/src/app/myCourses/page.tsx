"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useDarkMode } from "@/hooks/useDarkMode";
import LoadingCat from "@/components/LoadingCat";
import { courseService, CourseResponse } from "@/services/courseService";
import { sectionService } from "@/services/sectionService";
import {
  BookOpen,
  Clock,
  TrendingUp,
  CheckCircle2,
  PlayCircle,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Types
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
      className={`${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border`}
    >
      {/* Thumbnail */}
      <div className="relative" onClick={onClick}>
        <div
          className={`w-full h-40 bg-gradient-to-br ${getGradientByLevel(
            course.level
          )} flex items-center justify-center relative overflow-hidden`}
        >
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
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-white/80 animate-pulse" />
                </div>
              )}
            </>
          ) : (
            <BookOpen className="w-16 h-16 text-white/80" />
          )}

          {/* Level Badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded">
            {course.level}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          onClick={onClick}
          className={`font-semibold ${
            isDark ? "text-gray-100" : "text-gray-800"
          } text-sm line-clamp-2 mb-2 min-h-[40px]`}
        >
          {course.title}
        </h3>

        <p
          onClick={onClick}
          className={`text-xs ${
            isDark ? "text-gray-400" : "text-gray-600"
          } line-clamp-2 mb-3`}
        >
          {course.description}
        </p>

        {/* Instructor & Created Date */}
        <div
          onClick={onClick}
          className={`flex items-center gap-2 mb-3 ${isDark ? "" : ""}`}
        >
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

        {/* Sections List */}
        {course.sections && course.sections.length > 0 && (
          <div
            className={`border-t pt-3 ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className={`w-full flex items-center justify-between text-xs font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <span>Nội dung khóa học ({course.sections.length})</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isExpanded && (
              <div className="space-y-2 animate-fadeIn">
                {course.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isDark
                        ? "bg-gray-700/50 hover:bg-gray-700"
                        : "bg-gray-50 hover:bg-gray-100"
                    } transition`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span
                        className={`text-xs font-bold ${
                          isDark ? "text-cyan-400" : "text-cyan-600"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        } line-clamp-1`}
                      >
                        {section.title}
                      </span>
                    </div>
                    <span
                      className={`text-xs ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {section.lessonCount} bài
                    </span>
                  </div>
                ))}

                {/* View Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="w-full mt-2 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Xem chi tiết khóa học
                </button>
              </div>
            )}
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
        const apiCourses = await courseService.getAll();

        const transformedCourses: Course[] = await Promise.all(
          apiCourses
            .filter((course) => course.isActive)
            .map(async (course) => {
              // Fetch sections for this course
              let sections: Section[] = [];
              try {
                const sectionsData = await sectionService.getByCourse(
                  course.id
                );
                sections = sectionsData.map((section) => ({
                  id: section.id,
                  title: section.title,
                  lessonCount: 0, // This will be updated when fetching lessons
                }));
              } catch (err) {
                console.error(
                  `Error fetching sections for course ${course.id}:`,
                  err
                );
              }

              const totalLessons = sections.reduce(
                (sum, section) => sum + section.lessonCount,
                0
              );
              const completedLessons = 0;

              return {
                id: course.id,
                title: course.title,
                description: course.description,
                thumbnail: course.imageUrl || "",
                level: course.level,
                instructor: course.createdBy || "Sensei",
                createdAt: course.createdAt,
                totalLessons: totalLessons,
                completedLessons: completedLessons,
                progress:
                  totalLessons > 0
                    ? Math.round((completedLessons / totalLessons) * 100)
                    : 0,
                lastAccessed: course.createdAt,
                sections: sections,
              };
            })
        );

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
      prevCourses.map((course) =>
        course.id === courseId
          ? { ...course, expanded: !course.expanded }
          : { ...course, expanded: false }
      )
    );
  };

  const filteredCourses = courses.filter((course) => {
    if (activeFilter === "inProgress") {
      return course.progress > 0 && course.progress < 100;
    }
    if (activeFilter === "completed") {
      return course.progress === 100;
    }
    return true;
  });

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
