import React from "react";
import { MousePointer2, MousePointerClick } from "lucide-react";

interface AutoScrollToggleProps {
  autoScrollEnabled: boolean;
  onToggle: () => void;
}

export default function AutoScrollToggle({
  autoScrollEnabled,
  onToggle,
}: AutoScrollToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        autoScrollEnabled
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      title={autoScrollEnabled ? "Tắt tự cuộn" : "Bật tự cuộn"}
    >
      {autoScrollEnabled ? (
        <>
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>Tự cuộn</span>
        </>
      ) : (
        <>
          <MousePointer2 className="w-3.5 h-3.5" />
          <span>Thủ công</span>
        </>
      )}
    </button>
  );
}
