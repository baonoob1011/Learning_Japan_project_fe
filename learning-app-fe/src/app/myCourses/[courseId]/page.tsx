"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useDarkMode } from "@/hooks/useDarkMode";
import LoadingCat from "@/components/LoadingCat";
import { courseService } from "@/services/courseService";
import { sectionService } from "@/services/sectionService";
import { lessonService, LessonResponse } from "@/services/lessonService";
import { formatYoutubeDuration } from "@/utils/formatYoutubeDuration";

import {
  lessonPartService,
  LessonPartResponse,
} from "@/services/lessonPartService";
import {
  lessonDocumentService,
  LessonDocumentResponse,
} from "@/services/lessonDocumentService";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  CheckCircle2,
  Heart,
  MessageSquare,
  Clock,
  AlertCircle,
  Search,
  FileText,
  Video,
} from "lucide-react";

// Types
interface LessonPart {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  partOrder: number;
  isCompleted: boolean;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  progress: number;
  description?: string;
  isExpanded: boolean;
  parts: LessonPart[];
  documents: LessonDocumentResponse[];
}

interface Chapter {
  id: string;
  title: string;
  level: string;
  isExpanded: boolean;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  level: string;
  instructor: string;
  thumbnail: string;
  chapters: Chapter[];
  currentVideoUrl?: string;
}

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) {
    return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;
  }

  const youtubeMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  if (url.match(/\.(mp4|webm|ogg)$/i)) {
    return null;
  }

  return null;
};

// Main Component
export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const { isDarkMode, toggleDarkMode, mounted } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [selectedPart, setSelectedPart] = useState<LessonPart | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  type TabType = "materials" | "discussion" | "toc" | "notes";
  const [activeTab, setActiveTab] = useState<TabType>("materials");

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      setLoading(true);
      setError(null);
      try {
        // 1. Fetch course data
        const courseData = await courseService.getDetail(courseId);

        // 2. Fetch sections data
        const sectionsData = await sectionService.getByCourse(courseId);

        // 3. Fetch lessons, parts, and documents for each section
        const chaptersPromises = sectionsData.map(async (section) => {
          try {
            const lessonsData = await lessonService.getBySection(section.id);

            // Fetch parts and documents for each lesson
            const lessonsWithDetails = await Promise.all(
              lessonsData.map(async (lesson) => {
                try {
                  // Fetch lesson parts
                  const partsData = await lessonPartService.getByLesson(
                    lesson.id
                  );
                  const parts: LessonPart[] = partsData.map((part) => ({
                    id: part.id,
                    title: part.title,
                    videoUrl: part.videoUrl || "",
                    duration: part.duration
                      ? formatYoutubeDuration(part.duration)
                      : "00:00",

                    partOrder: part.partOrder,
                    isCompleted: false,
                  }));

                  // Fetch lesson documents
                  const documentsData = await lessonDocumentService.getByLesson(
                    lesson.id
                  );

                  return {
                    id: lesson.id,
                    title: lesson.title,
                    duration: "10:00",
                    isCompleted: false,
                    isLocked: false,
                    progress: 0,
                    isExpanded: false,
                    parts: parts.sort((a, b) => a.partOrder - b.partOrder),
                    documents: documentsData.sort(
                      (a, b) => a.documentOrder - b.documentOrder
                    ),
                  };
                } catch (err) {
                  console.error(
                    `Error fetching details for lesson ${lesson.id}:`,
                    err
                  );
                  return {
                    id: lesson.id,
                    title: lesson.title,
                    duration: "10:00",
                    isCompleted: false,
                    isLocked: false,
                    progress: 0,
                    isExpanded: false,
                    parts: [],
                    documents: [],
                  };
                }
              })
            );

            return {
              id: section.id,
              title: section.title,
              level: section.lessonLevel,
              isExpanded: true,
              lessons: lessonsWithDetails,
            };
          } catch (err) {
            console.error(
              `Error fetching lessons for section ${section.id}:`,
              err
            );
            return {
              id: section.id,
              title: section.title,
              level: section.lessonLevel,
              isExpanded: true,
              lessons: [],
            };
          }
        });

        const chapters = await Promise.all(chaptersPromises);

        const transformedCourse: CourseDetail = {
          id: courseData.id,
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          instructor: courseData.createdBy || "Sensei",
          thumbnail: courseData.imageUrl || "",
          currentVideoUrl: "",
          chapters: chapters,
        };

        setCourse(transformedCourse);

        // Set first lesson part as selected
        if (chapters.length > 0 && chapters[0].lessons.length > 0) {
          const firstLesson = chapters[0].lessons[0];
          setSelectedLesson(firstLesson);

          if (firstLesson.parts.length > 0) {
            const firstPart = firstLesson.parts[0];
            setSelectedPart(firstPart);

            if (firstPart.videoUrl) {
              setCourse((prev) =>
                prev
                  ? {
                      ...prev,
                      currentVideoUrl: firstPart.videoUrl,
                    }
                  : null
              );
            }
          }
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Không thể tải chi tiết khóa học. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchCourseDetail();
    }
  }, [courseId, mounted]);

  const toggleChapter = (chapterId: string) => {
    if (!course) return;
    setCourse({
      ...course,
      chapters: course.chapters.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, isExpanded: !chapter.isExpanded }
          : chapter
      ),
    });
  };

  const toggleLesson = (lessonId: string) => {
    if (!course) return;
    setCourse({
      ...course,
      chapters: course.chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, isExpanded: !lesson.isExpanded }
            : lesson
        ),
      })),
    });
  };

  const handlePartClick = (lesson: Lesson, part: LessonPart) => {
    setSelectedLesson(lesson);
    setSelectedPart(part);

    if (part.videoUrl && course) {
      setCourse({
        ...course,
        currentVideoUrl: part.videoUrl,
      });
    }
  };

  const handleDocumentClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setActiveTab("materials");

    // Scroll to materials tab content
    setTimeout(() => {
      const materialsSection = document.getElementById("materials-section");
      if (materialsSection) {
        materialsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleBack = () => {
    router.push("/myCourses");
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

  if (loading) {
    return (
      <div
        className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          currentStreak={currentStreak}
          onStreakUpdate={setCurrentStreak}
        />
        <div className="flex-1 flex items-center justify-center">
          <LoadingCat
            size="lg"
            isDark={isDarkMode}
            message="Đang tải khóa học"
            subMessage="Vui lòng đợi trong giây lát"
          />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div
        className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          currentStreak={currentStreak}
          onStreakUpdate={setCurrentStreak}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {error || "Không tìm thấy khóa học"}
            </p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? "#1f2937" : "#f3f4f6"};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "#4b5563" : "#d1d5db"};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "#6b7280" : "#9ca3af"};
        }
      `}</style>

      <div
        className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
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

          {/* Breadcrumb */}
          <div
            className={`px-6 py-3 border-b ${
              isDarkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={handleBack}
                className={`hover:text-cyan-500 transition ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Trang chủ
              </button>
              <span className={isDarkMode ? "text-gray-600" : "text-gray-400"}>
                /
              </span>
              <button
                onClick={handleBack}
                className={`hover:text-cyan-500 transition ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Khóa học của tôi
              </button>
              <span className={isDarkMode ? "text-gray-600" : "text-gray-400"}>
                /
              </span>
              <span className="text-cyan-500">{course.title}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side - Video Player & Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Scrollable Container for Video and Content */}
              <div
                className={`flex-1 overflow-y-auto custom-scrollbar ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                {/* Video Player */}
                <div className={`${isDarkMode ? "bg-black" : "bg-gray-900"}`}>
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "45%" }}
                  >
                    <div className="absolute inset-0">
                      {selectedPart && course.currentVideoUrl ? (
                        (() => {
                          const embedUrl = getYouTubeEmbedUrl(
                            course.currentVideoUrl
                          );

                          if (embedUrl) {
                            return (
                              <iframe
                                className="w-full h-full"
                                src={embedUrl}
                                title={selectedPart.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            );
                          } else {
                            return (
                              <video
                                className="w-full h-full object-contain"
                                controls
                                poster={course.thumbnail}
                                key={selectedPart.id}
                              >
                                <source
                                  src={course.currentVideoUrl}
                                  type="video/mp4"
                                />
                                <source
                                  src={course.currentVideoUrl}
                                  type="video/webm"
                                />
                                <source
                                  src={course.currentVideoUrl}
                                  type="video/ogg"
                                />
                                Trình duyệt của bạn không hỗ trợ video.
                              </video>
                            );
                          }
                        })()
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <div className="text-center">
                            <Play className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm">
                              {selectedPart
                                ? "Video chưa có sẵn"
                                : "Chọn một phần để bắt đầu"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div
                  className={`p-6 border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <h2
                    className={`text-xl font-bold mb-2 ${
                      isDarkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    {selectedPart?.title ||
                      selectedLesson?.title ||
                      course.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        isDarkMode
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                      <span className="text-sm">Yêu thích</span>
                    </button>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        isDarkMode
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-sm">Báo cáo</span>
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div
                  className={`border-b ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <div className="flex px-6">
                    {[
                      { id: "materials" as const, label: "Tài liệu" },
                      { id: "discussion" as const, label: "Bình luận" },
                      { id: "toc" as const, label: "Mục lục" },
                      { id: "notes" as const, label: "Ghi chú" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 border-b-2 transition ${
                          activeTab === tab.id
                            ? "border-cyan-500 text-cyan-500"
                            : isDarkMode
                            ? "border-transparent text-gray-400 hover:text-gray-300"
                            : "border-transparent text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6" id="materials-section">
                  {activeTab === "materials" && (
                    <div
                      className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                    >
                      <h3 className="font-bold text-lg mb-4">
                        Tài liệu học tập
                      </h3>

                      {/* Display Lesson Documents */}
                      {selectedLesson && selectedLesson.documents.length > 0 ? (
                        <div className="space-y-3 mb-6">
                          <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-cyan-500" />
                            Tài liệu bài học
                          </h4>
                          {selectedLesson.documents.map((doc) => (
                            <a
                              key={doc.id}
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-3 p-4 rounded-lg border transition ${
                                isDarkMode
                                  ? "border-gray-700 hover:bg-gray-700 hover:border-cyan-500"
                                  : "border-gray-200 hover:bg-gray-50 hover:border-cyan-500"
                              }`}
                            >
                              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-cyan-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-medium truncate ${
                                    isDarkMode
                                      ? "text-gray-200"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {doc.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Tài liệu học tập
                                </p>
                              </div>
                              <svg
                                className="w-5 h-5 text-gray-400 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-4 py-8 text-center">
                          Chưa có tài liệu cho bài học này
                        </p>
                      )}

                      <div className="flex gap-4">
                        <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Thêm Flashcard
                        </button>
                        <button className="px-6 py-2 border border-cyan-500 text-cyan-500 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition">
                          Ghi chú
                        </button>
                      </div>
                    </div>
                  )}
                  {activeTab === "discussion" && (
                    <div
                      className={`text-center py-8 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có bình luận nào</p>
                    </div>
                  )}
                  {activeTab === "toc" && (
                    <div
                      className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                    >
                      <p>Xem danh sách bài học ở cột bên phải</p>
                    </div>
                  )}
                  {activeTab === "notes" && (
                    <div
                      className={`text-center py-8 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Chưa có ghi chú nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Lesson List */}
            <div
              className={`w-96 flex flex-col border-l ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Course Title */}
              <div
                className={`p-4 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <h3
                  className={`font-bold mb-1 ${
                    isDarkMode ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  {course.title}
                </h3>
                <button
                  onClick={() => {}}
                  className="text-cyan-500 text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Xem chi tiết
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div
                className={`p-4 border-b ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài học"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 bg-transparent outline-none text-sm ${
                      isDarkMode
                        ? "text-gray-300 placeholder-gray-500"
                        : "text-gray-700 placeholder-gray-400"
                    }`}
                  />
                </div>
              </div>

              {/* Chapters List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {course.chapters.length === 0 ? (
                  <div
                    className={`text-center py-8 ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có bài học nào</p>
                  </div>
                ) : (
                  course.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={`border-b ${
                        isDarkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      {/* Chapter Header */}
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700/30 transition ${
                          chapter.isExpanded
                            ? isDarkMode
                              ? "bg-gray-700/50"
                              : "bg-gray-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              chapter.level === "N5_BEGINNER" ||
                              chapter.level === "Elementary"
                                ? "text-green-500"
                                : chapter.level === "N4_INTERMEDIATE" ||
                                  chapter.level === "Intermediate"
                                ? "text-cyan-500"
                                : chapter.level === "N3_ADVANCED" ||
                                  chapter.level === "Advanced"
                                ? "text-purple-500"
                                : "text-orange-500"
                            }`}
                          >
                            {chapter.title}
                          </span>
                        </div>
                        {chapter.isExpanded ? (
                          <ChevronUp
                            className={`w-4 h-4 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          />
                        ) : (
                          <ChevronDown
                            className={`w-4 h-4 ${
                              isDarkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          />
                        )}
                      </button>

                      {/* Lessons */}
                      {chapter.isExpanded && (
                        <div>
                          {chapter.lessons.length === 0 ? (
                            <div
                              className={`px-4 py-6 text-center text-sm ${
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }`}
                            >
                              Chưa có bài học nào
                            </div>
                          ) : (
                            chapter.lessons
                              .filter((lesson) =>
                                lesson.title
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase())
                              )
                              .map((lesson) => (
                                <div key={lesson.id}>
                                  {/* Lesson Header */}
                                  <button
                                    onClick={() => toggleLesson(lesson.id)}
                                    disabled={lesson.isLocked}
                                    className={`w-full px-4 py-3.5 pl-6 flex items-center justify-between hover:bg-gray-700/20 transition ${
                                      lesson.isLocked
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    } ${
                                      lesson.isExpanded
                                        ? isDarkMode
                                          ? "bg-gray-700/30"
                                          : "bg-gray-100/50"
                                        : ""
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-medium mb-2 ${
                                          isDarkMode
                                            ? "text-gray-200"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {lesson.title}
                                      </p>
                                      <div className="flex items-center gap-3 text-xs">
                                        <div
                                          className={`flex items-center gap-1.5 ${
                                            isDarkMode
                                              ? "text-gray-400"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          <Video className="w-3.5 h-3.5" />
                                          <span>
                                            {lesson.parts.length} phần
                                          </span>
                                        </div>
                                        <div
                                          className={`flex items-center gap-1.5 ${
                                            isDarkMode
                                              ? "text-gray-400"
                                              : "text-gray-500"
                                          }`}
                                        >
                                          <FileText className="w-3.5 h-3.5" />
                                          <span>
                                            {lesson.documents.length} tài liệu
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {lesson.isExpanded ? (
                                      <ChevronUp
                                        className={`w-4 h-4 ml-3 flex-shrink-0 ${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      />
                                    ) : (
                                      <ChevronDown
                                        className={`w-4 h-4 ml-3 flex-shrink-0 ${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-600"
                                        }`}
                                      />
                                    )}
                                  </button>

                                  {/* Lesson Parts */}
                                  {lesson.isExpanded &&
                                    lesson.parts.length > 0 && (
                                      <div
                                        className={
                                          isDarkMode
                                            ? "bg-gray-900/40"
                                            : "bg-gray-50/70"
                                        }
                                      >
                                        {lesson.parts.map((part) => (
                                          <button
                                            key={part.id}
                                            onClick={() =>
                                              handlePartClick(lesson, part)
                                            }
                                            className={`w-full px-4 py-2.5 pl-12 flex items-center gap-3 hover:bg-gray-700/20 transition text-left ${
                                              selectedPart?.id === part.id
                                                ? isDarkMode
                                                  ? "bg-cyan-900/30 border-l-3 border-cyan-500"
                                                  : "bg-cyan-50 border-l-3 border-cyan-500"
                                                : ""
                                            }`}
                                          >
                                            <div className="flex-shrink-0">
                                              {part.isCompleted ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                              ) : selectedPart?.id ===
                                                part.id ? (
                                                <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                                </div>
                                              ) : (
                                                <div
                                                  className={`w-4 h-4 rounded-full border-2 ${
                                                    isDarkMode
                                                      ? "border-gray-600"
                                                      : "border-gray-300"
                                                  }`}
                                                ></div>
                                              )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                              <p
                                                className={`text-sm mb-1 truncate ${
                                                  selectedPart?.id === part.id
                                                    ? isDarkMode
                                                      ? "text-cyan-300"
                                                      : "text-cyan-700"
                                                    : isDarkMode
                                                    ? "text-gray-300"
                                                    : "text-gray-700"
                                                }`}
                                              >
                                                {part.title}
                                              </p>
                                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Clock className="w-3 h-3" />
                                                <span>{part.duration}</span>
                                              </div>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                  {/* Lesson Documents Preview */}
                                  {lesson.isExpanded &&
                                    lesson.documents.length > 0 && (
                                      <div
                                        className={`px-4 py-3 pl-12 ${
                                          isDarkMode
                                            ? "bg-gray-900/40"
                                            : "bg-gray-50/70"
                                        }`}
                                      >
                                        <button
                                          onClick={() =>
                                            handleDocumentClick(lesson)
                                          }
                                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition ${
                                            isDarkMode
                                              ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                                              : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
                                          }`}
                                        >
                                          <FileText className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                                          <span className="text-sm flex-1 text-left truncate">
                                            {lesson.documents[0].title}
                                          </span>
                                          {lesson.documents.length > 1 && (
                                            <span
                                              className={`text-xs px-2 py-0.5 rounded-full ${
                                                isDarkMode
                                                  ? "bg-gray-700 text-gray-400"
                                                  : "bg-gray-100 text-gray-600"
                                              }`}
                                            >
                                              +{lesson.documents.length - 1}
                                            </span>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                </div>
                              ))
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
