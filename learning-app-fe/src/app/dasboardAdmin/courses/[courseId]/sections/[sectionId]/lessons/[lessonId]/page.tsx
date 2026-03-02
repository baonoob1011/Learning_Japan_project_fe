"use client";
import React, { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import {
    BookText,
    CheckCircle2,
    ChevronRight,
    Loader2,
    Plus,
    Trash2,
    ArrowLeft,
    Video,
    FileText,
    UploadCloud,
    X,
    FolderSync
} from "lucide-react";
import { courseService, CourseResponse } from "@/services/courseService";
import { sectionService, SectionResponse } from "@/services/sectionService";
import { lessonService, LessonResponse } from "@/services/lessonService";
import { lessonPartService, LessonPartResponse, CreateLessonPartRequest } from "@/services/lessonPartService";
import { lessonDocumentService, LessonDocumentResponse, CreateLessonDocumentRequest } from "@/services/lessonDocumentService";

export default function AdminLessonBuilderPage({ params }: { params: Promise<{ courseId: string, sectionId: string, lessonId: string }> }) {
    const router = useRouter();
    const { courseId, sectionId, lessonId } = use(params);
    const [isReady, setIsReady] = useState(false);
    const { isDarkMode: isDark } = useDarkMode();

    // Breadcrumbs Data
    const [course, setCourse] = useState<CourseResponse | null>(null);
    const [section, setSection] = useState<SectionResponse | null>(null);
    const [lesson, setLesson] = useState<LessonResponse | null>(null);
    const [globalLoading, setGlobalLoading] = useState(true);

    // Active Tab (parts | documents)
    const [activeTab, setActiveTab] = useState<"parts" | "docs">("parts");

    /* --- LESSON PARTS STATE --- */
    const [parts, setParts] = useState<LessonPartResponse[]>([]);
    const [isAddingPart, setIsAddingPart] = useState(false);
    const [newPartTitle, setNewPartTitle] = useState("");
    const [newPartOrder, setNewPartOrder] = useState(1);
    const [isSubmittingPart, setIsSubmittingPart] = useState(false);

    /* --- LESSON DOCUMENTS STATE --- */
    const [docs, setDocs] = useState<LessonDocumentResponse[]>([]);
    const [isAddingDoc, setIsAddingDoc] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState("");
    const [newDocOrder, setNewDocOrder] = useState(1);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsReady(true);
    }, []);

    useEffect(() => {
        if (!isReady || !courseId || !sectionId || !lessonId) return;

        const fetchAll = async () => {
            try {
                const [c, s, l, p, d] = await Promise.all([
                    courseService.getDetail(courseId),
                    sectionService.getDetail(sectionId),
                    lessonService.getDetail(lessonId),
                    lessonPartService.getByLesson(lessonId),
                    lessonDocumentService.getByLesson(lessonId)
                ]);

                setCourse(c);
                setSection(s);
                setLesson(l);

                p.sort((a, b) => a.partOrder - b.partOrder);
                setParts(p);
                setNewPartOrder(p.length + 1);

                d.sort((a, b) => a.documentOrder - b.documentOrder);
                setDocs(d);
                setNewDocOrder(d.length + 1);

            } catch (error) {
                console.error("Failed to fetch builder data:", error);
            } finally {
                setGlobalLoading(false);
            }
        };

        fetchAll();
    }, [isReady, courseId, sectionId, lessonId]);

    /* =================== LESSON PART HANDLERS =================== */
    const handleCreatePart = async () => {
        if (!newPartTitle.trim() || newPartOrder < 1) return;
        setIsSubmittingPart(true);
        try {
            const req: CreateLessonPartRequest = {
                lessonId,
                title: newPartTitle.trim(),
                partOrder: newPartOrder
            };
            await lessonPartService.create(req);

            // Re-fetch
            const updated = await lessonPartService.getByLesson(lessonId);
            updated.sort((a, b) => a.partOrder - b.partOrder);
            setParts(updated);

            setNewPartTitle("");
            setNewPartOrder(updated.length + 1);
            setIsAddingPart(false);
        } catch (error) {
            console.error(error);
            alert("Create Part failed!");
        } finally {
            setIsSubmittingPart(false);
        }
    };

    const handleDeletePart = async (e: React.MouseEvent, partId: string) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc muốn xóa phần học này?")) return;
        try {
            await lessonPartService.delete(partId);
            setParts(prev => {
                const arr = prev.filter(x => x.id !== partId);
                setNewPartOrder(arr.length + 1);
                return arr;
            });
        } catch (error) {
            console.error(error);
            alert("Xóa không thành công!");
        }
    };

    /* =================== LESSON DOCUMENT HANDLERS =================== */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            // Tự động gán tên file làm title nếu title rỗng
            if (!newDocTitle) {
                setNewDocTitle(e.target.files[0].name.split(".")[0] || "");
            }
        }
    };

    const handleCreateDoc = async () => {
        if (!selectedFile || !newDocTitle.trim() || newDocOrder < 1) return;
        setIsSubmittingDoc(true);
        try {
            const req: CreateLessonDocumentRequest = {
                lessonId,
                title: newDocTitle.trim(),
                documentOrder: newDocOrder,
                file: selectedFile
            };
            await lessonDocumentService.create(req);

            // Re-fetch
            const updated = await lessonDocumentService.getByLesson(lessonId);
            updated.sort((a, b) => a.documentOrder - b.documentOrder);
            setDocs(updated);

            setNewDocTitle("");
            setSelectedFile(null);
            setNewDocOrder(updated.length + 1);
            setIsAddingDoc(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error(error);
            alert("Upload Document failed!");
        } finally {
            setIsSubmittingDoc(false);
        }
    };

    const handleDeleteDoc = async (e: React.MouseEvent, docId: string) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc muốn xóa tài liệu này vĩnh viễn?")) return;
        try {
            await lessonDocumentService.delete(docId);
            setDocs(prev => {
                const arr = prev.filter(x => x.id !== docId);
                setNewDocOrder(arr.length + 1);
                return arr;
            });
        } catch (error) {
            console.error(error);
            alert("Xóa tài liệu không thành công!");
        }
    };


    if (!isReady || globalLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
            {/* Breadcrumbs */}
            <div className={`flex items-center gap-2 text-sm font-medium mb-4 ${isDark ? "text-gray-400" : "text-gray-500"} overflow-x-auto whitespace-nowrap pb-2 custom-scrollbar`}>
                <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => router.push('/dasboardAdmin')}>Dashboard</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => router.push('/dasboardAdmin/courses')}>Khóa học</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="hover:text-indigo-500 cursor-pointer transition-colors truncate max-w-[150px]" onClick={() => router.push(`/dasboardAdmin/courses/${courseId}`)}>{course?.title}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className="hover:text-indigo-500 cursor-pointer transition-colors truncate max-w-[150px]" onClick={() => router.push(`/dasboardAdmin/courses/${courseId}/sections/${sectionId}`)}>{section?.title}</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
                <span className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>{lesson?.title}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/dasboardAdmin/courses/${courseId}/sections/${sectionId}`)}
                        className={`p-2.5 rounded-full border transition-all ${isDark ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"}`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className={`text-3xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <FolderSync className={`w-8 h-8 ${isDark ? "text-teal-400" : "text-teal-600"}`} />
                            Cấu trúc Bài học
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Thiết lập nội dung & file tài liệu cho bài: <strong className={isDark ? "text-gray-200" : "text-gray-700"}>{lesson?.title}</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Split View / Tabs */}
            <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>

                {/* Tab Switcher */}
                <div className={`flex border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    <button
                        onClick={() => setActiveTab("parts")}
                        className={`flex-1 py-4 text-center font-bold text-sm tracking-wide transition-all ${activeTab === "parts"
                            ? isDark ? "bg-teal-500/10 text-teal-400 border-b-2 border-teal-400" : "bg-teal-50 text-teal-600 border-b-2 border-teal-600"
                            : isDark ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <Video className="w-4 h-4" /> Lesson Parts (Phần học / Vocabulary)
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("docs")}
                        className={`flex-1 py-4 text-center font-bold text-sm tracking-wide transition-all ${activeTab === "docs"
                            ? isDark ? "bg-orange-500/10 text-orange-400 border-b-2 border-orange-400" : "bg-orange-50 text-orange-600 border-b-2 border-orange-600"
                            : isDark ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" /> Documents (Tài liệu đính kèm)
                        </span>
                    </button>
                </div>

                {/* Content Area */}
                {activeTab === "parts" && (
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className={`font-bold text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                Các phần nội dung bài học ({parts.length})
                            </h3>
                            {!isAddingPart && (
                                <button onClick={() => setIsAddingPart(true)} className="px-4 py-2 font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center gap-2 transition active:scale-95">
                                    <Plus className="w-4 h-4" /> Thêm Part
                                </button>
                            )}
                        </div>

                        {/* Add Form */}
                        {isAddingPart && (
                            <div className={`p-5 rounded-2xl border ${isDark ? "bg-gray-900/50 border-teal-500/30" : "bg-teal-50/50 border-teal-100"}`}>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="sm:col-span-2">
                                        <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Tiêu đề phần <span className="text-red-500">*</span></label>
                                        <input type="text" autoFocus value={newPartTitle} onChange={(e) => setNewPartTitle(e.target.value)} placeholder="Ví dụ: Từ vựng 1" className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? "bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-teal-400" : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-teal-500"}`} />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Thứ tự <span className="text-red-500">*</span></label>
                                        <input type="number" min="1" value={newPartOrder} onChange={(e) => setNewPartOrder(Number(e.target.value))} className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? "bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-teal-400" : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-teal-500"}`} />
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-3">
                                    <button onClick={() => setIsAddingPart(false)} className={`px-4 py-2 font-bold text-sm transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Hủy</button>
                                    <button onClick={handleCreatePart} disabled={isSubmittingPart || !newPartTitle} className={`px-5 py-2 font-bold text-sm text-white rounded-xl shadow-md flex items-center gap-2 ${isSubmittingPart || !newPartTitle ? "bg-gray-500/50 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"}`}>
                                        {isSubmittingPart ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Lưu Part
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List Parts */}
                        <div className="grid gap-3">
                            {parts.length === 0 ? (
                                <div className={`text-center py-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Chưa có phần học nào.</div>
                            ) : (
                                parts.map(p => (
                                    <div key={p.id} className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${isDark ? "bg-gray-800/80 border-gray-700 hover:border-teal-500/50" : "bg-white border-gray-200 hover:border-teal-300"}`}>
                                        <div className="flex items-center gap-4">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{p.partOrder}</span>
                                            <div>
                                                <p className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>{p.title}</p>
                                                {p.videoUrl && <p className="text-xs text-blue-500 truncate max-w-xs">{p.videoUrl}</p>}
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleDeletePart(e, p.id)} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-red-500/20 text-gray-500 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "docs" && (
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className={`font-bold text-lg ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                Các file tài liệu ({docs.length})
                            </h3>
                            {!isAddingDoc && (
                                <button onClick={() => setIsAddingDoc(true)} className="px-4 py-2 font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition active:scale-95">
                                    <Plus className="w-4 h-4" /> Tải tài liệu lên
                                </button>
                            )}
                        </div>

                        {/* Upload Form */}
                        {isAddingDoc && (
                            <div className={`p-5 rounded-2xl border ${isDark ? "bg-gray-900/50 border-orange-500/30" : "bg-orange-50/50 border-orange-100"}`}>
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <div className="sm:col-span-3">
                                        <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Tên tài liệu hiển thị <span className="text-red-500">*</span></label>
                                        <input type="text" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} placeholder="Tên tài liệu (sẽ lấy theo tên file tự động)" className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? "bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-orange-400" : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500"}`} />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Thứ tự <span className="text-red-500">*</span></label>
                                        <input type="number" min="1" value={newDocOrder} onChange={(e) => setNewDocOrder(Number(e.target.value))} className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${isDark ? "bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-orange-400" : "bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-orange-500"}`} />
                                    </div>

                                    <div className="sm:col-span-4 mt-2">
                                        <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Chọn File (PDF, DOCX...) <span className="text-red-500">*</span></label>
                                        <div className={`flex items-center gap-4 p-4 border border-dashed rounded-xl ${isDark ? "border-gray-600 bg-gray-800/50" : "border-gray-300 bg-white"}`}>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-bold border transition-colors flex items-center gap-2 ${isDark ? "border-orange-500/50 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" : "border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>
                                                <UploadCloud className="w-4 h-4" /> Duyệt từ máy tính
                                            </label>

                                            {selectedFile ? (
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className={`text-sm font-medium truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}>{selectedFile.name}</span>
                                                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                    <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; setNewDocTitle(""); }} className="p-1 hover:bg-red-500/20 text-red-400 rounded-full"><X className="w-3 h-3" /></button>
                                                </div>
                                            ) : (
                                                <span className={`text-sm italic ${isDark ? "text-gray-500" : "text-gray-400"}`}>Chưa chọn file nào</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <button onClick={() => setIsAddingDoc(false)} className={`px-4 py-2 font-bold text-sm transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}>Hủy</button>
                                    <button onClick={handleCreateDoc} disabled={isSubmittingDoc || !newDocTitle || !selectedFile} className={`px-5 py-2 font-bold text-sm text-white rounded-xl shadow-md flex items-center gap-2 ${isSubmittingDoc || !newDocTitle || !selectedFile ? "bg-gray-500/50 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"}`}>
                                        {isSubmittingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />} Upload Tài liệu
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List Docs */}
                        <div className="grid gap-3">
                            {docs.length === 0 ? (
                                <div className={`text-center py-10 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Chưa có tài liệu đính kèm nào.</div>
                            ) : (
                                docs.map(d => (
                                    <div key={d.id} className={`flex items-center justify-between p-4 border rounded-xl transition-colors ${isDark ? "bg-gray-800/80 border-gray-700 hover:border-orange-500/50" : "bg-white border-gray-200 hover:border-orange-300"}`}>
                                        <div className="flex items-center gap-4">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>{d.documentOrder}</span>
                                            <div className="flex items-center gap-3">
                                                <FileText className={`w-6 h-6 ${isDark ? "text-orange-400" : "text-orange-500"}`} />
                                                <div>
                                                    <p className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>{d.title}</p>
                                                    <a href={d.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Link file tải xuống</a>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={(e) => handleDeleteDoc(e, d.id)} className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-red-500/20 text-gray-500 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
