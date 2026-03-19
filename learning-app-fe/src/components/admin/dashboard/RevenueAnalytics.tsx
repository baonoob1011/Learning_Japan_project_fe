"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { revenueService, ProductRevenueResponse } from "@/services/revenueService";
import { TrendingUp, BarChart3, GraduationCap, Crown, Search, Box } from "lucide-react";

interface Props { isDark?: boolean; }

export default function RevenueAnalytics({ isDark = false }: Props) {
    const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([]);
    const [productData, setProductData] = useState<ProductRevenueResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const [chart, products] = await Promise.all([
                    revenueService.getChart30Days(),
                    revenueService.getByProduct()
                ]);

                const formattedChart = Object.entries(chart).map(([date, amount]) => ({
                    date: new Date(date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' }),
                    amount
                })).sort((a, b) => {
                    const [da, ma] = a.date.split('/').map(Number);
                    const [db, mb] = b.date.split('/').map(Number);
                    return ma !== mb ? ma - mb : da - db;
                });

                setChartData(formattedChart);
                setProductData(products);
            } catch (error) {
                console.error("Dashboard load failed:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return productData;
        const low = searchTerm.toLowerCase();
        return productData.filter(p =>
            p.name.toLowerCase().includes(low) ||
            p.type.toLowerCase().includes(low)
        );
    }, [productData, searchTerm]);

    const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

    const cardCls = isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm";
    const textCls = isDark ? "text-gray-100" : "text-gray-900";
    const subTextCls = isDark ? "text-gray-400" : "text-gray-500";

    if (loading) {
        return <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-pulse">
            <div className={`lg:col-span-3 h-[450px] rounded-[32px] border ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`} />
            <div className={`lg:col-span-2 h-[450px] rounded-[32px] border ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`} />
        </div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Chart Section */}
            <div className={`lg:col-span-3 p-8 rounded-[32px] border ${cardCls}`}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className={`text-xl font-black ${textCls}`}>Xu hướng 30 ngày</h4>
                            <p className={`text-sm font-medium ${subTextCls}`}>Biến động dòng tiền gần đây</p>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAmountAnalytics" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#e5e7eb"} />
                            <XAxis
                                dataKey="date"
                                stroke={isDark ? "#9ca3af" : "#6b7280"}
                                fontSize={11}
                                fontWeight="bold"
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke={isDark ? "#9ca3af" : "#6b7280"}
                                fontSize={11}
                                fontWeight="bold"
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#fff',
                                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                    padding: '12px'
                                }}
                                formatter={(value: any) => [fmt(value || 0), "Doanh thu"]}
                                labelStyle={{ color: isDark ? '#f3f4f6' : '#111827', fontWeight: '900', marginBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#6366f1"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorAmountAnalytics)"
                                animationDuration={2000}
                                animationEasing="ease-in-out"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Product Revenue Section */}
            <div className={`lg:col-span-2 p-8 rounded-[32px] border ${cardCls} flex flex-col`}>
                <div className="space-y-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                <Box className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className={`text-xl font-black ${textCls}`}>Cơ cấu sản phẩm</h4>
                                <p className={`text-sm font-medium ${subTextCls}`}>Doanh thu theo Khóa học & VIP</p>
                            </div>
                        </div>
                    </div>

                    {/* Simple Search */}
                    <div className="relative">
                        <Search className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 ${subTextCls} opacity-40`} />
                        <input
                            type="text"
                            placeholder="Lọc sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-bold outline-none border transition-all ${isDark ? "bg-gray-900 border-gray-700 focus:border-emerald-500 text-white" : "bg-gray-50 border-gray-200 focus:border-emerald-400 text-gray-900"
                                }`}
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
                    {filteredProducts.map((p, idx) => {
                        const isCourse = p.type === "COURSE";
                        return (
                            <div key={idx} className={`flex items-center justify-between p-4 rounded-3xl transition-all border ${isDark ? "bg-gray-900/40 border-gray-700/50 hover:bg-gray-900" : "bg-gray-50 border-gray-100/50 hover:bg-white hover:shadow-lg"
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCourse
                                        ? (isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600")
                                        : (isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600")
                                        }`}>
                                        {isCourse ? <GraduationCap size={20} /> : <Crown size={20} />}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-sm font-black truncate max-w-[120px] ${textCls}`}>{p.name}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isCourse ? "bg-indigo-500" : "bg-amber-500"}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${subTextCls}`}>{isCourse ? "Khóa học" : "Gói VIP"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-black ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{fmt(p.revenue)}</div>
                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Total Gross</div>
                                </div>
                            </div>
                        );
                    })}
                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 italic">
                            <BarChart3 className="w-10 h-10 opacity-10 mb-2" />
                            <p className="text-xs font-bold">Không tìm thấy sản phẩm</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
