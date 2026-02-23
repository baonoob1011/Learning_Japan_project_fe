"use client";
import { useRouter } from "next/navigation";

interface FloatingChatButtonProps {
  isDarkMode?: boolean;
}

export default function FloatingChatButton({
  isDarkMode = false,
}: FloatingChatButtonProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-28 right-6 z-[9998]">
      <button
        onClick={() => router.push("/chat")}
        className="group relative transition-all duration-300 hover:scale-110"
        title="Chat Room"
      >
        {/* Ping glow */}
        <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 animate-ping" />

        {/* Dùng ảnh message.png từ public/ */}
        <div className="relative w-16 h-16 drop-shadow-2xl">
          <img
            src="/message.png"
            alt="Chat Room"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
          <div className="bg-gray-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            Chat Room
            <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-800" />
          </div>
        </div>
      </button>
    </div>
  );
}
