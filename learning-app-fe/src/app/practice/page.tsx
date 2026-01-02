"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Clock, Users } from "lucide-react";
import {
  examService,
  ExamResponse,
  StartExamResponse,
} from "@/services/examService";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";

interface ExamCardProps {
  id: string;
  title: string;
  duration: number;
  participants: number;
  sections: number;
  questions: number;
  isDark: boolean;
}

const ExamCard: React.FC<ExamCardProps> = ({
  id,
  title,
  duration,
  participants,
  sections,
  questions,
  isDark,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStartExam = async () => {
    setLoading(true);
    try {
      const res: StartExamResponse = await examService.startExam({
        examId: id,
      });

      router.push(
        `/exam?examId=${res.examId}` +
          `&participantId=${res.participantId}` +
          `&duration=${res.duration}` +
          `&section=1`
      );
    } catch (err) {
      console.error("Lỗi khi bắt đầu bài thi:", err);
      alert("Không thể bắt đầu bài thi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } rounded-2xl p-6 shadow-sm hover:shadow-md transition-all`}
    >
      <h3
        className={`text-lg font-bold mb-4 ${
          isDark ? "text-gray-100" : "text-gray-800"
        }`}
      >
        {title}
      </h3>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-500" />
          <span
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {duration} phút
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          {participants > 0 && (
            <span
              className={`text-sm ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {participants} người đã thi
            </span>
          )}
        </div>

        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {sections} phần thi | {questions} câu hỏi
        </p>
      </div>

      <button
        onClick={handleStartExam}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
      >
        {loading ? "Đang bắt đầu..." : "Bắt đầu thi"}
      </button>
    </div>
  );
};

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLevel, setActiveLevel] = useState("N1");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(3);

  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const levels = ["N1", "N2", "N3", "N4", "N5"];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examService.getAll();
        setExams(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải đề thi");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const filteredExams = exams.filter(
    (exam) =>
      exam.level === activeLevel &&
      exam.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen">
      {/* Sidebar Component */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isDarkMode={isDarkMode}
        currentStreak={currentStreak}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden ${
          isDarkMode
            ? "bg-gray-900"
            : "bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50"
        }`}
      >
        {/* HEADER */}
        <header
          className={`${
            isDarkMode
              ? "bg-gray-800/80 border-gray-700"
              : "bg-white/80 border-cyan-100"
          } backdrop-blur-sm border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10`}
        >
          <h1
            className={`text-2xl font-bold ${
              isDarkMode
                ? "text-gray-100"
                : "bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent"
            }`}
          >
            Luyện thi JLPT
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle
              isDarkMode={isDarkMode}
              onToggle={() => setIsDarkMode(!isDarkMode)}
            />
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              B
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Level Tabs */}
            <div className="flex gap-3 mb-6">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveLevel(level)}
                  className={`px-6 py-3 rounded-xl font-semibold transition transform hover:scale-105 ${
                    activeLevel === level
                      ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-cyan-50 border border-cyan-200"
                  }`}
                >
                  JLPT {level}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm đề thi..."
              className="mb-6 px-4 py-3 border-2 border-cyan-200 rounded-xl w-full max-w-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />

            {/* Loading */}
            {loading && (
              <p className="text-cyan-600 flex items-center gap-2">
                <span className="animate-spin">⏳</span> Đang tải đề thi...
              </p>
            )}

            {/* Error */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Exam Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard
                  key={exam.id}
                  id={exam.id}
                  title={exam.code}
                  duration={exam.duration}
                  participants={exam.participant ?? 0}
                  sections={exam.numSections}
                  questions={exam.numQuestions}
                  isDark={isDarkMode}
                />
              ))}
            </div>

            {/* Empty */}
            {!loading && filteredExams.length === 0 && (
              <p className="text-center mt-10 text-gray-500">
                Không có đề thi phù hợp
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
