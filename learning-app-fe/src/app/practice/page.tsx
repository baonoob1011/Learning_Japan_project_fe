"use client";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { Search, Clock, Users, ChevronDown } from "lucide-react";
import { examService, ExamResponse } from "@/services/exam";

interface ExamCardProps {
  title: string;
  duration: number;
  participants: number;
  sections: number;
  questions: number;
  isDark: boolean;
}

const ExamCard: React.FC<ExamCardProps> = ({
  title,
  duration,
  participants,
  sections,
  questions,
  isDark,
}) => {
  const router = useRouter();
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
          <Clock className="w-5 h-5 text-orange-500" />
          <span
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {duration} phút
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <span
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {participants} người đã thi
          </span>
        </div>

        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {sections} phần thi | {questions} câu hỏi
        </p>
      </div>

      <button
        onClick={() => router.push(`/exam?duration=${duration}`)}
        className="w-full py-3 border-2 border-emerald-500 text-emerald-500 rounded-xl font-semibold"
      >
        Bắt đầu thi
      </button>
    </div>
  );
};

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLevel, setActiveLevel] = useState("N1");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const levels = ["N1", "N2", "N3", "N4", "N5"];

  // 🔥 CALL API
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
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* CONTENT */}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Level Tabs */}
        <div className="flex gap-3 mb-6">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-6 py-3 rounded-xl font-semibold ${
                activeLevel === level
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-gray-700"
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
          className="mb-6 px-4 py-3 border rounded-xl w-full max-w-md"
        />

        {/* Loading */}
        {loading && <p>⏳ Đang tải đề thi...</p>}

        {/* Error */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              title={`${exam.code}`}
              duration={exam.duration}
              participants={0}
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
  );
}
