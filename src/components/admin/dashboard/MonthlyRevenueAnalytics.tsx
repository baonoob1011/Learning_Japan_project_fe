"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { revenueService, MonthlyRevenueResponse } from "@/services/revenueService";
import { Calendar, Search, Loader2, TrendingUp, BarChart3 } from "lucide-react";

interface Props { isDark?: boolean; }

export default function MonthlyRevenueAnalytics({ isDark = false }: Props) {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [monthlyData, setMonthlyData] = useState<MonthlyRevenueResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const years = useMemo(() => {
        const startYear = 2024;
        const endYear = currentYear;
        const yearsList = [];
        for (let y = endYear; y >= startYear; y--) yearsList.push(y);
        return yearsList;
    }, [currentYear]);

    useEffect(() => {
        fetchMonthlyData();
    }, [selectedYear]);

    const fetchMonthlyData = async () => {
        setLoading(true);
        try {
            const data = await revenueService.getMonthly(selectedYear);
            setMonthlyData(data);
        } catch (error) {
            console.error("Failed to fetch monthly revenue:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!searchTerm) return monthlyData;
        return monthlyData.filter(d =>
            d.monthName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `tháng ${d.month}`.includes(searchTerm.toLowerCase())
        );
    }, [monthlyData, searchTerm]);

    const totalYearRevenue = useMemo(() =>
        monthlyData.reduce((sum, item) => sum + item.revenue, 0)
        , [monthlyData]);

    const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

    const cardCls = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm";
    const textCls = isDark ? "text-gray-100" : "text-gray-900";
    const subTextCls = isDark ? "text-gray-400" : "text-gray-500";

    return (
        <div className={`p-8 rounded-[32px] border ${cardCls} space-y-8`}>
            {/* Header with Search & Filter */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-black ${textCls}`}>Doanh thu theo Tháng</h3>
                        <p className={`text-sm font-medium ${subTextCls}`}>Phân tích hiệu suất kinh doanh năm {selectedYear}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${subTextCls}`} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tháng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`pl-11 pr-4 py-3 rounded-2xl text-sm font-bold outline-none border transition-all w-full sm:w-[240px] ${isDark ? "bg-gray-900/50 border-gray-700 focus:border-blue-500 text-white" : "bg-gray-50 border-gray-200 focus:border-blue-400 text-gray-900"
                                }`}
                        />
                    </div>

                    {/* Year Selector */}
                    <div className="relative group">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className={`appearance-none pl-5 pr-12 py-3 rounded-2xl text-sm font-black outline-none border transition-all cursor-pointer ${isDark
                                ? "bg-gray-900 border-gray-700 text-gray-100 hover:border-indigo-500"
                                : "bg-blue-50 hover:bg-blue-100 border-blue-100 text-blue-700"
                                }`}
                        >
                            {years.map(y => (
                                <option key={y} value={y} className={isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}>
                                    Năm {y}
                                </option>
                            ))}
                        </select>
                        <TrendingUp className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-indigo-400" : "text-blue-500"}`} />
                    </div>
                </div>
            </div>

            {/* Total Indicator */}
            <div className={`p-6 rounded-3xl border-2 border-dashed flex items-center justify-between ${isDark ? "border-gray-700 bg-gray-900/40" : "border-blue-100 bg-blue-50/30"}`}>
                <div className="flex items-center gap-4">
                    <div className="w-1.5 h-10 bg-blue-500 rounded-full animate-pulse" />
                    <div>
                        <span className={`text-xs font-black uppercase tracking-widest ${subTextCls}`}>Tổng doanh thu năm {selectedYear}</span>
                        <div className={`text-2xl font-black ${isDark ? "text-blue-400" : "text-blue-600"}`}>{fmt(totalYearRevenue)}</div>
                    </div>
                </div>
                <div className="hidden sm:block text-right">
                    <div className={`text-xs font-bold ${subTextCls}`}>Trung bình mỗi tháng</div>
                    <div className={`font-black ${textCls}`}>{fmt(Math.round(totalYearRevenue / 12))}</div>
                </div>
            </div>

            {/* Main Chart Section */}
            <div className="h-[400px] w-full">
                {loading ? (
                    <div className="h-full w-full flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <span className={`text-sm font-bold ${subTextCls}`}>Đang tổng hợp dữ liệu...</span>
                    </div>
                ) : filteredData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#e5e7eb"} />
                            <XAxis
                                dataKey="month"
                                tickFormatter={(m) => `Th ${m}`}
                                stroke={isDark ? "#9ca3af" : "#6b7280"}
                                fontSize={10}
                                fontWeight="black"
                                tickLine={false}
                                axisLine={false}
                                interval={0}
                            />
                            <YAxis
                                stroke={isDark ? "#9ca3af" : "#6b7280"}
                                fontSize={10}
                                fontWeight="bold"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value / 1000000}M`}
                            />
                            <Tooltip
                                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#fff',
                                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                    padding: '12px'
                                }}
                                formatter={(value: any) => [fmt(value || 0), "Doanh thu"]}
                                labelFormatter={(m) => `Tháng ${m}`}
                                labelStyle={{ color: isDark ? '#f3f4f6' : '#111827', fontWeight: '900', marginBottom: '4px' }}
                            />
                            <Bar
                                dataKey="revenue"
                                radius={[8, 8, 0, 0]}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {filteredData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.revenue > 0 ? '#3b82f6' : (isDark ? '#374151' : '#e5e7eb')}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                        <BarChart3 className="w-12 h-12 opacity-10 mb-4" />
                        <p className="font-bold">Không có dữ liệu cho năm {selectedYear}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
