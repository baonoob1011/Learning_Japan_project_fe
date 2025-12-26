"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Video,
  BookOpen,
  Bell,
  Settings,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  MessageSquare,
  FileText,
  Repeat,
  Menu,
} from "lucide-react";

export default function VideoLearningPage() {
  const [activeTab, setActiveTab] = useState("subtitle");
  const [selectedLevel, setSelectedLevel] = useState("N5");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const video = {
    id: "1Wb-BeTaqzU",
    title: "Learn Japanese with Natural Phrases",
    thumbnail: "https://i.ytimg.com/vi/1Wb-BeTaqzU/maxresdefault.jpg",
  };

  const subtitles = [
    {
      id: 1,
      time: "0:00",
      japanese: "今日もお疲れ様です 日本語チューターのかなです",
      romaji: "kyō mo otsukaresama desu nihongo chūtā no kana desu",
      vietnamese: "Xem sau",
      translation: "Hôm nay cũng cảm ơn vì đã làm việc chăm chỉ",
    },
    {
      id: 2,
      time: "0:05",
      japanese:
        "この動画では電車バスタクシー空港でよく聞く自然なフレーズを聞くことができます",
      romaji:
        "kono dōga dewa densha basu takushī kūkō de yoku kiku shizen na furēzu o kiku koto ga dekimasu",
      vietnamese: "Chia sẻ",
      translation:
        "Trong video này, bạn có thể nghe những cụm từ tự nhiên thường nghe ở tàu điện, xe buýt, taxi và sân bay",
    },
    {
      id: 3,
      time: "0:12",
      japanese:
        "駅で電車があっているか聞きたいとき 新幹線のチケットを買いたいとき",
      romaji:
        "eki de densha ga atte iru ka kikitai toki shinkansen no chiketto o kaitai toki",
      vietnamese: "",
      translation:
        "Khi bạn muốn hỏi xem có phải tàu đúng không tại ga, khi muốn mua vé shinkansen",
    },
    {
      id: 4,
      time: "0:18",
      japanese: "バスでICカードをタッチし忘れた時",
      romaji: "basu de IC kādo o tacchi shi wasureta toki",
      vietnamese: "",
      translation: "Khi quên chạm thẻ IC trên xe buýt",
    },
    {
      id: 5,
      time: "0:22",
      japanese: "そして空港でチェックインする時などのフレーズを76個集めました",
      romaji:
        "soshite kūkō de chekkuin suru toki nado no furēzu o 76-ko atsumemashita",
      vietnamese: "",
      translation: "Và tôi đã tổng hợp 76 cụm từ như khi check-in tại sân bay",
    },
    {
      id: 6,
      time: "0:28",
      japanese: "声に出せる時はシャドーイングもしながら毎日聞いてみてください",
      romaji:
        "koe ni daseru toki wa shadōingu mo shinagara mainichi kiite mite kudasai",
      vietnamese: "",
      translation: "Khi có thể phát âm, hãy thử shadowing và nghe mỗi ngày",
    },
    {
      id: 7,
      time: "0:34",
      japanese: "まずは電車の駅でのフレーズから",
      romaji: "mazu wa densha no eki de no furēzu kara",
      vietnamese: "",
      translation: "Trước tiên là các cụm từ tại ga tàu điện",
    },
  ];

  const handleBack = () => {
    console.log("Going back to video list");
    alert("Quay lại danh sách video");
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col lg:flex-row">
      {/* Left Sidebar - Hidden on mobile, shown via menu */}
      <div
        className={`${
          showSidebar ? "flex" : "hidden"
        } lg:flex w-full lg:w-20 bg-gray-800 flex-row lg:flex-col items-center py-4 gap-4 lg:gap-6 px-4 lg:px-0 absolute lg:relative z-50 lg:z-auto`}
      >
        <div
          className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-500 transition"
          onClick={handleBack}
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
        </div>

        <div className="flex flex-row lg:flex-col gap-3 lg:gap-4 lg:mt-8">
          <button className="p-2 lg:p-3 bg-emerald-500 rounded-xl">
            <Video className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </button>
          <button className="p-2 lg:p-3 hover:bg-gray-700 rounded-xl transition">
            <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
          </button>
          <button className="p-2 lg:p-3 hover:bg-gray-700 rounded-xl transition">
            <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
          </button>
          <button className="p-2 lg:p-3 hover:bg-gray-700 rounded-xl transition">
            <Settings className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
          </button>
        </div>

        <div className="ml-auto lg:ml-0 lg:mt-auto">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-lg lg:text-xl">🐸</span>
          </div>
        </div>

        <button
          className="lg:hidden ml-4"
          onClick={() => setShowSidebar(false)}
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 px-3 lg:px-6 py-2 lg:py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white">
              <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <span className="text-gray-400 text-xs lg:text-sm hidden sm:inline">
              Từ vựng
            </span>
            <button className="p-1 hover:bg-gray-700 rounded hidden sm:block">
              <X className="w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <span className="text-gray-400 hidden md:inline">
              Tips! Bôi đen văn bản để dịch
            </span>
            <button className="text-emerald-400">💡</button>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Video Player */}
          <div className="flex-1 bg-black flex items-center justify-center p-2 lg:p-4 overflow-y-auto">
            <div className="w-full max-w-4xl">
              {/* YouTube Player */}
              <div className="relative pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden mb-3 lg:mb-4">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${video.id}?enablejsapi=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Subtitle Display */}
              <div className="bg-gray-800 rounded-xl p-3 lg:p-4 mb-3 lg:mb-4">
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-1 lg:gap-2 text-xs lg:text-sm text-gray-400 mb-2 flex-wrap">
                    <span className="bg-emerald-500 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      きょう
                    </span>
                    <span className="bg-emerald-500 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      も
                    </span>
                    <span className="bg-emerald-500 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      お
                    </span>
                    <span className="bg-emerald-500 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      つか
                    </span>
                    <span className="bg-emerald-500 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      さま
                    </span>
                    <span className="bg-gray-600 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      です
                    </span>
                    <span className="bg-pink-500 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      にほんご
                    </span>
                    <span className="bg-pink-500 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      ちゅーたー
                    </span>
                    <span className="bg-gray-600 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      の
                    </span>
                    <span className="bg-gray-600 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      かな
                    </span>
                    <span className="bg-gray-600 text-white px-1.5 lg:px-2 py-0.5 rounded text-xs">
                      です
                    </span>
                  </div>
                  <div className="text-base lg:text-2xl text-white font-medium">
                    今日 も お疲れ様 です 日本語 チューター の かな です
                  </div>
                </div>
              </div>

              {/* Video Controls */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 lg:gap-4">
                  <button className="p-1.5 lg:p-2 hover:bg-gray-800 rounded-lg transition">
                    <SkipBack className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 lg:p-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    ) : (
                      <Play className="w-5 h-5 lg:w-6 lg:h-6 text-white ml-0.5" />
                    )}
                  </button>
                  <button className="p-1.5 lg:p-2 hover:bg-gray-800 rounded-lg transition">
                    <SkipForward className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </button>
                  <button className="p-1.5 lg:p-2 hover:bg-gray-800 rounded-lg transition">
                    <Repeat className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </button>
                  <button className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 hover:bg-gray-800 rounded-lg transition">
                    <Volume2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    <span className="text-white text-xs lg:text-sm">0.75x</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button className="px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-xs lg:text-sm">
                    ⚙️ <span className="hidden sm:inline">Cài đặt</span>
                  </button>
                  <button className="px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-xs lg:text-sm">
                    🔔 <span className="hidden sm:inline">Ghi chú</span>
                  </button>
                  <button className="px-3 lg:px-4 py-1.5 lg:py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-xs lg:text-sm flex items-center gap-1 lg:gap-2">
                    <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">Bình luận</span>
                  </button>
                  <button
                    className="lg:hidden px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition text-xs"
                    onClick={() => setShowSubtitles(!showSubtitles)}
                  >
                    {showSubtitles ? "Ẩn" : "Hiện"} phụ đề
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Subtitles */}
          <div
            className={`${
              showSubtitles ? "flex" : "hidden"
            } lg:flex w-full lg:w-96 bg-white flex-col`}
          >
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("subtitle")}
                className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 text-xs lg:text-sm font-medium border-b-2 transition ${
                  activeTab === "subtitle"
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Phụ đề
              </button>
              <button
                onClick={() => setActiveTab("translation")}
                className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 text-xs lg:text-sm font-medium border-b-2 transition ${
                  activeTab === "translation"
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Bản dịch
              </button>
            </div>

            {/* Level Selection */}
            <div className="p-3 lg:p-4 border-b border-gray-200">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedLevel("N5")}
                  className={`px-2.5 lg:px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedLevel === "N5"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  N5
                </button>
                <button
                  onClick={() => setSelectedLevel("N4")}
                  className={`px-2.5 lg:px-3 py-1 rounded-lg text-xs font-medium transition ${
                    selectedLevel === "N4"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  N4
                </button>
                <button className="px-2.5 lg:px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                  Mới bắt đầu
                </button>
              </div>
            </div>

            {/* Subtitle List */}
            <div className="flex-1 overflow-y-auto">
              {subtitles.map((item) => (
                <div
                  key={item.id}
                  className="p-3 lg:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition group"
                >
                  <div className="flex items-start gap-2 lg:gap-3">
                    <button className="mt-1 p-1 lg:p-1.5 hover:bg-emerald-100 rounded-lg transition opacity-0 group-hover:opacity-100">
                      <Play className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-600" />
                    </button>
                    <div className="flex-1 space-y-1.5 lg:space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-500">
                          {item.time}
                        </span>
                        {item.vietnamese && (
                          <div className="flex gap-1">
                            <button className="text-xs px-1.5 lg:px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition">
                              {item.vietnamese}
                            </button>
                            {item.id === 2 && (
                              <button className="text-xs px-1.5 lg:px-2 py-0.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition">
                                Chia sẻ
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs lg:text-sm font-medium text-gray-900">
                        {item.japanese}
                      </div>
                      {activeTab === "translation" && (
                        <div className="text-xs text-gray-600 italic">
                          {item.translation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
