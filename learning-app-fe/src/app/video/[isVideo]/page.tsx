"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Video,
  BookOpen,
  Bell,
  Settings,
  X,
  FileText,
  Menu,
  Play,
  Volume2,
} from "lucide-react";

// Import types (giữ nguyên)
import {
  youtubeService,
  YoutubeTranscriptResponse,
  TranscriptDTO,
} from "@/services/transcript";

export default function VideoLearningPage() {
  const router = useRouter();
  const pathname = usePathname();
  const videoId = pathname.split("/").pop() || "";

  const [showSidebar, setShowSidebar] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeTab, setActiveTab] = useState<"subtitle" | "translation">(
    "subtitle"
  );
  const [selectedLevel, setSelectedLevel] = useState<"N5" | "N4" | "beginner">(
    "N5"
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptDTO[]>([]);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);

  const video = {
    id: videoId,
    title: videoTitle || "Đang tải...",
    url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1`,
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    if (!videoId) return;

    async function fetchTranscript() {
      try {
        const data: YoutubeTranscriptResponse =
          await youtubeService.getTranscripts(videoId);
        setTranscripts(data.transcriptsDTOS);
        setVideoTitle(data.title); // Lấy title từ API
      } catch (err) {
        console.error("Failed to fetch transcripts", err);
        setTranscripts([]);
        setVideoTitle("Không tải được video");
      }
    }

    fetchTranscript();
  }, [videoId]);

  const handleBack = () => {
    alert("Quay lại danh sách video");
    router.push("/videos");
  };

  const handleSeekToTime = (startOffsetMs: number) => {
    if (!iframeRef) return;

    const seconds = Math.floor(startOffsetMs / 1000);

    // Sử dụng postMessage để điều khiển YouTube iframe
    iframeRef.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "seekTo",
        args: [seconds, true],
      }),
      "*"
    );

    // Tự động play video
    iframeRef.contentWindow?.postMessage(
      JSON.stringify({
        event: "command",
        func: "playVideo",
        args: [],
      }),
      "*"
    );
  };

  return (
    <div className="fixed inset-0 bg-white flex">
      {/* Left Sidebar */}
      <div
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative w-20 h-full bg-white shadow-lg flex flex-col items-center py-6 gap-6 transition-transform duration-300 ease-in-out z-50 border-r border-gray-200`}
      >
        {/* Logo */}
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200">
          <span className="text-2xl">🐸</span>
        </div>

        {/* Navigation Icons */}
        <div className="flex flex-col gap-3 mt-4">
          <button className="p-3 text-gray-400 hover:text-gray-700 transition-colors">
            <span className="text-xl">🏠</span>
          </button>
          <button className="p-3 text-gray-400 hover:text-gray-700 transition-colors">
            <span className="text-xl">🇨🇳</span>
          </button>
          <button className="p-3 text-gray-400 hover:text-gray-700 transition-colors">
            <span className="text-xl">🇯🇵</span>
          </button>
          <button className="p-3 bg-emerald-100 rounded-xl">
            <Video className="w-6 h-6 text-emerald-600" />
          </button>
          <button className="p-3 text-gray-400 hover:text-gray-700 transition-colors">
            <span className="text-xl">▶️</span>
          </button>
        </div>

        {/* Bottom Icons */}
        <div className="mt-auto flex flex-col gap-3">
          <button className="p-3 text-gray-400 hover:text-gray-700 transition-colors">
            <span className="text-xl">📖</span>
          </button>
          <button className="p-3 text-gray-400 hover:text-gray-700 transition-colors">
            <span className="text-xl">🔄</span>
          </button>
          <button className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
            <span className="text-lg">👤</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-600"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <button className="px-4 py-2 bg-emerald-500 text-white rounded-full font-medium flex items-center gap-2 hover:bg-emerald-600 transition-colors">
              <Video className="w-4 h-4" />
              Video
            </button>

            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium flex items-center gap-2 transition-colors">
              <span>🎯</span>
              Chép chính tả
            </button>

            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium flex items-center gap-2 transition-colors">
              <Volume2 className="w-4 h-4" />
              Phát âm
            </button>

            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium flex items-center gap-2 transition-colors">
              <span>❓</span>
              Bài tập
            </button>

            <button className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-full font-medium flex items-center gap-2 transition-colors">
              <span>📊</span>
              So đồ
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <FileText className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area with Video and Transcript */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Video Section */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Tips Card */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="text-gray-800 text-sm">
                    <strong>Tips!</strong> Bôi đen văn bản để dịch và thêm vào
                    phần từ vựng
                  </p>
                </div>
              </div>

              {/* Video Player */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="relative pt-[56.25%] bg-black">
                  <iframe
                    ref={(el) => setIframeRef(el)}
                    className="absolute top-0 left-0 w-full h-full"
                    src={video.url}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Video Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    N5
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Podcast
                  </span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {video.title}
                </h1>
                <p className="text-gray-600 text-sm">Video ID: {videoId}</p>
              </div>
            </div>
          </div>

          {/* Right: Transcript Sidebar */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Transcript Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Phụ đề</h2>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === "subtitle"
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("subtitle")}
                >
                  Phụ đề
                </button>
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === "translation"
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("translation")}
                >
                  Bản dịch
                </button>
              </div>
            </div>

            {/* Transcript List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {transcripts.map((t) => (
                <div
                  key={t.id}
                  className="group p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-emerald-200"
                  onClick={() => handleSeekToTime(t.startOffset)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-emerald-100 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeekToTime(t.startOffset);
                      }}
                    >
                      <Play className="w-3 h-3 text-gray-600 group-hover:text-emerald-600" />
                    </button>
                    <span className="text-xs text-gray-500">
                      {formatTime(t.startOffset)}
                    </span>
                  </div>
                  <p className="text-gray-900 leading-relaxed text-sm">
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
