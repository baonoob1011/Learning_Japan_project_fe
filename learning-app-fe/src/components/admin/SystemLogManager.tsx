"use client";
import React, {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
    Search,
    Filter,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    X,
    Copy,
    CheckCheck,
    AlertTriangle,
    Clock,
    User,
    Globe,
    Code2,
    Zap,
    Eye,
    SlidersHorizontal,
    AlertCircle,
    CheckCircle2,
    CalendarRange,
} from "lucide-react";
import {
    systemLogService,
    SystemLog,
    SystemLogParams,
} from "@/services/systemLogService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tryParseJson(raw: string): { ok: boolean; formatted: string } {
    if (!raw || raw.trim() === "") return { ok: true, formatted: "" };
    try {
        const parsed = JSON.parse(raw);
        return { ok: true, formatted: JSON.stringify(parsed, null, 2) };
    } catch {
        // Return raw text safely (no HTML)
        return { ok: false, formatted: String(raw) };
    }
}

function formatExecTime(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

function formatDatetime(iso: string): string {
    if (!iso) return "—";
    try {
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: "SUCCESS" | "FAILURE" }) =>
    status === "SUCCESS" ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            SUCCESS
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-500 border border-red-500/20">
            <AlertCircle className="w-3 h-3" />
            FAILURE
        </span>
    );

const SkeletonRow = ({ isDark }: { isDark: boolean }) => (
    <tr>
        {Array.from({ length: 7 }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <div
                    className={`h-4 rounded animate-pulse ${isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                    style={{ width: `${[70, 90, 80, 110, 60, 50, 40][i]}%` }}
                />
            </td>
        ))}
    </tr>
);

// ─── Copy Button ─────────────────────────────────────────────────────────────

function CopyButton({ text, isDark }: { text: string; isDark: boolean }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button
            onClick={handleCopy}
            title="Copy"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${copied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : isDark
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                }`}
        >
            {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
        </button>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({
    log,
    isDark,
    onClose,
}: {
    log: SystemLog;
    isDark: boolean;
    onClose: () => void;
}) {
    const args = tryParseJson(log.arguments);
    const result = tryParseJson(log.result);

    const bg = isDark ? "bg-gray-900" : "bg-white";
    const border = isDark ? "border-gray-700" : "border-gray-200";
    const labelCls = isDark ? "text-gray-500" : "text-gray-400";
    const valueCls = isDark ? "text-gray-100" : "text-gray-900";
    const codeBg = isDark ? "bg-gray-800" : "bg-gray-50";
    const codeText = isDark ? "text-gray-200" : "text-gray-800";

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className={`${bg} border ${border} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${border} flex-shrink-0`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDark ? "bg-indigo-500/15" : "bg-indigo-50"}`}>
                            <Code2 className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                        </div>
                        <div>
                            <h2 className={`font-bold text-base ${valueCls}`}>
                                {log.targetClass.split(".").pop()}#{log.methodName}
                            </h2>
                            <p className={`text-xs ${labelCls}`}>{formatDatetime(log.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={log.status} />
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                                }`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: <User className="w-3.5 h-3.5" />, label: "Username", value: log.username || "—" },
                            { icon: <Globe className="w-3.5 h-3.5" />, label: "IP Address", value: log.ipAddress || "—" },
                            {
                                icon: <Code2 className="w-3.5 h-3.5" />,
                                label: "Class",
                                value: log.targetClass,
                            },
                            { icon: <Zap className="w-3.5 h-3.5" />, label: "Method", value: log.methodName },
                            {
                                icon: <Clock className="w-3.5 h-3.5" />,
                                label: "Execution Time",
                                value: formatExecTime(log.executionTime),
                            },
                            { icon: <Clock className="w-3.5 h-3.5" />, label: "Log ID", value: log.id },
                        ].map(({ icon, label, value }) => (
                            <div
                                key={label}
                                className={`p-3 rounded-xl border ${border} ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}
                            >
                                <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1 ${labelCls}`}>
                                    {icon}
                                    {label}
                                </div>
                                <p className={`text-sm font-medium break-all ${valueCls}`}>{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Arguments */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-xs font-bold uppercase tracking-wider ${labelCls}`}>
                                Arguments
                            </h3>
                            {log.arguments && <CopyButton text={args.formatted || log.arguments} isDark={isDark} />}
                        </div>
                        <div className={`${codeBg} border ${border} rounded-xl p-4 overflow-x-auto`}>
                            <pre className={`text-xs font-mono whitespace-pre-wrap break-all ${codeText}`}>
                                {args.formatted || <em className={labelCls}>empty</em>}
                            </pre>
                        </div>
                    </div>

                    {/* Result */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-xs font-bold uppercase tracking-wider ${labelCls}`}>
                                Result
                            </h3>
                            {log.result && <CopyButton text={result.formatted || log.result} isDark={isDark} />}
                        </div>
                        <div className={`${codeBg} border ${border} rounded-xl p-4 overflow-x-auto`}>
                            <pre className={`text-xs font-mono whitespace-pre-wrap break-all ${codeText}`}>
                                {result.formatted || <em className={labelCls}>empty</em>}
                            </pre>
                        </div>
                    </div>

                    {/* Error Message */}
                    {log.status === "FAILURE" && log.errorMessage && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">
                                    Error Message
                                </h3>
                            </div>
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <pre className="text-xs font-mono text-red-400 whitespace-pre-wrap break-all">
                                    {log.errorMessage}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
    isDark: boolean;
}

export default function SystemLogManager({ isDark }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // ── Filter state (synced with URL params) ────────────────────────────────
    const [keyword, setKeyword] = useState(searchParams.get("keyword") ?? "");
    const [username, setUsername] = useState(searchParams.get("username") ?? "");
    const [status, setStatus] = useState<"" | "SUCCESS" | "FAILURE">(
        (searchParams.get("status") as "" | "SUCCESS" | "FAILURE") ?? ""
    );
    const [from, setFrom] = useState(searchParams.get("from") ?? "");
    const [to, setTo] = useState(searchParams.get("to") ?? "");
    const [page, setPage] = useState(Number(searchParams.get("page") ?? 0));
    const pageSize = 20;

    // Applied filter (separate so Apply button controls fetch)
    const [applied, setApplied] = useState<SystemLogParams>({
        keyword: searchParams.get("keyword") ?? "",
        username: searchParams.get("username") ?? "",
        status: (searchParams.get("status") as "" | "SUCCESS" | "FAILURE") ?? "",
        from: searchParams.get("from") ?? "",
        to: searchParams.get("to") ?? "",
        page: Number(searchParams.get("page") ?? 0),
        size: pageSize,
    });

    // ── Data state ────────────────────────────────────────────────────────────
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

    // ── Debounce timer ───────────────────────────────────────────────────────
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Sync URL params ───────────────────────────────────────────────────────
    const syncUrl = useCallback(
        (params: SystemLogParams) => {
            const sp = new URLSearchParams();
            if (params.keyword) sp.set("keyword", params.keyword);
            if (params.username) sp.set("username", params.username);
            if (params.status) sp.set("status", params.status);
            if (params.from) sp.set("from", params.from);
            if (params.to) sp.set("to", params.to);
            if (params.page && params.page > 0) sp.set("page", String(params.page));
            const qs = sp.toString();
            router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
        },
        [pathname, router]
    );

    // ── Fetch data ─────────────────────────────────────────────────────────────
    const fetchLogs = useCallback(
        async (params: SystemLogParams) => {
            setLoading(true);
            setError(null);
            try {
                const data = await systemLogService.getSystemLogs(params);
                setLogs(data.content ?? []);
                setTotalElements(data.totalElements ?? 0);
                setTotalPages(data.totalPages ?? 0);
            } catch (err: unknown) {
                setError(
                    err instanceof Error ? err.message : "Không thể tải dữ liệu log hệ thống"
                );
                setLogs([]);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchLogs(applied);
        syncUrl(applied);
    }, [applied, fetchLogs, syncUrl]);

    // ── Apply filter ──────────────────────────────────────────────────────────
    const handleApply = () => {
        const next: SystemLogParams = { keyword, username, status, from, to, page: 0, size: pageSize };
        setPage(0);
        setApplied(next);
    };

    const handleReset = () => {
        setKeyword(""); setUsername(""); setStatus(""); setFrom(""); setTo(""); setPage(0);
        setApplied({ page: 0, size: pageSize });
    };

    // ── Debounced keyword search ───────────────────────────────────────────────
    const handleKeywordChange = (val: string) => {
        setKeyword(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(0);
            setApplied((prev) => ({ ...prev, keyword: val, page: 0 }));
        }, 400);
    };

    // ── Pagination ────────────────────────────────────────────────────────────
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        const next = { ...applied, page: newPage };
        setApplied(next);
    };

    // ── Colour tokens ─────────────────────────────────────────────────────────
    const cardBg = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
    const inputCls = `w-full px-3 py-2 text-sm rounded-xl border outline-none transition-all ${isDark
            ? "bg-gray-700/60 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20"
        }`;
    const labelCls = isDark ? "text-gray-400" : "text-gray-500";
    const thCls = `px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`;
    const tdCls = `px-4 py-3 text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`;

    // ── Exec time colour ──────────────────────────────────────────────────────
    const execColor = (ms: number) => {
        if (ms < 200) return "text-emerald-500";
        if (ms < 1000) return "text-amber-500";
        return "text-red-500";
    };

    const hasActiveFilter = !!(keyword || username || status || from || to);

    return (
        <div className="space-y-5">
            {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
            <div className={`rounded-2xl border p-5 ${cardBg} shadow-sm`}>
                <div className="flex items-center gap-2 mb-4">
                    <SlidersHorizontal className={`w-4 h-4 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
                    <span className={`text-sm font-bold ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                        Bộ lọc
                    </span>
                    {hasActiveFilter && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400">
                            Đang lọc
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {/* Keyword */}
                    <div className="xl:col-span-2">
                        <label className={`text-[11px] font-semibold uppercase tracking-wider mb-1 block ${labelCls}`}>
                            Keyword (class/method/error)
                        </label>
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${labelCls}`} />
                            <input
                                id="sl-keyword"
                                className={`${inputCls} pl-8`}
                                placeholder="Tìm theo class, method, error..."
                                value={keyword}
                                onChange={(e) => handleKeywordChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className={`text-[11px] font-semibold uppercase tracking-wider mb-1 block ${labelCls}`}>
                            Username
                        </label>
                        <input
                            id="sl-username"
                            className={inputCls}
                            placeholder="Nhập username..."
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className={`text-[11px] font-semibold uppercase tracking-wider mb-1 block ${labelCls}`}>
                            Trạng thái
                        </label>
                        <select
                            id="sl-status"
                            className={inputCls}
                            value={status}
                            onChange={(e) => setStatus(e.target.value as "" | "SUCCESS" | "FAILURE")}
                        >
                            <option value="">Tất cả</option>
                            <option value="SUCCESS">SUCCESS</option>
                            <option value="FAILURE">FAILURE</option>
                        </select>
                    </div>

                    {/* Date range */}
                    <div>
                        <label className={`text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1 ${labelCls}`}>
                            <CalendarRange className="w-3 h-3" /> Khoảng thời gian
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="sl-from"
                                type="datetime-local"
                                className={inputCls}
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                            />
                            <input
                                id="sl-to"
                                type="datetime-local"
                                className={inputCls}
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-4">
                    <button
                        id="sl-apply"
                        onClick={handleApply}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-sm"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        Áp dụng
                    </button>
                    <button
                        id="sl-reset"
                        onClick={handleReset}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${isDark
                                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                    >
                        <X className="w-3.5 h-3.5" />
                        Reset
                    </button>
                    <button
                        id="sl-refresh"
                        onClick={() => fetchLogs(applied)}
                        disabled={loading}
                        className={`ml-auto flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all border ${isDark
                                ? "border-gray-600 text-gray-400 hover:bg-gray-700"
                                : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* ── Stats strip ──────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 text-sm">
                <span className={labelCls}>
                    Tổng:{" "}
                    <strong className={isDark ? "text-gray-200" : "text-gray-900"}>
                        {totalElements.toLocaleString()}
                    </strong>{" "}
                    log
                </span>
                <span className={labelCls}>
                    Trang{" "}
                    <strong className={isDark ? "text-gray-200" : "text-gray-900"}>
                        {page + 1}
                    </strong>
                    /{totalPages || 1}
                </span>
            </div>

            {/* ── Table ─────────────────────────────────────────────────────────────── */}
            <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardBg}`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className={isDark ? "bg-gray-800/80" : "bg-gray-50"}>
                            <tr>
                                <th className={thCls}>Time</th>
                                <th className={thCls}>Username</th>
                                <th className={thCls}>IP</th>
                                <th className={thCls}>Class#Method</th>
                                <th className={thCls}>Status</th>
                                <th className={thCls}>Exec(ms)</th>
                                <th className={`${thCls} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100/10">
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <SkeletonRow key={i} isDark={isDark} />
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertTriangle className="w-10 h-10 text-red-400 opacity-60" />
                                            <p className="text-red-400 font-medium">{error}</p>
                                            <button
                                                onClick={() => fetchLogs(applied)}
                                                className="text-sm text-indigo-400 hover:underline"
                                            >
                                                Thử lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                                                <Search className={`w-6 h-6 ${labelCls}`} />
                                            </div>
                                            <p className={`text-sm font-medium ${labelCls}`}>
                                                Không có log nào phù hợp
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className={`transition-colors ${isDark ? "hover:bg-gray-700/40" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <td className={tdCls}>
                                            <span className={`text-xs font-mono ${labelCls}`}>
                                                {formatDatetime(log.createdAt)}
                                            </span>
                                        </td>
                                        <td className={tdCls}>
                                            <div className="flex items-center gap-1.5">
                                                <User className={`w-3.5 h-3.5 flex-shrink-0 ${labelCls}`} />
                                                <span className="font-medium">{log.username || "—"}</span>
                                            </div>
                                        </td>
                                        <td className={tdCls}>
                                            <span className={`text-xs font-mono ${labelCls}`}>
                                                {log.ipAddress || "—"}
                                            </span>
                                        </td>
                                        <td className={tdCls}>
                                            <div className="max-w-[200px]">
                                                <p className="text-xs font-mono truncate" title={log.targetClass}>
                                                    {log.targetClass.split(".").pop()}
                                                </p>
                                                <p className={`text-[11px] ${isDark ? "text-indigo-400" : "text-indigo-600"} font-semibold`}>
                                                    #{log.methodName}
                                                </p>
                                            </div>
                                        </td>
                                        <td className={tdCls}>
                                            <StatusBadge status={log.status} />
                                        </td>
                                        <td className={tdCls}>
                                            <span className={`text-xs font-bold font-mono ${execColor(log.executionTime)}`}>
                                                {formatExecTime(log.executionTime)}
                                            </span>
                                        </td>
                                        <td className={`${tdCls} text-right`}>
                                            <button
                                                id={`sl-detail-${log.id}`}
                                                onClick={() => setSelectedLog(log)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isDark
                                                        ? "bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25"
                                                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                                    }`}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ──────────────────────────────────────────────────── */}
                {totalPages > 1 && (
                    <div className={`flex items-center justify-between px-5 py-3 border-t ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-100 bg-gray-50"}`}>
                        <p className={`text-xs ${labelCls}`}>
                            Hiển thị {logs.length} / {totalElements} log
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                id="sl-prev"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 0}
                                className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                                let pg: number;
                                if (totalPages <= 7) {
                                    pg = i;
                                } else if (page < 4) {
                                    pg = i;
                                } else if (page > totalPages - 5) {
                                    pg = totalPages - 7 + i;
                                } else {
                                    pg = page - 3 + i;
                                }
                                return (
                                    <button
                                        key={pg}
                                        onClick={() => handlePageChange(pg)}
                                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${pg === page
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : isDark
                                                    ? "text-gray-400 hover:bg-gray-700"
                                                    : "text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {pg + 1}
                                    </button>
                                );
                            })}

                            <button
                                id="sl-next"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages - 1}
                                className={`p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-200 text-gray-600"
                                    }`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
            {selectedLog && (
                <DetailModal
                    log={selectedLog}
                    isDark={isDark}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
}
