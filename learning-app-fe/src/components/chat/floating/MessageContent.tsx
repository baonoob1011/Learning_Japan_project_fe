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
    onNavigate: (path: string) => void;
}

export default function MessageContent({
    text,
    isMe,
    onNavigate,
}: MessageContentProps) {
    const ytMatches = Array.from(new Set(text.match(YT_REGEX) || []));

    if (ytMatches.length === 0) {
        return (
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{text}</p>
        );
    }

    const plainText = text.replace(YT_REGEX, "").trim();
    return (
        <div className="space-y-1.5">
            {plainText && (
                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                    {plainText}
                </p>
            )}
            {ytMatches.map((url) => {
                const videoId = extractYoutubeId(url);
                if (!videoId) return null;
                const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                return (
                    <button
                        key={url}
                        onClick={() => onNavigate(`/video/${videoId}`)}
                        className={`w-full text-left rounded-xl overflow-hidden border transition-all hover:scale-[1.02] hover:shadow-lg ${isMe
                                ? "border-white/20 bg-white/10"
                                : "border-gray-600 bg-gray-700"
                            }`}
                    >
                        <div className="relative">
                            <img
                                src={thumb}
                                alt="video"
                                className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <PlayCircle className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                        </div>
                        <div
                            className={`px-2 py-1.5 text-[10px] font-medium truncate ${isMe ? "text-white/90" : "text-gray-200"
                                }`}
                        >
                            {url}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
