"use client";

import { useEffect, useRef } from "react";
import { Phone, PhoneOff, User } from "lucide-react";

interface Props {
    callerName: string;
    callerAvatar: string;
    onAccept: () => void;
    onDecline: () => void;
    isDarkMode?: boolean;
    type?: "VIDEO" | "VOICE";
}

export const IncomingCallToast = ({
    callerName,
    callerAvatar,
    onAccept,
    onDecline,
    isDarkMode = false,
    type = "VIDEO",
}: Props) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Facebook Messenger ringtone style (placeholder URL)
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3");
        audio.loop = true;
        audio.play().catch(console.error);
        audioRef.current = audio;

        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    return (
        <div className={`fixed bottom-24 right-5 z-[10000] w-72 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border p-4 animate-slide-up-fade ${isDarkMode ? "bg-gray-800 border-gray-700 shadow-cyan-900/10" : "bg-white border-cyan-100 shadow-gray-200/50"
            }`}>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img
                        src={callerAvatar || "/default-avatar.png"}
                        alt={callerName}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-cyan-500 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {callerName}
                    </h4>
                    <p className={`text-xs animate-pulse ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`}>
                        {type === "VIDEO" ? "Đang gọi video cho bạn..." : "Đang gọi thoại cho bạn..."}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
                <button
                    onClick={onDecline}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20"
                >
                    <PhoneOff size={14} />
                    Từ chối
                </button>
                <button
                    onClick={onAccept}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                    <Phone size={14} />
                    Chấp nhận
                </button>
            </div>

            <style jsx>{`
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up-fade {
          animation: slide-up-fade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
        </div>
    );
};
