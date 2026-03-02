"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";

/* ---- services ---- */
import { courseService, CreateCourseRequest } from "@/services/courseService";
import { sectionService, SectionResponse } from "@/services/sectionService";
import { lessonService, LessonResponse } from "@/services/lessonService";
import { lessonPartService } from "@/services/lessonPartService";
import { lessonDocumentService } from "@/services/lessonDocumentService";
import { JLPTLevel } from "@/enums/JLPTLevel";
import { LessonProcess } from "@/enums/LessonProcess";
import { LessonLevel } from "@/enums/LessonLevel";
import { LessonPartType } from "@/enums/LessonPartType";

/* ---- icons ---- */
import {
    BookOpen, ImagePlus, ChevronLeft, CheckCircle2, AlertCircle,
    Loader2, Plus, Trash2, ChevronDown, ChevronUp, FileText,
    Layers, GraduationCap, PuzzleIcon,
} from "lucide-react";

/* ===================================================================
   CONSTANTS
=================================================================== */
const JLPT_OPTIONS = [
    { value: JLPTLevel.N5, label: "N5 – Sơ cấp 1" },
    { value: JLPTLevel.N4, label: "N4 – Sơ cấp 2" },
    { value: JLPTLevel.N3, label: "N3 – Trung cấp" },
    { value: JLPTLevel.N2, label: "N2 – Cao cấp" },
    { value: JLPTLevel.N1, label: "N1 – Thượng cấp" },
];
const PROCESS_OPTIONS = [
    { value: LessonProcess.JUNBI, label: "Học nền (Junbi)" },
    { value: LessonProcess.TAISAKU, label: "Ôn luyện chiến lược (Taisaku)" },
    { value: LessonProcess.PRACTICE, label: "Luyện đề (Practice)" },
];
const LESSON_LEVEL_OPTIONS = [
    { value: LessonLevel.N5_BEGINNER, label: "N5 Sơ cấp" },
    { value: LessonLevel.N5_ELEMENTARY, label: "N5 Trung sơ cấp" },
    { value: LessonLevel.N4_BEGINNER, label: "N4 Sơ cấp" },
    { value: LessonLevel.N4_ELEMENTARY, label: "N4 Trung sơ cấp" },
    { value: LessonLevel.N3_INTERMEDIATE, label: "N3 Trung cấp" },
    { value: LessonLevel.N2_UPPER, label: "N2 Cao cấp" },
    { value: LessonLevel.N1_ADVANCED, label: "N1 Thượng cấp" },
];

/* ===================================================================
   STEP INDICATOR
=================================================================== */
const STEPS = ["Thông tin khóa học", "Thêm chương (Section)", "Thêm bài học & nội dung"];

function StepIndicator({ current, isDark }: { current: number, isDark: boolean }) {
    return (
        <div className="flex items-center gap-0 mb-8">
            {STEPS.map((label, idx) => {
                const done = idx < current;
                const active = idx === current;
                return (
                    <React.Fragment key={idx}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${done ? "bg-green-500 text-white" : active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : isDark ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-500"}`}>
                                {done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] mt-1 font-semibold text-center max-w-[80px] leading-tight
                                ${active ? "text-indigo-600" : done ? "text-green-600" : isDark ? "text-gray-500" : "text-gray-400"}`}>
                                {label}
                            </span>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-colors ${done ? "bg-green-400" : isDark ? "bg-gray-700" : "bg-gray-200"}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

/* ===================================================================
   ALERT HELPERS
=================================================================== */
function ErrorAlert({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />{msg}
        </div>
    );
}
function SuccessAlert({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />{msg}
        </div>
    );
}

/* -------------------------------------------------------------------
   SHARED INPUT STYLES
------------------------------------------------------------------- */
const getInputCls = (isDark: boolean) => `w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition ${isDark ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`;
const getLabelCls = (isDark: boolean) => `block text-sm font-semibold mb-1.5 ${isDark ? "text-gray-300" : "text-gray-700"}`;
const btnPrimary = "px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2";
const getBtnSecondary = (isDark: boolean) => `px-5 py-2.5 rounded-xl border text-sm font-semibold transition ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`;

/* ===================================================================
   STEP 1 – Course info
=================================================================== */
interface Step1Props {
    onCreated: (courseId: string) => void;
    isDark: boolean;
}
function Step1Course({ onCreated, isDark }: Step1Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState<JLPTLevel>(JLPTLevel.N5);
    const [lessonProcess, setLessonProcess] = useState<LessonProcess>(LessonProcess.JUNBI);
    const [isPaid, setIsPaid] = useState(false);
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setImage(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError("Vui lòng nhập tên khóa học."); return; }
        if (!description.trim()) { setError("Vui lòng nhập mô tả."); return; }
        if (isPaid && price <= 0) { setError("Vui lòng nhập giá hợp lệ."); return; }
        setError(null);
        setLoading(true);
        try {
            const req: CreateCourseRequest = {
                title, description, level, lessonProcess, isPaid,
                price: isPaid ? price : 0,
                image: image ?? undefined,
            };
            const courseId = await courseService.create(req);
            onCreated(courseId);
        } catch {
            setError("Tạo khóa học thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && <ErrorAlert msg={error} />}

            {/* Thumbnail */}
            <div>
                <label className={getLabelCls(isDark)}>Ảnh bìa khóa học</label>
                <div
                    onClick={() => fileRef.current?.click()}
                    className={`relative w-full h-44 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center overflow-hidden group ${isDark ? "border-gray-700 bg-gray-800 hover:border-indigo-500 hover:bg-indigo-900/20" : "border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/30"}`}
                >
                    {preview ? (
                        <>
                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-sm font-semibold">Đổi ảnh</span>
                            </div>
                        </>
                    ) : (
                        <div className={`flex flex-col items-center gap-2 transition-colors ${isDark ? "text-gray-500 group-hover:text-indigo-400" : "text-gray-400 group-hover:text-indigo-500"}`}>
                            <ImagePlus className="w-9 h-9" />
                            <span className="text-sm font-medium">Nhấn để chọn ảnh</span>
                            <span className="text-xs">PNG, JPG, WEBP tối đa 5MB</span>
                        </div>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImg} />
            </div>

            {/* Title */}
            <div>
                <label className={getLabelCls(isDark)}>Tên khóa học <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Ví dụ: Tiếng Nhật N5 cho người mới bắt đầu" className={getInputCls(isDark)} />
            </div>

            {/* Description */}
            <div>
                <label className={getLabelCls(isDark)}>Mô tả <span className="text-red-500">*</span></label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Mô tả nội dung, mục tiêu và đối tượng của khóa học…"
                    className={`${getInputCls(isDark)} resize-none`} />
            </div>

            {/* Level + Process */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={getLabelCls(isDark)}>Cấp độ JLPT</label>
                    <select value={level} onChange={e => setLevel(e.target.value as JLPTLevel)} className={getInputCls(isDark)}>
                        {JLPT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className={getLabelCls(isDark)}>Lộ trình học</label>
                    <select value={lessonProcess} onChange={e => setLessonProcess(e.target.value as LessonProcess)} className={getInputCls(isDark)}>
                        {PROCESS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Is Paid */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <div>
                    <p className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>Khóa học có phí</p>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Bật để thiết lập giá cho khóa học.</p>
                </div>
                <button type="button" onClick={() => { setIsPaid(!isPaid); if (isPaid) setPrice(0); }}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isPaid ? "bg-indigo-600" : isDark ? "bg-gray-600" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPaid ? "translate-x-6" : "translate-x-0"}`} />
                </button>
            </div>

            {isPaid && (
                <div>
                    <label className={getLabelCls(isDark)}>Giá (VNĐ) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input type="number" min={1000} step={1000} value={price}
                            onChange={e => setPrice(Number(e.target.value))}
                            placeholder="Ví dụ: 299000" className={`${getInputCls(isDark)} pr-16`} />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">VNĐ</span>
                    </div>
                    {price > 0 && <p className="text-xs text-indigo-500 mt-1 font-medium">≈ {price.toLocaleString("vi-VN")} đồng</p>}
                </div>
            )}

            <div className="pt-2 flex justify-end">
                <button type="submit" disabled={loading} className={btnPrimary}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo…</> : <>Tạo & tiếp tục <ChevronDown className="w-4 h-4 rotate-[-90deg]" /></>}
                </button>
            </div>
        </form>
    );
}

/* ===================================================================
   STEP 2 – Sections
=================================================================== */
interface Step2Props {
    courseId: string;
    onDone: (sections: SectionResponse[]) => void;
    isDark: boolean;
}
function Step2Sections({ courseId, onDone, isDark }: Step2Props) {
    const [title, setTitle] = useState("");
    const [lessonLevel, setLessonLevel] = useState<LessonLevel>(LessonLevel.N5_BEGINNER);
    const [sections, setSections] = useState<SectionResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addSection = async () => {
        if (!title.trim()) { setError("Vui lòng nhập tên chương."); return; }
        setError(null);
        setLoading(true);
        try {
            await sectionService.create({ courseId, title, lessonLevel });
            const updated = await sectionService.getByCourse(courseId);
            setSections(updated);
            setTitle("");
        } catch {
            setError("Thêm chương thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const deleteSection = async (id: string) => {
        try {
            await sectionService.delete(id);
            setSections(prev => prev.filter(s => s.id !== id));
        } catch {
            setError("Xóa chương thất bại.");
        }
    };

    return (
        <div className="space-y-5">
            {error && <ErrorAlert msg={error} />}

            {/* Add section form */}
            <div className={`p-4 rounded-xl border space-y-3 ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}><Layers className="w-4 h-4 text-indigo-500" /> Thêm chương mới</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="Tên chương (Ví dụ: Chương 1 – Bảng chữ cái)" className={getInputCls(isDark)} />
                    <select value={lessonLevel} onChange={e => setLessonLevel(e.target.value as LessonLevel)} className={getInputCls(isDark)}>
                        {LESSON_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <button onClick={addSection} disabled={loading} className={`${btnPrimary} w-full justify-center`}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang thêm…</> : <><Plus className="w-4 h-4" /> Thêm chương</>}
                </button>
            </div>

            {/* Section list */}
            {sections.length > 0 && (
                <div className="space-y-2">
                    {sections.map((s, idx) => (
                        <div key={s.id} className={`flex items-center justify-between border rounded-xl px-4 py-3 shadow-sm ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>{idx + 1}</span>
                                <div>
                                    <p className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{s.title}</p>
                                    <p className="text-xs text-gray-400">{s.lessonLevel}</p>
                                </div>
                            </div>
                            <button onClick={() => deleteSection(s.id)} className="text-red-400 hover:text-red-600 transition p-1.5 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {sections.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">Chưa có chương nào. Thêm ít nhất 1 chương để tiếp tục.</div>
            )}

            <div className="flex justify-between pt-2">
                <button className={getBtnSecondary(isDark)} onClick={() => onDone([])}>Bỏ qua bước này</button>
                <button disabled={sections.length === 0} onClick={() => onDone(sections)} className={btnPrimary}>
                    Tiếp tục <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </button>
            </div>
        </div>
    );
}

/* ===================================================================
   STEP 3 – Lessons, Lesson Parts, Lesson Documents
=================================================================== */
interface Step3Props {
    sections: SectionResponse[];
    onFinish: () => void;
    isDark: boolean;
}

interface LocalLesson {
    id: string;
    title: string;
    lessonLevel: LessonLevel;
    lessonOrder: number;
    parts: { id: string; title: string; partOrder: number }[];
    docs: { id: string; title: string; documentOrder: number }[];
    open: boolean;
}

function Step3Lessons({ sections, onFinish, isDark }: Step3Props) {
    const [selectedSectionId, setSelectedSectionId] = useState(sections[0]?.id ?? "");
    const [lessons, setLessons] = useState<Record<string, LocalLesson[]>>({});
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessonLevel, setLessonLevel] = useState<LessonLevel>(LessonLevel.N5_BEGINNER);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* part / doc adding per lesson */
    const [partTitle, setPartTitle] = useState<Record<string, string>>({});
    const [partType, setPartType] = useState<Record<string, LessonPartType>>({});
    const [partVideoUrl, setPartVideoUrl] = useState<Record<string, string>>({});
    const [docTitle, setDocTitle] = useState<Record<string, string>>({});
    const [docFile, setDocFile] = useState<Record<string, File | null>>({});

    const lessonsForSection = lessons[selectedSectionId] ?? [];
    const lessonOrder = lessonsForSection.length + 1;

    /* ---- Add lesson ---- */
    const addLesson = async () => {
        if (!lessonTitle.trim()) { setError("Vui lòng nhập tên bài học."); return; }
        setError(null);
        setLoading(true);
        try {
            const id = await lessonService.create({ sectionId: selectedSectionId, title: lessonTitle, lessonLevel, lessonOrder });
            const newLesson: LocalLesson = { id, title: lessonTitle, lessonLevel, lessonOrder, parts: [], docs: [], open: true };
            setLessons(prev => ({ ...prev, [selectedSectionId]: [...(prev[selectedSectionId] ?? []), newLesson] }));
            setLessonTitle("");
        } catch {
            setError("Thêm bài học thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    /* ---- Delete lesson ---- */
    const deleteLesson = async (lessonId: string) => {
        try {
            await lessonService.delete(lessonId);
            setLessons(prev => ({ ...prev, [selectedSectionId]: (prev[selectedSectionId] ?? []).filter(l => l.id !== lessonId) }));
        } catch { setError("Xóa bài học thất bại."); }
    };

    /* ---- Add lesson part ---- */
    const addPart = async (lessonId: string) => {
        const title = partTitle[lessonId]?.trim();
        if (!title) return;
        const lesson = lessonsForSection.find(l => l.id === lessonId);
        if (!lesson) return;
        const partOrder = lesson.parts.length + 1;
        const type = partType[lessonId] || LessonPartType.VOCABULARY;
        const videoUrl = partVideoUrl[lessonId]?.trim() || "";

        try {
            const id = await lessonPartService.create({ lessonId, title, lessonPartType: type, videoUrl, partOrder });
            setLessons(prev => ({
                ...prev,
                [selectedSectionId]: (prev[selectedSectionId] ?? []).map(l =>
                    l.id === lessonId ? { ...l, parts: [...l.parts, { id, title, partOrder }] } : l
                ),
            }));
            setPartTitle(prev => ({ ...prev, [lessonId]: "" }));
            setPartVideoUrl(prev => ({ ...prev, [lessonId]: "" }));
        } catch { setError("Thêm phần bài học thất bại."); }
    };

    /* ---- Delete lesson part ---- */
    const deletePart = async (lessonId: string, partId: string) => {
        try {
            await lessonPartService.delete(partId);
            setLessons(prev => ({
                ...prev,
                [selectedSectionId]: (prev[selectedSectionId] ?? []).map(l =>
                    l.id === lessonId ? { ...l, parts: l.parts.filter(p => p.id !== partId) } : l
                ),
            }));
        } catch { setError("Xóa phần bài học thất bại."); }
    };

    /* ---- Add document ---- */
    const addDoc = async (lessonId: string) => {
        const title = docTitle[lessonId]?.trim();
        const file = docFile[lessonId];
        if (!title || !file) { setError("Vui lòng nhập tiêu đề và chọn file tài liệu."); return; }
        const lesson = lessonsForSection.find(l => l.id === lessonId);
        if (!lesson) return;
        const documentOrder = lesson.docs.length + 1;
        try {
            const id = await lessonDocumentService.create({ lessonId, title, documentOrder, file });
            setLessons(prev => ({
                ...prev,
                [selectedSectionId]: (prev[selectedSectionId] ?? []).map(l =>
                    l.id === lessonId ? { ...l, docs: [...l.docs, { id, title, documentOrder }] } : l
                ),
            }));
            setDocTitle(prev => ({ ...prev, [lessonId]: "" }));
            setDocFile(prev => ({ ...prev, [lessonId]: null }));
        } catch { setError("Tải lên tài liệu thất bại."); }
    };

    /* ---- Delete document ---- */
    const deleteDoc = async (lessonId: string, docId: string) => {
        try {
            await lessonDocumentService.delete(docId);
            setLessons(prev => ({
                ...prev,
                [selectedSectionId]: (prev[selectedSectionId] ?? []).map(l =>
                    l.id === lessonId ? { ...l, docs: l.docs.filter(d => d.id !== docId) } : l
                ),
            }));
        } catch { setError("Xóa tài liệu thất bại."); }
    };

    const toggleLesson = (lessonId: string) => {
        setLessons(prev => ({
            ...prev,
            [selectedSectionId]: (prev[selectedSectionId] ?? []).map(l =>
                l.id === lessonId ? { ...l, open: !l.open } : l
            ),
        }));
    };

    return (
        <div className="space-y-5">
            {error && <ErrorAlert msg={error} />}

            {/* Section tabs */}
            <div className="flex gap-2 flex-wrap">
                {sections.map(s => (
                    <button key={s.id} onClick={() => setSelectedSectionId(s.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${selectedSectionId === s.id ? "bg-indigo-600 text-white shadow-md" : isDark ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {s.title}
                    </button>
                ))}
            </div>

            {/* Add lesson */}
            <div className={`p-4 rounded-xl border space-y-3 ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <p className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}><GraduationCap className="w-4 h-4 text-indigo-500" /> Thêm bài học</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)}
                        placeholder="Tên bài học (Ví dụ: Bài 1 – Hiragana)" className={getInputCls(isDark)} />
                    <select value={lessonLevel} onChange={e => setLessonLevel(e.target.value as LessonLevel)} className={getInputCls(isDark)}>
                        {LESSON_LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
                <button onClick={addLesson} disabled={loading} className={`${btnPrimary} w-full justify-center`}>
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang thêm…</> : <><Plus className="w-4 h-4" /> Thêm bài học</>}
                </button>
            </div>

            {/* Lesson list */}
            <div className="space-y-3">
                {lessonsForSection.map((lesson, idx) => (
                    <div key={lesson.id} className={`border rounded-2xl shadow-sm overflow-hidden ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"}`}>
                        {/* Lesson header */}
                        <div className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-50"}`}
                            onClick={() => toggleLesson(lesson.id)}>
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}>{idx + 1}</span>
                                <div>
                                    <p className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>{lesson.title}</p>
                                    <p className="text-xs text-gray-400">{lesson.lessonLevel}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={e => { e.stopPropagation(); deleteLesson(lesson.id); }}
                                    className="text-red-400 hover:text-red-600 transition p-1.5 hover:bg-red-50 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {lesson.open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                        </div>

                        {lesson.open && (
                            <div className={`px-4 pb-4 pt-2 border-t space-y-4 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                                {/* --- Lesson Parts --- */}
                                <div className="space-y-2">
                                    <p className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        <PuzzleIcon className="w-3.5 h-3.5 text-purple-500" /> Phần bài học (Lesson Parts)
                                    </p>
                                    {lesson.parts.map((p, pi) => (
                                        <div key={p.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDark ? "bg-purple-900/10 border border-purple-900/20" : "bg-purple-50"}`}>
                                            <span className={`text-xs font-medium ${isDark ? "text-purple-300" : "text-purple-700"}`}>{pi + 1}. {p.title}</span>
                                            <button onClick={() => deletePart(lesson.id, p.id)} className="text-red-400 hover:text-red-600 transition">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <input type="text"
                                                value={partTitle[lesson.id] ?? ""}
                                                onChange={e => setPartTitle(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                                                placeholder="Tên phần (Ví dụ: Từ vựng)"
                                                className={`${getInputCls(isDark)} text-xs py-2`} />
                                            <select
                                                value={partType[lesson.id] || LessonPartType.VOCABULARY}
                                                onChange={e => setPartType(prev => ({ ...prev, [lesson.id]: e.target.value as LessonPartType }))}
                                                className={`${getInputCls(isDark)} text-xs py-2`}
                                            >
                                                {Object.values(LessonPartType).map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-2">
                                            <input type="text"
                                                value={partVideoUrl[lesson.id] ?? ""}
                                                onChange={e => setPartVideoUrl(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                                                placeholder="Link Youtube (nếu có)"
                                                className={`${getInputCls(isDark)} text-xs py-2`} />
                                            <button onClick={() => addPart(lesson.id)}
                                                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap">
                                                <Plus className="w-3.5 h-3.5" /> Thêm phần
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* --- Lesson Documents --- */}
                                <div className="space-y-2">
                                    <p className={`text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        <FileText className="w-3.5 h-3.5 text-blue-500" /> Tài liệu bài học
                                    </p>
                                    {lesson.docs.map((d, di) => (
                                        <div key={d.id} className={`flex items-center justify-between rounded-lg px-3 py-2 ${isDark ? "bg-blue-900/10 border border-blue-900/20" : "bg-blue-50"}`}>
                                            <span className={`text-xs font-medium ${isDark ? "text-blue-300" : "text-blue-700"}`}>{di + 1}. {d.title}</span>
                                            <button onClick={() => deleteDoc(lesson.id, d.id)} className="text-red-400 hover:text-red-600 transition">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <div className="space-y-2">
                                        <input type="text"
                                            value={docTitle[lesson.id] ?? ""}
                                            onChange={e => setDocTitle(prev => ({ ...prev, [lesson.id]: e.target.value }))}
                                            placeholder="Tiêu đề tài liệu"
                                            className={`${getInputCls(isDark)} text-xs py-2`} />
                                        <div className="flex gap-2">
                                            <label className={`flex-1 flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition text-xs ${isDark ? "bg-gray-800 border-gray-700 hover:border-blue-500 text-gray-400" : "bg-gray-50 border-gray-200 hover:border-blue-400 text-gray-500"}`}>
                                                <FileText className="w-3.5 h-3.5 text-blue-500" />
                                                {docFile[lesson.id] ? docFile[lesson.id]!.name : "Chọn file (PDF, DOCX, ...)"}
                                                <input type="file" className="hidden"
                                                    onChange={e => { const f = e.target.files?.[0]; if (f) setDocFile(prev => ({ ...prev, [lesson.id]: f })); }} />
                                            </label>
                                            <button onClick={() => addDoc(lesson.id)}
                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 whitespace-nowrap">
                                                <Plus className="w-3.5 h-3.5" /> Upload
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {lessonsForSection.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">Chưa có bài học nào trong chương này.</div>
            )}

            <div className="flex justify-end pt-2">
                <button onClick={onFinish} className={btnPrimary}>
                    <CheckCircle2 className="w-4 h-4" /> Hoàn thành
                </button>
            </div>
        </div>
    );
}

/* ===================================================================
   MAIN PAGE
=================================================================== */
export default function CreateCoursePage() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);
    const [step, setStep] = useState(0);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [sections, setSections] = useState<SectionResponse[]>([]);
    const { isDarkMode: isDark } = useDarkMode();

    useEffect(() => {
        setIsReady(true);
    }, []);

    if (!isReady) return null;

    return (
        <main className="p-8 w-full">
            {/* Title */}
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-gray-100" : "text-gray-900"}`}>Tạo khóa học mới</h1>
                        <p className={`text-sm mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Điền đầy đủ từng bước để hoàn thiện khóa học.</p>
                    </div>
                </div>
            </div>

            {/* Step indicator */}
            <StepIndicator current={step} isDark={isDark} />

            {/* Card */}
            <div className={`rounded-2xl border shadow-sm p-8 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                {step === 0 && (
                    <Step1Course onCreated={(id) => { setCourseId(id); setStep(1); }} isDark={isDark} />
                )}
                {step === 1 && courseId && (
                    <Step2Sections courseId={courseId} onDone={(s) => { setSections(s); setStep(2); }} isDark={isDark} />
                )}
                {step === 2 && (
                    sections.length > 0 ? (
                        <Step3Lessons sections={sections} onFinish={() => router.push("/dasboardAdmin")} isDark={isDark} />
                    ) : (
                        <div className="text-center space-y-4 py-6">
                            <SuccessAlert msg="Khóa học đã được tạo thành công!" />
                            <button onClick={() => router.push("/dasboardAdmin")} className={`${btnPrimary} mx-auto`}>
                                Về Dashboard
                            </button>
                        </div>
                    )
                )}
            </div>
        </main>
    );
}
