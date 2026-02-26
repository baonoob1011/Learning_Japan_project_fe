"use client";
import React, { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { revenueService, RevenueSummaryResponse } from "@/services/revenueService";

export default function RevenueExhibition() {
    const [revenue, setRevenue] = useState<RevenueSummaryResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const response = await revenueService.getSummary();
                if (response) {
                    setRevenue(response);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    if (loading) {
        return <div className="animate-pulse bg-white p-6 rounded-2xl border border-gray-100 h-48"></div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12.5%</span>
                </div>
                <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenue?.totalRevenue || 0)}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Today</span>
                </div>
                <p className="text-sm font-medium text-gray-500">Doanh thu hôm nay</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenue?.todayRevenue || 0)}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">Month</span>
                </div>
                <p className="text-sm font-medium text-gray-500">Doanh thu tháng này</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenue?.monthRevenue || 0)}</h3>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Orders</span>
                </div>
                <p className="text-sm font-medium text-gray-500">Đơn hàng thành công</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{revenue?.totalSuccessOrders || 0}</h3>
            </div>
        </div>
    );
}
