"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import {
    FileEdit,
    ChevronRight,
    ChevronDown,
    Loader2,
    Plus,
    Trash2,
    Clock,
    CheckCircle2,
    Trophy,
    Calendar,
    Users as UsersIcon,
    ArrowLeft,
    Zap,
    AlertCircle,
    BookOpen,
    Layers,
    Hash,
    Activity,
    Target,
    Volume2,
    ImageIcon,
    CheckSquare,
    XSquare,
    Edit3,
    Save,
    X,
    Type,
    ListOrdered,
    Upload,
    FileUp,
} from "lucide-react";
import { examService, ExamResponse, SectionWithQuestionsResponse } from "@/services/examService";
import { assessmentItemService, AssessmentItemResponse, UpdateAssessmentItemRequest } from "@/services/assessmentItemService";
import { batchService } from "@/services/batchService";
import { BatchJobType } from "@/enums/BatchJobType";
import { AssessmentType } from "@/enums/assessmentType";
import { s3Service } from "@/services/s3Service";

interface ExamDetail {
    sections: SectionWithQuestionsResponse[];
    assessmentItems: Record<string, AssessmentItemResponse[]>;
}

export default function ExamManagementPage() {
    const router = useRouter();
    const { isDarkMode: isDark } = useDarkMode();

    const [exams, setExams] = useState<ExamResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRunningBatch, setIsRunningBatch] = useState(false);
    const [batchMessage, setBatchMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingJob, setPendingJob] = useState<BatchJobType | null>(null);

    // Upload exam state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<{ ok: boolean; msg: string } | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Inline detail state
    const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [examDetails, setExamDetails] = useState<Record<string, ExamDetail>>({});
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    // Assessment item edit state
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editLevel, setEditLevel] = useState("");
    const [editCount, setEditCount] = useState(0);
    const [editPoint, setEditPoint] = useState(0);
    const [editType, setEditType] = useState<AssessmentType>(AssessmentType.VOCAB_CONTEXT);
    const [isUpdatingItem, setIsUpdatingItem] = useState(false);
    const [updateMsg, setUpdateMsg] = useState<{ text: string; ok: boolean } | null>(null);

    const fetchExams = async () => {
        try {
            const data = await examService.getAll();
            setExams(data);
        } catch (error) {
            console.error("Failed to fetch exams:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const triggerBatch = (type: BatchJobType) => {
        setPendingJob(type);
        setShowConfirm(true);
    };

    const handleConfirmBatch = async () => {
        if (!pendingJob) return;
        setShowConfirm(false);
        setIsRunningBatch(true);
        setBatchMessage(null);
        try {
            await batchService.runJob(pendingJob);
            setBatchMessage(`Batch job ${pendingJob} đã được kích hoạt thành công!`);
            setTimeout(() => setBatchMessage(null), 5000);
            if (pendingJob === BatchJobType.EXAM) fetchExams();
        } catch (error) {
            console.error("Batch job failed:", error);
            alert("Kích hoạt batch job thất bại!");
        } finally {
            setIsRunningBatch(false);
            setPendingJob(null);
        }
    };

    const handleToggleExam = async (examId: string) => {
        if (expandedExamId === examId) {
            setExpandedExamId(null);
            return;
        }
        setExpandedExamId(examId);

        if (examDetails[examId]) return; // already loaded

        setDetailLoading(true);
        try {
            const sections = await examService.getSections(examId);
            const itemsMap: Record<string, AssessmentItemResponse[]> = {};
            for (const section of sections) {
                itemsMap[section.id] = await assessmentItemService.getBySection(section.id);
            }
            setExamDetails(prev => ({ ...prev, [examId]: { sections, assessmentItems: itemsMap } }));
            // Auto-expand first section
            if (sections.length > 0) {
                setExpandedSections(prev => ({ ...prev, [sections[0].id]: true }));
            }
        } catch (err) {
            console.error("Failed to load exam detail:", err);
        } finally {
            setDetailLoading(false);
        }
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const parseOptions = (optionsJson: string): string[] => {
        try { return JSON.parse(optionsJson); } catch { return []; }
    };

    const startEditItem = (item: AssessmentItemResponse) => {
        setEditingItemId(item.id);
        setEditName(item.name);
        setEditLevel(item.level);
        setEditCount(item.questionCount);
        setEditPoint(item.pointPerQuestion);
        setEditType(item.assessmentType);
        setUpdateMsg(null);
    };

    const handleUpdateItem = async (examId: string, sectionId: string) => {
        if (!editingItemId) return;
        setIsUpdatingItem(true);
        try {
            const req: UpdateAssessmentItemRequest = {
                name: editName,
                level: editLevel,
                questionCount: editCount,
                pointPerQuestion: editPoint,
                assessmentType: editType,
            };
            await assessmentItemService.update(editingItemId, req);
            // Refresh items for this section
            const updated = await assessmentItemService.getBySection(sectionId);
            setExamDetails(prev => ({
                ...prev,
                [examId]: {
                    ...prev[examId],
                    assessmentItems: { ...prev[examId].assessmentItems, [sectionId]: updated },
                },
            }));
            setEditingItemId(null);
            setUpdateMsg({ text: "Cập nhật thành công!", ok: true });
            setTimeout(() => setUpdateMsg(null), 3000);
        } catch (err) {
            console.error(err);
            setUpdateMsg({ text: "Cập nhật thất bại!", ok: false });
        } finally {
            setIsUpdatingItem(false);
        }
    };

    const handleUploadExam = async () => {
        if (!uploadFile) return;
        setIsUploading(true);
        setUploadProgress(0);
        setUploadResult(null);
        try {
            await s3Service.uploadExam(uploadFile, setUploadProgress);
            setUploadResult({ ok: true, msg: `Import "${uploadFile.name}" thành công!` });
            setUploadFile(null);
            // Refresh exam list
            await fetchExams();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Upload thất bại, vui lòng thử lại.";
            setUploadResult({ ok: false, msg });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-700 relative">

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
                    <div className={`relative w-full max-w-md p-8 rounded-[32px] border shadow-2xl ${isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isDark ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-600"}`}>
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black mb-2 italic">Xác nhận chạy Batch?</h3>
                        <p className={`text-sm mb-8 font-medium leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Bạn đang yêu cầu chạy tiến trình <span className="text-blue-500 font-bold underline">Batch {pendingJob}</span>. Quá trình này sẽ đồng bộ dữ liệu hệ thống và có thể mất vài phút.
                        </p>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowConfirm(false)} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all ${isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>Hủy bỏ</button>
                            <button onClick={handleConfirmBatch} className="flex-1 py-4 rounded-2xl font-black text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Exam Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (!isUploading) { setShowUploadModal(false); setUploadFile(null); setUploadResult(null); } }} />
                    <div className={`relative w-full max-w-lg p-8 rounded-[32px] border shadow-2xl ${isDark ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-100 text-gray-900"}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600"}`}>
                                    <FileUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black">Import Đề thi</h3>
                                    <p className={`text-xs font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>Hỗ trợ file .csv</p>
                                </div>
                            </div>
                            {!isUploading && (
                                <button onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadResult(null); }} className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-gray-800 text-gray-500" : "hover:bg-gray-100 text-gray-400"}`}>
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Drop Zone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={e => {
                                e.preventDefault(); setIsDragging(false);
                                const f = e.dataTransfer.files[0];
                                if (f) { setUploadFile(f); setUploadResult(null); }
                            }}
                            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${isDragging
                                ? (isDark ? "border-violet-400 bg-violet-500/10" : "border-violet-400 bg-violet-50")
                                : uploadFile
                                    ? (isDark ? "border-emerald-500/50 bg-emerald-500/5" : "border-emerald-300 bg-emerald-50/50")
                                    : (isDark ? "border-gray-700 hover:border-gray-500" : "border-gray-200 hover:border-violet-300")
                                }`}
                        >
                            {uploadFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <p className={`font-black text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{uploadFile.name}</p>
                                    <p className={`text-xs font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>{(uploadFile.size / 1024).toFixed(1)} KB</p>
                                    <button onClick={() => setUploadFile(null)} className={`mt-1 text-xs font-black underline ${isDark ? "text-gray-500 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}>Xóa file</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <Upload className={`w-10 h-10 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
                                    <p className={`font-black text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Kéo thả file vào đây</p>
                                    <p className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>hoặc</p>
                                    <label className={`px-5 py-2.5 rounded-xl font-black text-sm cursor-pointer transition-all active:scale-95 ${isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
                                        Chọn file
                                        <input type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { setUploadFile(f); setUploadResult(null); } }} />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Progress */}
                        {isUploading && (
                            <div className="mt-5 space-y-2">
                                <div className="flex justify-between">
                                    <span className={`text-xs font-black ${isDark ? "text-gray-400" : "text-gray-500"}`}>Đang tải lên...</span>
                                    <span className={`text-xs font-black text-violet-500`}>{uploadProgress}%</span>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                                    <div
                                        className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Result message */}
                        {uploadResult && (
                            <div className={`mt-4 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold ${uploadResult.ok ? (isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-700")}`}>
                                {uploadResult.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                                {uploadResult.msg}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6">
                            <button
                                onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadResult(null); }}
                                disabled={isUploading}
                                className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all ${isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"} disabled:opacity-40`}
                            >
                                {uploadResult?.ok ? "Đóng" : "Hủy"}
                            </button>
                            <button
                                onClick={handleUploadExam}
                                disabled={!uploadFile || isUploading}
                                className={`flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${!uploadFile || isUploading ? "bg-gray-400 text-gray-200 cursor-not-allowed shadow-none" : "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-violet-500/20 hover:shadow-violet-500/30"}`}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {isUploading ? "Đang import..." : "Import ngay"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <span className="hover:text-blue-500 cursor-pointer transition-colors" onClick={() => router.push('/dasboardAdmin')}>Dashboard</span>
                <ChevronRight className="w-4 h-4" />
                <span className={`px-3 py-1 rounded-lg ${isDark ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-700"}`}>Quản lý Đề thi</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <button onClick={() => router.push('/dasboardAdmin')} className={`p-3 rounded-2xl border transition-all ${isDark ? "border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300" : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600"}`}>
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className={`text-4xl font-black tracking-tight flex items-center gap-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${isDark ? "from-indigo-900/40 to-blue-900/40" : "from-indigo-50 to-blue-50"}`}>
                                <FileEdit className={`w-10 h-10 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                            </div>
                            Quản lý Đề thi
                        </h1>
                        <div className={`text-sm mt-3 font-medium ${isDark ? "text-gray-400" : "text-gray-500"} flex items-center gap-2`}>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Tổng số bài thi: <span className="font-black text-blue-500">{exams.length}</span> bài thi JLPT
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className={`flex items-center p-1 rounded-2xl gap-1 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        <button onClick={() => triggerBatch(BatchJobType.EXAM)} disabled={isRunningBatch} className={`px-4 py-2.5 font-black rounded-xl flex items-center gap-2 text-xs transition-all active:scale-95 ${isRunningBatch ? "opacity-50 cursor-not-allowed" : isDark ? "hover:bg-gray-700 text-emerald-400" : "hover:bg-white text-emerald-600 shadow-sm"}`}>
                            <Zap className="w-4 h-4" /> Exam
                        </button>
                        <button onClick={() => triggerBatch(BatchJobType.SECTION_ASSESSMENT)} disabled={isRunningBatch} className={`px-4 py-2.5 font-black rounded-xl flex items-center gap-2 text-xs transition-all active:scale-95 ${isRunningBatch ? "opacity-50 cursor-not-allowed" : isDark ? "hover:bg-gray-700 text-amber-400" : "hover:bg-white text-amber-600 shadow-sm"}`}>
                            <Zap className="w-4 h-4" /> Assessment
                        </button>
                    </div>
                    <button
                        onClick={() => { setShowUploadModal(true); setUploadResult(null); setUploadFile(null); }}
                        className={`px-6 py-3.5 font-black rounded-2xl flex items-center gap-3 shadow-xl transition-all active:scale-95 text-sm border ${isDark ? "border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 shadow-violet-500/10" : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 shadow-violet-100"}`}
                    >
                        <FileUp className="w-5 h-5" /> Import Excel
                    </button>
                    <button className="px-6 py-3.5 font-black rounded-2xl flex items-center gap-3 shadow-xl transition-all active:scale-95 text-sm bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-blue-500/20 hover:shadow-blue-500/30">
                        <Plus className="w-5 h-5" /> Tạo Đề mới
                    </button>
                </div>
            </div>

            {batchMessage && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500 ${isDark ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border border-emerald-100 text-emerald-700"}`}>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">{batchMessage}</span>
                </div>
            )}

            {/* Exam List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 rounded-[40px] border-2 border-dashed border-gray-700/20">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                    <p className={`font-black tracking-widest text-sm uppercase ${isDark ? "text-gray-500" : "text-gray-400"}`}>Đang tải danh sách đề thi...</p>
                </div>
            ) : exams.length === 0 ? (
                <div className={`p-20 text-center rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center ${isDark ? "border-gray-800 bg-gray-800/20" : "border-gray-200 bg-gray-50"}`}>
                    <AlertCircle className={`w-16 h-16 mb-4 ${isDark ? "text-gray-700" : "text-gray-200"}`} />
                    <h3 className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Chưa có dữ liệu bài thi</h3>
                    <p className={`max-w-md mx-auto text-sm ${isDark ? "text-gray-500" : "text-gray-400"} font-medium`}>Nhấn "Tạo Đề mới" hoặc chạy Batch Update để đồng bộ dữ liệu.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {exams.map((exam) => {
                        const isOpen = expandedExamId === exam.id;
                        const detail = examDetails[exam.id];
                        return (
                            <div key={exam.id} className={`rounded-[28px] border overflow-hidden transition-all duration-500 ${isOpen
                                ? (isDark ? "border-blue-500/50 shadow-xl shadow-blue-500/10" : "border-blue-200 shadow-xl shadow-blue-100")
                                : (isDark ? "border-gray-700 hover:border-gray-500" : "border-gray-100 hover:border-blue-200")
                                } ${isDark ? "bg-gray-800/40" : "bg-white"}`}>

                                {/* Exam Header Row */}
                                <div
                                    className={`flex items-center justify-between p-6 cursor-pointer transition-all duration-300 ${isOpen ? (isDark ? "bg-blue-500/5" : "bg-blue-50/60") : ""}`}
                                    onClick={() => handleToggleExam(exam.id)}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg ${isDark ? "bg-gradient-to-br from-blue-600/30 to-indigo-600/30 text-blue-300" : "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700"}`}>
                                            <span className="text-[9px] uppercase tracking-widest opacity-60">JLPT</span>
                                            <span className="text-xl">{exam.level}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                                                    Đề <span className={isOpen ? "text-blue-500" : ""}>{exam.code}</span>
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{exam.level}</span>
                                            </div>
                                            <div className={`flex items-center gap-4 text-xs font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {exam.duration} phút</span>
                                                <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> {exam.numQuestions} câu hỏi</span>
                                                <span className="flex items-center gap-1.5"><UsersIcon className="w-3.5 h-3.5" /> {exam.participant} lượt thi</span>
                                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(exam.updatedAt || exam.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className={`p-2.5 rounded-xl border transition-all duration-300 ${isDark ? "border-gray-700 hover:bg-red-500/10 hover:text-red-400 text-gray-500" : "border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-400"}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className={`p-2.5 rounded-xl border transition-all duration-300 ${isOpen ? (isDark ? "bg-blue-500/20 border-blue-500/40 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600") : (isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400")}`}>
                                            <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${isOpen ? "rotate-180" : ""}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {isOpen && (
                                    <div className={`border-t ${isDark ? "border-gray-700/60" : "border-gray-100"} p-6 space-y-6`}>
                                        {detailLoading && !detail ? (
                                            <div className="flex items-center justify-center py-12 gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                                <span className={`font-bold text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Đang tải chi tiết đề thi...</span>
                                            </div>
                                        ) : detail ? (
                                            <div className="space-y-4">
                                                {detail.sections.map((section, sIdx) => {
                                                    const isSectionOpen = !!expandedSections[section.id];
                                                    const items = detail.assessmentItems[section.id] || [];
                                                    return (
                                                        <div key={section.id} className={`rounded-[20px] border overflow-hidden ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                                                            {/* Section Header */}
                                                            <div
                                                                className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isSectionOpen ? (isDark ? "bg-indigo-500/10" : "bg-indigo-50/80") : (isDark ? "bg-gray-800/60 hover:bg-gray-800" : "bg-gray-50 hover:bg-gray-100/80")}`}
                                                                onClick={() => toggleSection(section.id)}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow ${isDark ? "bg-indigo-600/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
                                                                        {section.sectionOrder}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`font-black text-base ${isDark ? "text-white" : "text-gray-900"}`}>{section.title}</p>
                                                                        <p className={`text-[11px] font-bold flex items-center gap-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{section.sectionDuration} phút</span>
                                                                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{section.questions?.length || 0} câu hỏi</span>
                                                                            <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{items.length} nhóm đánh giá</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isSectionOpen ? "rotate-180 text-indigo-500" : (isDark ? "text-gray-500" : "text-gray-400")}`} />
                                                            </div>

                                                            {/* Section Content */}
                                                            {isSectionOpen && (
                                                                <div className={`p-5 space-y-6 ${isDark ? "bg-gray-900/30" : "bg-white"}`}>

                                                                    {/* Assessment Items (chấm điểm) */}
                                                                    {items.length > 0 && (
                                                                        <div>
                                                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                                                <Activity className="w-3.5 h-3.5" /> Cấu trúc chấm điểm
                                                                            </p>
                                                                            {updateMsg && (
                                                                                <div className={`mb-3 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold ${updateMsg.ok ? (isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700") : (isDark ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-700")}`}>
                                                                                    {updateMsg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                                                    {updateMsg.text}
                                                                                </div>
                                                                            )}
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                {items.map((item) => (
                                                                                    <div key={item.id} className={`rounded-2xl border transition-all duration-300 ${editingItemId === item.id ? (isDark ? "bg-gray-800 border-blue-500 shadow-lg" : "bg-blue-50/40 border-blue-200 shadow-md") : (isDark ? "bg-gray-800/60 border-gray-700" : "bg-gray-50 border-gray-100")}`}>
                                                                                        {editingItemId === item.id ? (
                                                                                            /* ── EDIT FORM ── */
                                                                                            <div className="p-4 space-y-3">
                                                                                                <div className="flex items-center justify-between mb-1">
                                                                                                    <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}><Edit3 className="w-3 h-3" />Chỉnh sửa</span>
                                                                                                    <button onClick={() => setEditingItemId(null)} className={`p-1 rounded-lg transition-all ${isDark ? "hover:bg-gray-700 text-gray-500" : "hover:bg-gray-200 text-gray-400"}`}><X className="w-4 h-4" /></button>
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}><Type className="w-3 h-3" />Tên</label>
                                                                                                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className={`w-full px-3 py-2 rounded-xl border bg-transparent font-bold text-sm outline-none transition-all ${isDark ? "border-gray-600 focus:border-blue-500 text-white" : "border-gray-200 focus:border-blue-400 text-gray-900"}`} />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                    <label className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}><Target className="w-3 h-3" />Loại đánh giá</label>
                                                                                                    <select value={editType} onChange={e => setEditType(e.target.value as AssessmentType)} className={`w-full px-3 py-2 rounded-xl border font-bold text-sm outline-none transition-all ${isDark ? "border-gray-600 focus:border-blue-500 text-white bg-gray-900" : "border-gray-200 focus:border-blue-400 text-gray-900 bg-white"}`}>
                                                                                                        {Object.values(AssessmentType).map(t => <option key={t} value={t}>{t}</option>)}
                                                                                                    </select>
                                                                                                </div>
                                                                                                <div className="grid grid-cols-3 gap-2">
                                                                                                    <div className="space-y-1">
                                                                                                        <label className={`text-[9px] font-black uppercase tracking-widest block ${isDark ? "text-gray-500" : "text-gray-400"}`}>Level</label>
                                                                                                        <input type="text" value={editLevel} onChange={e => setEditLevel(e.target.value)} placeholder="N1-N5" className={`w-full px-3 py-2 rounded-xl border bg-transparent font-bold text-sm outline-none ${isDark ? "border-gray-600 focus:border-blue-500 text-white" : "border-gray-200 focus:border-blue-400 text-gray-900"}`} />
                                                                                                    </div>
                                                                                                    <div className="space-y-1">
                                                                                                        <label className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}><ListOrdered className="w-3 h-3" />Số câu</label>
                                                                                                        <input type="number" value={editCount} onChange={e => setEditCount(parseInt(e.target.value))} className={`w-full px-3 py-2 rounded-xl border bg-transparent font-bold text-sm outline-none ${isDark ? "border-gray-600 focus:border-blue-500 text-white" : "border-gray-200 focus:border-blue-400 text-gray-900"}`} />
                                                                                                    </div>
                                                                                                    <div className="space-y-1">
                                                                                                        <label className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}><Trophy className="w-3 h-3" />Đ/câu</label>
                                                                                                        <input type="number" step="0.1" value={editPoint} onChange={e => setEditPoint(parseFloat(e.target.value))} className={`w-full px-3 py-2 rounded-xl border bg-transparent font-bold text-sm outline-none ${isDark ? "border-gray-600 focus:border-blue-500 text-white" : "border-gray-200 focus:border-blue-400 text-gray-900"}`} />
                                                                                                    </div>
                                                                                                </div>
                                                                                                <button onClick={() => handleUpdateItem(exam.id, section.id)} disabled={isUpdatingItem} className={`w-full py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${isUpdatingItem ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"}`}>
                                                                                                    {isUpdatingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                                                                    Lưu thay đổi
                                                                                                </button>
                                                                                            </div>
                                                                                        ) : (
                                                                                            /* ── READ VIEW ── */
                                                                                            <div className="p-4 flex flex-col gap-2">
                                                                                                <div className="flex items-start justify-between gap-2">
                                                                                                    <p className={`font-black text-sm leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>{item.name}</p>
                                                                                                    <div className="flex items-center gap-1">
                                                                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>{item.assessmentType}</span>
                                                                                                        <button onClick={() => startEditItem(item)} className={`p-1.5 rounded-lg transition-all ${isDark ? "hover:bg-gray-700 text-gray-500 hover:text-blue-400" : "hover:bg-gray-200 text-gray-400 hover:text-blue-600"}`}><Edit3 className="w-3.5 h-3.5" /></button>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className={`flex items-center gap-3 text-[11px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                                                                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{item.questionCount} câu</span>
                                                                                                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{item.pointPerQuestion} đ/câu</span>
                                                                                                    <span className={`flex items-center gap-1 font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}><Target className="w-3 h-3" />= {item.totalPoint} đ</span>
                                                                                                </div>
                                                                                                <p className={`text-[10px] font-bold ${isDark ? "text-gray-600" : "text-gray-300"}`}>Level: {item.level || "—"}</p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Questions */}
                                                                    {section.questions && section.questions.length > 0 ? (
                                                                        <div>
                                                                            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                                                <BookOpen className="w-3.5 h-3.5" /> Danh sách câu hỏi ({section.questions.length} câu)
                                                                            </p>
                                                                            <div className="space-y-3">
                                                                                {[...section.questions].sort((a, b) => a.questionOrder - b.questionOrder).map((q) => {
                                                                                    const options = parseOptions(q.options);
                                                                                    return (
                                                                                        <div key={q.id} className={`rounded-2xl border p-4 ${isDark ? "bg-gray-800/40 border-gray-700" : "bg-white border-gray-100 shadow-sm"}`}>
                                                                                            {/* Question Header */}
                                                                                            <div className="flex items-start gap-3 mb-3">
                                                                                                <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${isDark ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600"}`}>
                                                                                                    {q.questionOrder}
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>{q.questionType}</span>
                                                                                                        {q.audioUrl && <span className={`px-2 py-0.5 rounded-md text-[9px] font-black flex items-center gap-1 ${isDark ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"}`}><Volume2 className="w-3 h-3" />Audio</span>}
                                                                                                        {q.imageUrl && <span className={`px-2 py-0.5 rounded-md text-[9px] font-black flex items-center gap-1 ${isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600"}`}><ImageIcon className="w-3 h-3" />Image</span>}
                                                                                                    </div>
                                                                                                    <p className={`text-sm font-medium leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{q.questionText}</p>
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* Options */}
                                                                                            {options.length > 0 && (
                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 ml-11">
                                                                                                    {options.map((opt, oi) => {
                                                                                                        const isCorrect = q.answer === opt;
                                                                                                        return (
                                                                                                            <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isCorrect
                                                                                                                ? (isDark ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border border-emerald-200 text-emerald-700")
                                                                                                                : (isDark ? "bg-gray-800/60 border border-gray-700/50 text-gray-400" : "bg-gray-50 border border-gray-100 text-gray-500")
                                                                                                                }`}>
                                                                                                                {isCorrect
                                                                                                                    ? <CheckSquare className="w-4 h-4 shrink-0 text-emerald-500" />
                                                                                                                    : <XSquare className={`w-4 h-4 shrink-0 opacity-30 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                                                                                                                }
                                                                                                                <span className="font-bold text-xs mr-1">{oi + 1}.</span>
                                                                                                                {opt}
                                                                                                            </div>
                                                                                                        );
                                                                                                    })}
                                                                                                </div>
                                                                                            )}

                                                                                            {/* Answer Key (text answer if no options) */}
                                                                                            {options.length === 0 && q.answer && (
                                                                                                <div className={`ml-11 mt-2 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                                                                                                    <CheckSquare className="w-4 h-4" /> Đáp án: {q.answer}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center ${isDark ? "border-gray-800 text-gray-600" : "border-gray-100 text-gray-300"}`}>
                                                                            <BookOpen className="w-7 h-7 mb-2 opacity-30" />
                                                                            <p className="text-sm font-black italic opacity-40">Phần này chưa có câu hỏi</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
