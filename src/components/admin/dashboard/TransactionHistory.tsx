"use client";
import React, { useEffect, useState } from "react";
import { revenueService, Order } from "@/services/revenueService";
import {
    Download,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock,
    FileSpreadsheet,
    FileText
} from "lucide-react";

interface Props { isDark?: boolean; }

export default function TransactionHistory({ isDark = false }: Props) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        revenueService.getRecentTransactions()
            .then(res => setOrders(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const fmt = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

    const exportToCSV = () => {
        const headers = ["Mã đơn", "Học viên", "Email", "Số tiền", "Phương thức", "Trạng thái", "Ngày thanh toán"];
        const rows = orders.map(o => [
            o.orderCode,
            o.user?.fullName || "N/A",
            o.user?.email || "N/A",
            o.amount,
            o.paymentMethod,
            o.status,
            o.paidAt ? new Date(o.paidAt).toLocaleDateString("vi-VN") : "N/A"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `BaoCaoDoanhThu_${new Date().toLocaleDateString("vi-VN").replace(/\//g, '-')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const cardCls = isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-100 hover:shadow-md";
    const textCls = isDark ? "text-gray-100" : "text-gray-900";
    const subTextCls = isDark ? "text-gray-400" : "text-gray-500";

    const filteredOrders = orders.filter(o =>
        o.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className={`animate-pulse ${isDark ? "bg-gray-800" : "bg-white"} p-6 rounded-2xl border h-96`} />;

    return (
        <section className="space-y-6">
            <div className={`p-8 rounded-3xl border transition-all ${cardCls}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h3 className={`text-xl font-extrabold tracking-tight ${textCls}`}>Lịch sử giao dịch chi tiết</h3>
                        <p className={`text-sm mt-1 ${subTextCls}`}>Tra cứu và quản lý tất cả các giao dịch thành công trên hệ thống</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-hover:text-indigo-500 ${subTextCls}`} />
                            <input
                                type="text"
                                placeholder="Mã đơn, học viên, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 ${isDark ? "bg-gray-900/50 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800"}`}
                            />
                        </div>
                        <button
                            onClick={exportToCSV}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 bg-indigo-600 hover:bg-indigo-700 text-white`}
                        >
                            <Download className="w-4 h-4" />
                            Xuất Excel (CSV)
                        </button>
                    </div>
                </div>

                <div className={`overflow-x-auto rounded-2xl border ${isDark ? "border-gray-700/50 bg-gray-900/50" : "border-gray-100 bg-white"}`}>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? "border-gray-700/50 text-gray-400 bg-gray-800/50" : "border-gray-100 text-gray-500 bg-gray-50/50"}`}>
                                <th className="px-6 py-4">Mã Giao Dịch</th>
                                <th className="px-6 py-4">Sản phẩm</th>
                                <th className="px-6 py-4">Học viên</th>
                                <th className="px-6 py-4">Số tiền</th>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y text-sm ${isDark ? "divide-gray-700/50" : "divide-gray-100 bg-white"}`}>
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-indigo-500/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-mono font-bold text-[11px] px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 cursor-help transition-all hover:bg-indigo-500/20`}
                                                title={order.orderCode}
                                            >
                                                #{order.orderCode?.slice(0, 10)}...
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className={`font-bold text-sm tracking-tight ${textCls}`}>
                                                {order.orderItems?.[0]?.courseTitle || order.orderItems?.[0]?.vipPackageName || "N/A"}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded w-fit ${order.orderItems?.[0]?.productType === 'COURSE'
                                                ? "bg-blue-500/10 text-blue-500"
                                                : "bg-purple-500/10 text-purple-500"
                                                }`}>
                                                {order.orderItems?.[0]?.productType === 'COURSE' ? 'KHÓA HỌC' : 'VIP PACKAGE'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="relative group/avatar">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-transparent group-hover/avatar:border-indigo-500 transition-all shadow-sm">
                                                    {order.user?.avatarUrl ? (
                                                        <img src={order.user.avatarUrl} alt={order.user.fullName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black text-white">
                                                            {order.user?.fullName?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-sm ${textCls}`}>{order.user?.fullName}</span>
                                                <span className="text-[10px] text-gray-500 font-medium">{order.user?.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-black text-base ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                            {fmt(order.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(order.paidAt || order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${order.status === 'SUCCESS'
                                            ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                                            : "bg-red-500/10 text-red-500 ring-red-500/20"
                                            }`}>
                                            {order.status === 'SUCCESS' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                            {order.status === 'SUCCESS' ? "Thành công" : "Thất bại"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <i className="lucide-frown w-12 h-12 text-gray-300 mb-4" />
                            <h4 className={`font-bold ${textCls}`}>Không tìm thấy giao dịch nào</h4>
                            <p className={`text-xs ${subTextCls} mt-1`}>Thử tìm kiếm với từ khóa khác</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
