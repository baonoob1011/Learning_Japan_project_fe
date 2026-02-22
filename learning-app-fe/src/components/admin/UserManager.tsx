"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Eye,
  CheckCircle,
  Ban,
  Unlock,
  Users,
  UserCheck,
  UserX,
  Download,
  Plus,
} from "lucide-react";

import { userService, UserResponseManager } from "@/services/userService";
import BackButton from "../../components/backButton";

// --- Types ---
interface User {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "USER" | "TEACHER";
  status: "ACTIVE" | "BANNED" | "PENDING";
  lastActive: string;
  joinDate: string;
  avatarUrl?: string;
  level?: string;
}

interface StatusStyle {
  bg: string;
  text: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function UserManager() {
  // --- State ---
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, banned: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // --- 1. Handle Search Debounce ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, page: 0 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- 2. Data Fetching ---
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAllUsersManager(
        pagination.page,
        pagination.size,
        debouncedSearch
      );

      const mappedUsers: User[] = response.data.map((apiUser) => {
        const rawRole = apiUser.role as string | string[] | undefined | null;
        const roles: string[] = Array.isArray(rawRole)
          ? rawRole.map((r) => r.trim())
          : typeof rawRole === "string"
          ? rawRole
              .replace("[", "")
              .replace("]", "")
              .split(",")
              .map((r) => r.trim())
          : [];

        let role: User["role"] = "USER";
        if (roles.includes("ADMIN")) role = "ADMIN";
        else if (roles.includes("TEACHER")) role = "TEACHER";
        else if (roles.includes("USER_VIP")) role = "USER";

        const status = apiUser.enabled ? "ACTIVE" : "BANNED";

        return {
          id: apiUser.id,
          fullName: apiUser.fullName,
          email: apiUser.email,
          role,
          status,
          lastActive: "N/A",
          joinDate: apiUser.createdAt,
          avatarUrl: apiUser.avatarUrl,
          level: apiUser.level,
        };
      });

      setUsers(mappedUsers);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
      }));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.size, debouncedSearch]);

  const fetchStats = async () => {
    try {
      const statsData = await userService.getUserStatistics();
      setStats({
        total: statsData.total,
        active: statsData.active,
        banned: statsData.banned,
      });
    } catch (error) {
      console.error("Lỗi lấy thống kê:", error);
    }
  };

  // --- 3. Trigger Fetch ---
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers]);

  // --- 4. Client-Side Filtering ---
  const visibleUsers = users.filter((user) => {
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" || user.status === statusFilter;
    return matchesRole && matchesStatus;
  });

  // --- Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleBanUser = async (email: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email ? { ...u, status: "BANNED" as const } : u
      )
    );
    setStats((prev) => ({
      ...prev,
      active: Math.max(0, prev.active - 1),
      banned: prev.banned + 1,
    }));
    try {
      await userService.banUser(email);
    } catch (error) {
      console.error("Lỗi ban user:", error);
      alert("Lỗi kết nối! Hoàn tác lại.");
      fetchUsers();
      fetchStats();
    }
  };

  const handleUnbanUser = async (email: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email ? { ...u, status: "ACTIVE" as const } : u
      )
    );
    setStats((prev) => ({
      ...prev,
      active: prev.active + 1,
      banned: Math.max(0, prev.banned - 1),
    }));
    try {
      await userService.unbanUser(email);
    } catch (error) {
      console.error("Lỗi unban:", error);
      fetchUsers();
      fetchStats();
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (!confirm("Xóa user này?")) return;

    const previousUsers = [...users];

    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setStats((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - 1),
      active:
        userToDelete.status === "ACTIVE"
          ? Math.max(0, prev.active - 1)
          : prev.active,
      banned:
        userToDelete.status === "BANNED"
          ? Math.max(0, prev.banned - 1)
          : prev.banned,
    }));
    setPagination((prev) => ({
      ...prev,
      totalElements: Math.max(0, prev.totalElements - 1),
    }));

    try {
      await userService.deleteUserAccount(userToDelete.email);
      if (users.length === 1 && pagination.page > 0) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      }
    } catch (error) {
      console.error("Xóa thất bại:", error);
      alert("Xóa thất bại!");
      setUsers(previousUsers);
      fetchStats();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa ${selectedUserIds.length} người dùng này không?`
      )
    )
      return;

    const previousUsers = [...users];
    const previousStats = { ...stats };
    const previousPagination = { ...pagination };

    const usersToDelete = users.filter((u) => selectedUserIds.includes(u.id));
    const countActive = usersToDelete.filter(
      (u) => u.status === "ACTIVE"
    ).length;
    const countBanned = usersToDelete.filter(
      (u) => u.status === "BANNED"
    ).length;

    setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
    setStats((prev) => ({
      ...prev,
      total: Math.max(0, prev.total - usersToDelete.length),
      active: Math.max(0, prev.active - countActive),
      banned: Math.max(0, prev.banned - countBanned),
    }));
    setPagination((prev) => ({
      ...prev,
      totalElements: Math.max(0, prev.totalElements - usersToDelete.length),
    }));
    setSelectedUserIds([]);

    try {
      const emailsToDelete = usersToDelete.map((u) => u.email);
      await userService.deleteMultipleUserAccounts(emailsToDelete);
      if (users.length === usersToDelete.length && pagination.page > 0) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      }
    } catch (error) {
      console.error("Lỗi xóa hàng loạt:", error);
      alert("Có lỗi xảy ra. Đang hoàn tác...");
      setUsers(previousUsers);
      setStats(previousStats);
      setPagination(previousPagination);
      setSelectedUserIds(selectedUserIds);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(visibleUsers.map((u) => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  // --- Helper Components ---
  const RoleBadge = ({ role }: { role: string }) => {
    const styles: Record<string, string> = {
      ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
      TEACHER: "bg-blue-50 text-blue-700 border-blue-200",
      USER: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
          styles[role] || styles.USER
        }`}
      >
        {role}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, StatusStyle> = {
      ACTIVE: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: CheckCircle,
      },
      BANNED: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: Ban,
      },
      PENDING: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: MoreVertical,
      },
    };
    const conf = styles[status] ?? styles.ACTIVE;
    const Icon = conf.icon;

    return (
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${conf.border} ${conf.bg} ${conf.text} w-fit`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-bold">{status}</span>
      </div>
    );
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans text-gray-900">
      {/* 1. Header & Stats */}
      <div className="mb-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="shrink-0">
            <BackButton to="/admin" label="home" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý người dùng
            </h1>
            <p className="text-gray-500 text-sm">
              Quản lý danh sách, phân quyền và trạng thái hoạt động.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Tổng User</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg text-green-600 border border-green-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg text-red-600 border border-red-100">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Bị chặn</p>
              <p className="text-2xl font-bold text-gray-900">{stats.banned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Actions */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên hoặc email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full md:w-64 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:border-gray-400 transition-colors"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Admin</option>
                <option value="USER_VIP">User_vip</option>
                <option value="USER">User</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:border-gray-400 transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="BANNED">Đã chặn</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedUserIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition-colors text-sm font-medium animate-in fade-in"
              >
                <Trash2 className="w-4 h-4" /> Xóa ({selectedUserIds.length})
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" /> Xuất file
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
              <Plus className="w-4 h-4" /> Thêm user
            </button>
          </div>
        </div>

        {/* 3. Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs border-b border-gray-200">
              <tr>
                <th className="p-4 w-4">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Tham gia</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : visibleUsers.length > 0 ? (
                visibleUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-gray-500 text-lg">
                              {user.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(user.joinDate).toLocaleDateString("vi-VN")}
                      {user.level && (
                        <p className="text-xs text-indigo-500 font-medium mt-0.5">
                          Level: {user.level}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={`/admin/users/${user.id}`}
                          className="p-2 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded text-gray-500 hover:text-indigo-600"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        {user.status === "BANNED" ? (
                          <button
                            onClick={() => handleUnbanUser(user.email)}
                            className="p-2 hover:bg-green-50 border border-transparent hover:border-green-200 rounded text-gray-500 hover:text-green-600"
                            title="Mở chặn"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBanUser(user.email)}
                            className="p-2 hover:bg-orange-50 border border-transparent hover:border-orange-200 rounded text-gray-500 hover:text-orange-600"
                            title="Chặn user"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 hover:bg-red-50 border border-transparent hover:border-red-200 rounded text-gray-500 hover:text-red-600"
                          title="Xóa user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 text-gray-200 mb-3" />
                      <p className="text-gray-500 font-medium">
                        Không tìm thấy kết quả nào.
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Thử thay đổi từ khóa tìm kiếm.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between text-sm text-gray-500">
          <span>
            Hiển thị {pagination.page * pagination.size + 1}-
            {Math.min(
              (pagination.page + 1) * pagination.size,
              pagination.totalElements
            )}{" "}
            trên tổng số {pagination.totalElements}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0 || isLoading}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <span className="flex items-center px-2">
              Trang {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={
                pagination.page >= pagination.totalPages - 1 || isLoading
              }
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
