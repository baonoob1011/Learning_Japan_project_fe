"use client";
import React, { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useDarkMode } from "@/hooks/useDarkMode";
import LoadingCat from "@/components/LoadingCat";
import Flashcard from "@/components/vocab/Flashcard";
import VocabularyList from "@/components/VocabularyList";
import AIPractice from "@/components/AIPractice";
import VocabMemoryGame from "@/components/vocab/VocabMemoryGame";
import UpgradePlusModal from "@/components/payment/Upgradeplusmodal ";
import { getAccessTokenFromStorage, getRolesFromToken } from "@/utils/jwt";
import SmartStudy from "@/components/vocab/SmartStudy";
import { vocabService, VocabResponse } from "@/services/vocabService";
import { useVip } from "@/hooks/useVip";

type TabId = "smart" | "vocabulary" | "flashcard" | "review" | "quiz" | "game";

const TABS: {
  id: TabId;
  label: string;
  icon: string;
  vipOnly?: boolean;
  color?: string;
}[] = [
    { id: "vocabulary", label: "Danh sách", icon: "📚" },
    { id: "flashcard", label: "Flashcard", icon: "🃏" },
    { id: "smart", label: "Học thông minh", icon: "⚡", color: "cyan", vipOnly: true },
    { id: "quiz", label: "Quiz AI", icon: "🤖", vipOnly: true },
    { id: "game", label: "Trò chơi", icon: "🎮", vipOnly: true, color: "orange" },
  ];

export default function VocabularyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(4);
  const [activeTab, setActiveTab] = useState<TabId>("vocabulary");
  const [vocabs, setVocabs] = useState<VocabResponse[]>([]);
  const [isLoadingVocabs, setIsLoadingVocabs] = useState(true);
  const [flashcardFilter, setFlashcardFilter] = useState<"ALL" | "KNOWN" | "UNLEARNED">("ALL");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const isVip = useVip();
  const { isDarkMode, toggleDarkMode, mounted } = useDarkMode();

  const loadAllVocabs = useCallback(async () => {
    try {
      setIsLoadingVocabs(true);
      const data = await vocabService.getMyVocabs();
      setVocabs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingVocabs(false);
    }
  }, []);

  useEffect(() => {
    loadAllVocabs();
  }, [loadAllVocabs]);

  const openSmartStudy = async () => {
    if (!isVip) {
      setShowUpgradeModal(true);
      return;
    }

    await loadAllVocabs();
    setActiveTab("smart");
  };

  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <LoadingCat size="xl" isDark={true} message="Đang tải" subMessage="Vui lòng đợi trong giây lát" />
        </div>
      </div>
    );
  }

  const handleTabClick = (tab: typeof TABS[number]) => {
    if (tab.vipOnly && !isVip) {
      setShowUpgradeModal(true);
      return;
    }

    if (tab.id === "smart") {
      openSmartStudy();
      return;
    }

    setActiveTab(tab.id);
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <>
      <div className={`flex h-screen ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50"}`}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          currentStreak={currentStreak}
          onStreakUpdate={setCurrentStreak}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />

          {/* Page Title Bar */}
          <div className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur-sm border-cyan-100"} border-b px-6 py-3 shadow-sm flex items-center justify-between`}>
            <h1 className={`text-xl font-bold ${isDarkMode ? "text-gray-100" : "bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent"}`}>
              📖 Từ vựng của tôi
            </h1>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isDarkMode ? "bg-gray-700 text-gray-400" : "bg-cyan-50 text-cyan-600"}`}>
              {activeTabMeta?.icon} {activeTabMeta?.label}
            </span>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full pt-6 pb-8 px-6">

              {/* Tab Navigation */}
              <div className={`flex flex-wrap gap-1.5 mb-6 p-1.5 rounded-2xl border ${isDarkMode ? "bg-gray-800/70 border-gray-700" : "bg-white/70 border-gray-200 shadow-sm"}`}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const isCyan = tab.color === "cyan";
                  const isOrange = tab.color === "orange";

                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab)}
                      title={tab.vipOnly ? "Chỉ dành cho VIP 👑" : tab.label}
                      className={`
                        relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 min-w-[80px]
                        ${isActive
                          ? isCyan
                            ? "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.03]"
                            : isOrange
                              ? "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg shadow-orange-500/25"
                              : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 scale-[1.03]"
                          : isDarkMode
                            ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/60"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/80"
                        }
                      `}
                    >
                      <span className="text-base leading-none">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.vipOnly && (
                        <span className={`absolute -top-1.5 -right-1 text-[9px] font-black px-1 py-0.5 rounded-full leading-none transition-colors duration-300 ${isVip
                          ? isDarkMode ? "bg-gray-700 text-gray-500" : "bg-gray-200 text-gray-400"
                          : "bg-amber-400 text-gray-900 shadow-sm shadow-amber-500/20"
                          }`}>
                          VIP
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              {isLoadingVocabs ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <LoadingCat size="lg" isDark={isDarkMode} />
                </div>
              ) : (
                <>
                  {activeTab === "smart" && (
                    <SmartStudy
                      isDarkMode={isDarkMode}
                      vocabs={vocabs}
                      onFinish={async () => {
                        await loadAllVocabs();
                        setActiveTab("vocabulary");
                      }}
                    />
                  )}

                  {activeTab === "vocabulary" && (
                    <VocabularyList
                      isDarkMode={isDarkMode}
                      onStartLearning={(f) => {
                        setFlashcardFilter(f);
                        setActiveTab("flashcard");
                      }}
                    />
                  )}

                  {activeTab === "flashcard" && (
                    <Flashcard isDark={isDarkMode} initialFilter={flashcardFilter} />
                  )}

                  {activeTab === "quiz" && (
                    <AIPractice isDark={isDarkMode} />
                  )}

                  {activeTab === "game" && (
                    <VocabMemoryGame isDarkMode={isDarkMode} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <UpgradePlusModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        isDarkMode={isDarkMode}
      />
    </>
  );
}
