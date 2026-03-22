"use client";
import React, { useState, useEffect } from "react";
import {
    Search,
    MoreVertical,
    ShieldCheck,
    ShieldAlert,
    UserX,
    UserCheck,
    Trash2,
    Filter,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Eye,
    ChevronDown,
    Edit2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { userService, UserResponseManager } from "@/services/userService";
import ConfirmModal from "../ConfirmModal";

interface UserManagerProps {
    isDark?: boolean;
}

export default function UserManager({ isDark = false }: UserManagerProps) {
    const router = useRouter();
    const [users, setUsers] = useState<UserResponseManager[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const size = 10;

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDanger: boolean;
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
        isDanger: false
    });

    const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsersManager(page, size, search);
            setUsers(response.data);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Lỗi lấy danh sách user:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const handleBan = (email: string) => {
        setConfirmState({
            isOpen: true,
            title: "Khóa tài khoản",
            message: `Bạn có chắc chắn muốn khóa tài khoản ${email}? Người dùng này sẽ không thể đăng nhập vào hệ thống.`,
            isDanger: true,
            onConfirm: async () => {
                try {
                    await userService.banUser(email);
                    closeConfirm();
                    fetchUsers();
                } catch (error) {
                    console.error("Khóa thất bại", error);
                }
            }
        });
    };

    const handleUnban = (email: string) => {
        setConfirmState({
            isOpen: true,
            title: "Mở khóa tài khoản",
            message: `Mở khóa quyền truy cập cho tài khoản ${email}?`,
            isDanger: false,
            onConfirm: async () => {
                try {
                    await userService.unbanUser(email);
                    closeConfirm();
                    fetchUsers();
                } catch (error) {
                    console.error("Mở khóa thất bại", error);
                }
            }
        });
    };

    const [updatingRole, setUpdatingRole] = useState<string | null>(null);

    const handleUpdateRole = (userId: string, currentRoles: string[]) => {
        const isCurrentlyAdmin = currentRoles.includes("ADMIN");
        const newRole = isCurrentlyAdmin ? "USER" : "ADMIN";
        const roleLabel = isCurrentlyAdmin ? "Học viên" : "Quản trị viên";

        setConfirmState({
            isOpen: true,
            title: "Thay đổi vai trò",
            message: `Bạn có chắc chắn muốn chuyển vai trò của người dùng này sang "${roleLabel}"?`,
            isDanger: false,
            onConfirm: async () => {
                setUpdatingRole(userId);
                try {
                    await userService.updateUserRole(userId, newRole);
                    closeConfirm();
                    fetchUsers();
                } catch (error) {
                    console.error("Lỗi cập nhật role:", error);
                } finally {
                    setUpdatingRole(null);
                }
            }
        });
    };

    const getRoleBadge = (userId: string, role: string[]) => {
        const isAdmin = role.includes("ADMIN");
        return (
            <button
                disabled={!!updatingRole}
                onClick={() => handleUpdateRole(userId, role)}
                className={`group/role relative px-3.5 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2.5 border backdrop-blur-sm shadow-sm hover:shadow-lg active:scale-95 ${isAdmin
                    ? isDark ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400/50" : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-white hover:border-purple-400"
                    : isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-400/50" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-white hover:border-blue-400"
                    } ${updatingRole === userId ? "opacity-40 animate-pulse pointer-events-none" : ""}`}
                title="Thay đổi vai trò quản trị"
            >
                <div className="flex items-center gap-1.5">
                    {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 animate-in zoom-in-50 duration-500" /> : <ShieldAlert className="w-3.5 h-3.5 opacity-60" />}
                    <span>{isAdmin ? "Quản trị" : "Học viên"}</span>
                </div>
                <div className={`w-[1px] h-3 ml-0.5 opacity-20 ${isAdmin ? "bg-purple-600" : "bg-blue-600"}`}></div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 group-hover/role:rotate-180 ${isAdmin ? "text-purple-400" : "text-blue-400"}`} />
            </button>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-7 rounded-[32px] shadow-sm border transition-all duration-300 ${isDark ? "bg-gray-800/80 border-gray-700/50" : "bg-white border-gray-100"}`}>
                <div>
                    <h2 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Dánh sách học viên</h2>
                    <p className={`text-xs mt-1 font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Quản lý <span className={isDark ? "text-indigo-400" : "text-indigo-600"}>{totalElements}</span> tài khoản trên toàn hệ thống
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group/search">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? "text-gray-600 group-focus-within/search:text-indigo-400" : "text-gray-400 group-focus-within/search:text-indigo-600"}`} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo email, tên..."
                            className={`pl-11 pr-5 py-3 border rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none w-full md:w-72 transition-all font-medium ${isDark ? "bg-gray-900/50 border-gray-700 text-gray-100 placeholder-gray-600 focus:border-indigo-500/50" : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400"}`}
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                    <button className={`p-3 border rounded-2xl transition-all active:scale-90 ${isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-500" : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm"}`}>
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className={`flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all font-black text-sm shadow-xl shadow-indigo-600/20 active:scale-95`}>
                        <UserPlus className="w-4.5 h-4.5" />
                        Thêm mới
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className={`rounded-[32px] shadow-2xl border overflow-hidden transition-all duration-300 ${isDark ? "bg-gray-800/40 border-gray-700/50" : "bg-white border-gray-100"}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className={`border-b ${isDark ? "bg-gray-900/40 border-gray-700/50" : "bg-gray-50/50 border-gray-100"}`}>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Học viên</th>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Vai trò</th>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Trạng thái</th>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-gray-500" : "text-gray-400"}`}>Gia nhập</th>
                                <th className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-right ${isDark ? "text-gray-500" : "text-gray-400"}`}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? "divide-gray-700/50" : "divide-gray-100"}`}>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6"><div className={`h-12 rounded-2xl w-full ${isDark ? "bg-gray-700/40" : "bg-gray-100/60"}`}></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-20">
                                            <Search className="w-12 h-12" />
                                            <p className="font-bold text-sm">Không tìm thấy người dùng phù hợp</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className={`transition-all group ${isDark ? "hover:bg-indigo-500/5" : "hover:bg-indigo-50/30"}`}>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <img
                                                        src={user.avatarUrl || "/logo-cat.png"}
                                                        alt={user.fullName}
                                                        className={`w-11 h-11 rounded-2xl object-cover ring-2 ring-offset-2 transition-all group-hover:ring-indigo-500/50 ${isDark ? "ring-gray-700 ring-offset-gray-800" : "ring-gray-100 ring-offset-white"}`}
                                                    />
                                                    {user.isPremium && (
                                                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-tr from-yellow-500 to-amber-300 rounded-lg flex items-center justify-center border-2 border-white shadow-lg">
                                                            <Star className="w-2.5 h-2.5 text-white fill-current" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-black truncate transition-colors ${isDark ? "text-gray-100 group-hover:text-indigo-400" : "text-gray-900 group-hover:text-indigo-600"}`}>{user.fullName}</p>
                                                    <p className={`text-xs font-medium truncate ${isDark ? "text-gray-500" : "text-gray-400"}`}>{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {getRoleBadge(user.id, user.role)}
                                        </td>
                                        <td className="px-8 py-5">
                                            {user.enabled ? (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Đang hoạt động</span>
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Bị vô hiệu hóa</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[11px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "---"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-all">
                                                <button
                                                    onClick={() => router.push(`/dasboardAdmin/users/${user.id}`)}
                                                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDark ? "bg-gray-800 text-indigo-400 hover:bg-gray-700" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4.5 h-4.5" />
                                                </button>

                                                {user.enabled ? (
                                                    <button
                                                        onClick={() => handleBan(user.email)}
                                                        className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDark ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                                                        title="Khóa tài khoản"
                                                    >
                                                        <ShieldAlert className="w-4.5 h-4.5" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnban(user.email)}
                                                        className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDark ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                                                        title="Mở khóa tài khoản"
                                                    >
                                                        <ShieldCheck className="w-4.5 h-4.5" />
                                                    </button>
                                                )}

                                                <button className={`p-2.5 rounded-xl transition-all active:scale-90 ${isDark ? "bg-gray-800 text-gray-500 hover:bg-gray-700" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>
                                                    <MoreVertical className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className={`px-8 py-6 border-t flex items-center justify-between ${isDark ? "border-gray-700/50 bg-gray-900/20" : "border-gray-100 bg-gray-50/30"}`}>
                    <p className={`text-[11px] font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Hiển thị {users.length} trên tổng số {totalElements} kết quả
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(prev => prev - 1)}
                            className={`p-2.5 rounded-xl border transition-all disabled:opacity-30 active:scale-90 ${isDark ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"}`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className={`px-5 py-2.5 rounded-xl border font-black text-sm ${isDark ? "bg-gray-800 border-gray-700 text-indigo-400" : "bg-white border-gray-200 text-indigo-600 shadow-sm"}`}>
                            {page + 1} / {totalPages}
                        </div>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(prev => prev + 1)}
                            className={`p-2.5 rounded-xl border transition-all disabled:opacity-30 active:scale-90 ${isDark ? "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"}`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <ConfirmModal
                    isOpen={confirmState.isOpen}
                    onClose={closeConfirm}
                    onConfirm={confirmState.onConfirm}
                    title={confirmState.title}
                    message={confirmState.message}
                    isDanger={confirmState.isDanger}
                    isDark={isDark}
                />
            </div>
        </div>
    );
}

// Giả lập icon Star bị thiếu
function Star({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
        </svg>
    )
}
