"use client";
import { PlayCircle } from "lucide-react";

export const YT_REGEX =
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([\w-]+)|https?:\/\/youtu\.be\/([\w-]+)/g;

export function extractYoutubeId(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return m ? m[1] : null;
}

interface MessageContentProps {
    text: string;
    isMe: boolean;
    isDarkMode: boolean;
    onNavigate: (path: string) => void;
}

export default function MessageContent({
    text,
    isMe,
    isDarkMode: dark,
    onNavigate,
}: MessageContentProps) {
    const ytMatches = Array.from(new Set(text.match(YT_REGEX) || []));

    if (ytMatches.length === 0) {
        return (
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{text}</p>
        );
    }

    // Regex to detect internal video routes
    const ROUTE_REGEX = /\/video\/[\w-]+/g;

    let plainText = text.replace(YT_REGEX, "").replace(ROUTE_REGEX, "").trim();
    // Detect if plainText is just a video title (started with 🎬)
    const displayTitle = plainText.startsWith("🎬") ? plainText : null;
    const bodyText = displayTitle ? null : plainText;

    return (
        <div className="space-y-2.5">
            {bodyText && (
                <p className="text-xs leading-relaxed whitespace-pre-wrap opacity-90 px-1">
                    {bodyText}
                </p>
            )}
            {ytMatches.map((url) => {
                const videoId = extractYoutubeId(url);
                if (!videoId) return null;
                const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                return (
                    <button
                        key={url}
                        onClick={() => onNavigate(`/video/${videoId}`)}
                        className={`w-full text-left rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group active:scale-95 shadow-lg ${isMe
                                ? dark
                                    ? "border-white/10 bg-gray-950"
                                    : "border-cyan-200 bg-cyan-50/50"
                                : dark
                                    ? "border-white/5 bg-gray-900"
                                    : "border-gray-100 bg-gray-50/50"
                            }`}
                    >
                        {/* Title bar with dark background */}
                        {displayTitle && (
                            <div className={`px-3 py-2.5 border-b text-[11px] font-bold truncate flex items-center gap-2 ${dark
                                    ? "border-white/5 bg-white/5 text-gray-100"
                                    : "border-cyan-100 bg-cyan-100/30 text-cyan-800"
                                }`}>
                                <span className="p-1 rounded bg-red-500/20 text-red-500 shrink-0">
                                    <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-current border-b-[3px] border-b-transparent ml-0.5" />
                                </span>
                                <span className="truncate">{displayTitle.replace("🎬", "").trim()}</span>
                            </div>
                        )}

                        <div className="relative aspect-video">
                            <img
                                src={thumb}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                                }}
                                alt="video"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Overlay with central play button */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all duration-300">
                                <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600 shadow-xl shadow-red-600/20">
                                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                                </div>
                            </div>

                            {/* Internal Route Tag */}
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-cyan-400 uppercase tracking-widest shadow-lg">
                                Internal Path
                            </div>
                        </div>

                        <div className="px-3 py-2 flex items-center justify-between">
                            <span className={`text-[9px] font-medium truncate max-w-[150px] ${isMe ? "text-gray-500" : "text-gray-600"}`}>
                                {url}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">HD Available</span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
