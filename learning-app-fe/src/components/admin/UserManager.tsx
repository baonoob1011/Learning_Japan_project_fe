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
    Eye
} from "lucide-react";
import { useRouter } from "next/navigation";
import { userService, UserResponseManager } from "@/services/userService";

export default function UserManager() {
    const router = useRouter();
    const [users, setUsers] = useState<UserResponseManager[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const size = 10;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsersManager(page, size, search);
            setUsers(response.data);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (error) {
            console.error("Lỗi lấy danh sách user:", error);
            alert("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const handleBan = async (email: string) => {
        try {
            await userService.banUser(email);
            alert(`Đã khóa tài khoản ${email}`);
            fetchUsers();
        } catch (error) {
            alert("Khóa tài khoản thất bại");
        }
    };

    const handleUnban = async (email: string) => {
        try {
            await userService.unbanUser(email);
            alert(`Đã mở khóa tài khoản ${email}`);
            fetchUsers();
        } catch (error) {
            alert("Mở khóa thất bại");
        }
    };

    const getRoleBadge = (role: string[]) => {
        if (role.includes("ADMIN")) {
            return (
                <span className="px-2 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Admin
                </span>
            );
        }
        return (
            <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Student
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Danh sách học viên</h2>
                    <p className="text-sm text-gray-500 mt-1">Quản lý và điều chỉnh quyền truy cập của người dùng ({totalElements})</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm email, tên..."
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-indigo-400 outline-none w-full md:w-64 transition-all"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                        />
                    </div>
                    <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-md shadow-indigo-100">
                        <UserPlus className="w-4 h-4" />
                        Thêm mới
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nhật ký đăng ký</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6"><div className="h-10 bg-gray-100 rounded-xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400">
                                        Không tìm thấy người dùng nào
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img
                                                        src={user.avatarUrl || "/logo-cat.png"}
                                                        alt={user.fullName}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                                    />
                                                    {user.isPremium && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                                                            <Star className="w-2.5 h-2.5 text-white fill-current" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{user.fullName}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.enabled ? (
                                                <div className="flex items-center gap-1.5 text-green-600">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-xs font-bold">Hoạt động</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-red-500">
                                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                                    <span className="text-xs font-bold">Bị khóa</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric"
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/admin/users/${user.id}`)}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                    title="Xem chi tiết hồ sơ"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {user.enabled ? (
                                                    <button
                                                        onClick={() => handleBan(user.email)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Khóa tài khoản"
                                                    >
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnban(user.email)}
                                                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Mở khóa tài khoản"
                                                    >
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium font-sans">
                        Hiển thị {users.length} trên {totalElements} kết quả
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${page === i
                                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                        : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            )).slice(Math.max(0, page - 1), Math.min(totalPages, page + 2))}
                        </div>
                        <button
                            disabled={page === totalPages - 1 || totalPages === 0}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div >
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
