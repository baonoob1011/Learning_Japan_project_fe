"use client";
import React, { useEffect, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { youtubeService, YoutubeVideoSummary } from "@/services/videoService";
import { Video, Loader2, Calendar, Tag, Layers, ExternalLink } from "lucide-react";
import VideoCreationBar from "@/components/admin/dashboard/VideoCreationBar";

export default function AdminVideosPage() {
    const { isDarkMode: isDark } = useDarkMode();
    const [videos, setVideos] = useState<YoutubeVideoSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchVideos = async () => {
        setIsLoading(true);
        try {
            const data = await youtubeService.getAll();
            const filteredData = data.filter(video =>
                video.videoTag &&
                video.level &&
                video.videoTag !== ("" as any) &&
                video.level !== ("" as any)
            );
            setVideos(filteredData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("Failed to fetch videos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    return (
        <main className="p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                        <Video className={`w-8 h-8 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
                        Quản lý Video Shadowing
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Thêm mới và xem danh sách các video luyện tập Shadowing trên hệ thống.
                    </p>
                </div>
            </div>

            {/* Creation Bar */}
            <VideoCreationBar isDark={isDark} onSuccess={fetchVideos} />

            {/* Video List Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                    <h3 className={`font-bold uppercase tracking-wider text-sm ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                        Danh sách video ({videos.length})
                    </h3>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
                    </div>
                ) : videos.length === 0 ? (
                    <div className={`text-center py-20 rounded-3xl border border-dashed ${isDark ? "border-gray-700 bg-gray-800/50 text-gray-500" : "border-gray-200 bg-white text-gray-400"}`}>
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Chưa có video nào trên hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                className={`group rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md ${isDark ? "bg-gray-800 border-gray-700 hover:border-teal-500/50" : "bg-white border-gray-100 hover:border-teal-300"}`}
                            >
                                {/* Thumbnail Placeholder - using CSS gradient to keep it simple and premium */}
                                <div className={`aspect-video w-full flex items-center justify-center relative overflow-hidden ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-indigo-500/20"></div>
                                    <Video className={`w-12 h-12 opacity-20 ${isDark ? "text-white" : "text-gray-900"}`} />

                                    {/* Badges */}
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                                            {video.level}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-500/80 text-white backdrop-blur-md">
                                            {video.videoTag}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    <h4 className={`font-bold text-sm line-clamp-2 leading-snug h-10 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                                        {video.title}
                                    </h4>

                                    <div className={`flex items-center justify-between text-[11px] font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {video.createdAt ? new Date(video.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5" />
                                            {video.duration || "N/A"}
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <a
                                            href={video.urlVideo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex-1 py-2 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-2 ${isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> Xem trên YT
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
