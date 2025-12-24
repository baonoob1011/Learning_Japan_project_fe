"use client";

import React, { useState } from "react";
import { Search, Clock, Users, ChevronDown } from "lucide-react";

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
}) => (
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

    <button className="w-full py-3 border-2 border-emerald-500 text-emerald-500 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
      Bắt đầu thi
    </button>
  </div>
);

export default function PracticePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLevel, setActiveLevel] = useState("N1");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const levels = ["N1", "N2", "N3", "N4", "N5"];

  const exams = [
    {
      title: "JLPT-N1 07 2024",
      duration: 170,
      participants: 1064,
      sections: 2,
      questions: 96,
    },
    {
      title: "JLPT-N1 12 2023",
      duration: 170,
      participants: 245,
      sections: 2,
      questions: 96,
    },
    {
      title: "JLPT-N1 07 2023",
      duration: 170,
      participants: 101,
      sections: 2,
      questions: 96,
    },
    {
      title: "JLPT-N1 12 2022",
      duration: 170,
      participants: 63,
      sections: 2,
      questions: 97,
    },
    {
      title: "JLPT-N1 07 2022",
      duration: 170,
      participants: 47,
      sections: 2,
      questions: 103,
    },
    {
      title: "JLPT-N1 12 2021",
      duration: 170,
      participants: 56,
      sections: 2,
      questions: 104,
    },
    {
      title: "JLPT-N1 07 2021",
      duration: 170,
      participants: 42,
      sections: 2,
      questions: 94,
    },
    {
      title: "JLPT-N1 12 2020",
      duration: 170,
      participants: 45,
      sections: 2,
      questions: 68,
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors`}
    >
      {/* Header */}
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } border-b px-6 py-4 sticky top-0 z-10`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center">
              <span className="text-2xl">🐸</span>
            </div>
            <div>
              <div className="text-emerald-500 font-bold text-xl leading-tight">
                Goro
              </div>
              <div className="text-teal-400 font-bold text-xl leading-tight -mt-1">
                Domo
              </div>
            </div>
            <span
              className={`ml-2 text-lg ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Hi, Bảo
            </span>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              <span className="text-sm">🛍️ Sản phẩm</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition">
              <span className="text-xl">🍜</span>
            </button>

            <button className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition relative">
              <span className="text-xl">🎮</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              <span className="text-sm">🇻🇳 VN</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              B
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Level Tabs */}
        <div className="flex gap-3 mb-6">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-6 py-3 rounded-xl font-semibold transition ${
                activeLevel === level
                  ? "bg-emerald-500 text-white"
                  : isDarkMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              JLPT {level}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Type to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-4 py-3 pl-12 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-700"
              } border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400`}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Exam Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exams
            .filter((exam) =>
              exam.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((exam, index) => (
              <ExamCard key={index} {...exam} isDark={isDarkMode} />
            ))}
        </div>

        {/* Empty State */}
        {exams.filter((exam) =>
          exam.title.toLowerCase().includes(searchQuery.toLowerCase())
        ).length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p
              className={`text-lg ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Không tìm thấy đề thi nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
