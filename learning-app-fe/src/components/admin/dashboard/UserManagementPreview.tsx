"use client";
import React, { useEffect, useState } from "react";
import { Users, UserCheck, UserX, ArrowRight } from "lucide-react";
import { userService, UserStatsResponse } from "@/services/userService";
import Link from "next/link";

export default function UserManagementPreview() {
    const [stats, setStats] = useState<UserStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await userService.getUserStatistics();
                setStats(data);
            } catch (error) {
                console.error("Lỗi khi lấy thống kê người dùng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="animate-pulse bg-white p-6 rounded-2xl border border-gray-100 h-64"></div>;
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-800">Tóm tắt người dùng</h3>
                <Link href="/admin/users" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    Xem tất cả <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Tổng số học viên</p>
                            <h4 className="text-xl font-bold text-gray-900">{stats?.total.toLocaleString()}</h4>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-green-600 uppercase">Đang hoạt động</p>
                            <h4 className="text-xl font-bold text-gray-900">{stats?.active.toLocaleString()}</h4>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-green-600">{((stats?.active || 0) / (stats?.total || 1) * 100).toFixed(1)}%</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                            <UserX className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-red-600 uppercase">Tài khoản bị chặn</p>
                            <h4 className="text-xl font-bold text-gray-900">{stats?.banned.toLocaleString()}</h4>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-red-600">{stats?.banned} users</span>
                </div>
            </div>
        </div>
    );
}
