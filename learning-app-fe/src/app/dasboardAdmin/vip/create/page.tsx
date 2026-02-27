"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/dashboard/AdminHeader";
import { useAuthStore } from "@/stores/authStore";
import { getRolesFromToken } from "@/utils/jwt";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Crown, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { vipService, CreateVipPackageRequest, PlanType } from "@/services/vipService";

export default function CreateVipPackagePage() {
    const router = useRouter();
    const [isReady, setIsReady] = useState(false);
    const { isDarkMode: isDark } = useDarkMode();

    const [formData, setFormData] = useState<CreateVipPackageRequest>({
        planType: "MONTHLY",
        name: "",
        price: 0,
        durationDays: 30,
        active: true
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const { accessToken } = useAuthStore.getState();
        if (!accessToken) {
            router.push("/login");
            return;
        }
        const roles = getRolesFromToken(accessToken);
        if (!roles.includes("ADMIN")) {
            router.push("/login");
            return;
        }
        setIsReady(true);
    }, [router]);

    // Handle form change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (name === "planType") {
            const plan = value as PlanType;
            let defaultDays = 30;
            if (plan === "YEARLY") defaultDays = 365;
            if (plan === "LIFETIME") defaultDays = 36500; // 100 years

            setFormData(prev => ({ ...prev, planType: plan, durationDays: defaultDays }));
            return;
        }

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === "number") {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!formData.name.trim()) {
            setError("Tên gói VIP không được để trống.");
            return;
        }
        if (formData.price < 0) {
            setError("Giá gói VIP không được âm.");
            return;
        }

        setIsLoading(true);
        try {
            await vipService.create(formData);
            setSuccess(true);
            // Reset form partly
            setFormData(prev => ({ ...prev, name: "", price: 0 }));
            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            console.error("Lỗi tạo gói VIP:", err);
            setError(err.response?.data?.message || "Đã xảy ra lỗi khi tạo gói VIP.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isReady) return null;

    return (
        <div className={`flex min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-[#F3F4F6]"}`}>
            <Sidebar isDark={isDark} />

            <div className={`flex-1 ml-64 flex flex-col transition-colors duration-300 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                <AdminHeader isDarkMode={isDark} />

                <main className="p-8 w-full space-y-8">
                    {/* Breadcrumbs */}
                    <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        <span className="hover:text-indigo-500 cursor-pointer transition-colors" onClick={() => router.push('/dasboardAdmin')}>Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className={`font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>Tạo gói VIP</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${isDark ? "bg-amber-500/20 text-amber-400" : "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-lg"}`}>
                            <Crown className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>Tạo gói VIP mới</h1>
                            <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Thiết lập và ra mắt gói Premium mới cho hệ thống</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl transition-all ${isDark ? "bg-gray-800/50 border-gray-700/50" : "bg-white border-gray-100"}`}>

                        {error && (
                            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                Đã tạo gói VIP thành công!
                            </div>
                        )}

                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Tên gói */}
                            <div className="sm:col-span-2">
                                <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Tên Gói VIP <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: Gói VIP 3 Tháng"
                                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
                                />
                            </div>

                            {/* Plan Type */}
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Loại Gói <span className="text-red-500">*</span></label>
                                <select
                                    name="planType"
                                    value={formData.planType}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-gray-900"}`}
                                >
                                    <option value="MONTHLY">Hàng tháng (Monthly)</option>
                                    <option value="YEARLY">Hàng năm (Yearly)</option>
                                    <option value="LIFETIME">Trọn đời (Lifetime)</option>
                                </select>
                            </div>

                            {/* Số ngày */}
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    Thời hạn (Ngày) <span className="text-xs font-normal opacity-70">(tự động tính theo loại gói)</span>
                                </label>
                                <input
                                    type="number"
                                    name="durationDays"
                                    value={formData.durationDays || 0}
                                    onChange={handleChange}
                                    min="1"
                                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
                                />
                            </div>

                            {/* Giá tiền */}
                            <div className="sm:col-span-2">
                                <label className={`block text-sm font-bold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Giá tiền (VNĐ) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold ${isDark ? "text-gray-500" : "text-gray-400"}`}>đ</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition ${isDark ? "bg-gray-900/50 border-gray-700 text-white placeholder-gray-500" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"}`}
                                    />
                                </div>
                            </div>

                            {/* Kích hoạt */}
                            <div className="sm:col-span-2 flex items-center justify-between p-4 rounded-xl border mt-2 bg-indigo-50/10 border-indigo-100 dark:border-indigo-500/20">
                                <div>
                                    <h4 className={`font-bold text-sm ${isDark ? "text-gray-200" : "text-gray-900"}`}>Trạng thái hoạt động</h4>
                                    <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Cho phép người dùng nhìn thấy và đăng ký gói VIP này lập tức</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-xl transition-all transform active:scale-95 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-500/25"
                                    }`}
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Đang tạo...</>
                                ) : (
                                    <><Crown className="w-5 h-5" /> Tạo Gói VIP</>
                                )}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}
