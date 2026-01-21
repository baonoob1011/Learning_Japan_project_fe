"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import StatsCard from "@/components/admin/StatsCard";
import {
  Users, DollarSign, Mic,
  MoreVertical, FileText, MessageCircle, AlertCircle, Loader2,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";

// Import Service và Type
import { userService, UserResponse } from "@/services/userService";

export default function AdminDashboard() {
  const router = useRouter();

  // --- 1. STATE ---
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 5; // Số user hiển thị mỗi trang trên dashboard

  // --- 2. EFFECT (Gọi API) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Gọi API với trang hiện tại và kích thước trang
        const response = await userService.getAllUsers(currentPage, PAGE_SIZE);

        setUsers(response.data);

        // Cập nhật tổng số trang (giả sử API trả về field totalPages)
        // Nếu API trả về totalElements, bạn có thể tính: Math.ceil(response.totalElements / PAGE_SIZE)
        setTotalPages(response.totalPages || 1);

      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentPage]); // Chạy lại khi currentPage thay đổi

  // --- 3. HANDLERS ---
  const handleRowClick = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getLevelBadgeColor = (level?: string) => {
    if (!level) return "bg-gray-100 text-gray-600";
    if (level.includes("N1")) return "bg-red-100 text-red-700 border-red-200";
    if (level.includes("N2")) return "bg-orange-100 text-orange-700 border-orange-200";
    if (level.includes("N3")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
    if (level.includes("N4")) return "bg-cyan-100 text-cyan-700 border-cyan-200";
    return "bg-blue-100 text-blue-700 border-blue-200"; // N5
  };

  // --- 4. RENDER ---
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Tổng quan</h1>
            <p className="text-gray-500 text-sm mt-1">
              Theo dõi sức khỏe hệ thống: <span className="font-semibold text-blue-600">Học tập</span> • <span className="font-semibold text-green-600">Cộng đồng</span> • <span className="font-semibold text-purple-600">AI</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
              Xuất báo cáo tháng
            </button>
            <button
              onClick={() => router.push('/admin/curriculum')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-200"
            >
              + Soạn bài học / Lộ trình
            </button>
          </div>
        </div>

        {/* KEY METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="User Active hôm nay" value="1,240" icon={Users} trend="+12% so với hôm qua" color="blue" />
          <StatsCard title="Giờ luyện nói AI" value="456h" icon={Mic} trend="+80h tuần này" color="purple" />
          <StatsCard title="Lượt thi thử (Exam)" value="892" icon={FileText} trend="Trung bình 2.5 đề/user" color="green" />
          <StatsCard title="Doanh thu Premium" value="45.2M ₫" icon={DollarSign} trend="+5 user nâng cấp" color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CỘT TRÁI: Danh sách User & Tiến độ */}
          <div className="lg:col-span-2 space-y-8">

            {/* Bảng User mới đăng ký */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Học viên mới & Tiến độ</h3>
              <a href="/admin/users" className="text-blue-600 text-sm hover:underline font-medium">Quản lý User</a>
            </div>

              {/* Table Container */}
              <div className="flex-1 overflow-x-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                        <th className="px-5 py-3">Học viên</th>
                        <th className="px-5 py-3">Trình độ</th>
                        <th className="px-5 py-3">Process hiện tại</th>
                        <th className="px-5 py-3">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.length === 0 ? (
                        <tr><td colSpan={4} className="p-5 text-center text-gray-500">Chưa có user nào.</td></tr>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            onClick={() => handleRowClick(user.id)}
                            className="hover:bg-gray-50 transition group cursor-pointer"
                          >
                            <td className="px-5 py-3 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 overflow-hidden">
                                {user.avatarUrl ? (
                                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  (user.fullName || "U").charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-700">{user.fullName || "Unnamed User"}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${getLevelBadgeColor(user.level)}`}>
                                {user.level || "N5"}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-gray-600">
                                  {user.stage || "Newbie"}
                                </span>
                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${(user.processPercent || 0) > 80 ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${user.processPercent || 0}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              {user.isPremium ? (
                                <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-xs font-medium border border-orange-100">Premium</span>
                              ) : (
                                <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">Free</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer Phân trang */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Hiển thị trang <span className="font-semibold text-gray-700">{currentPage}</span> /iển thị trang 2 trên tổng số 2 {totalPages}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>

            {/* Biểu đồ phân bổ JLPT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Phân bổ học viên theo trình độ (Mock Data)</h3>
              <div className="space-y-4">
                {[
                  { level: "N5 (Sơ cấp)", count: 450, color: "bg-blue-400", percent: "45%" },
                  { level: "N4 (Sơ cấp)", count: 320, color: "bg-cyan-400", percent: "32%" },
                  { level: "N3 (Trung cấp)", count: 210, color: "bg-green-500", percent: "21%" },
                  { level: "N2 (Trung-Cao)", count: 150, color: "bg-orange-400", percent: "15%" },
                  { level: "N1 (Cao cấp)", count: 50, color: "bg-red-500", percent: "5%" },
                ].map((item) => (
                  <div key={item.level} className="flex items-center text-sm">
                    <span className="w-24 font-medium text-gray-600">{item.level}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mx-3">
                      <div className={`h-full ${item.color}`} style={{ width: item.percent }}></div>
                    </div>
                    <span className="w-12 text-right text-gray-500">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: Thông báo & Cộng đồng */}
          <div className="space-y-6">

            {/* Kiểm duyệt Cộng đồng */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MessageCircle size={18} className="text-orange-500" /> Cộng đồng
                </h3>
                <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-full">3 mới</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex gap-3 items-start pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">H</div>
                  <div>
                    <p className="text-sm text-gray-800 line-clamp-2">
                      <span className="font-bold">Hùng N3:</span> Chia sẻ bộ tài liệu Mimi Kara Oboeru N3 full PDF...
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Duyệt</button>
                      <button className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200">Xóa</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Báo cáo Lỗi nội dung */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-500" /> Báo lỗi nội dung
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Sai nghĩa từ vựng "Kouen"</p>
                    <p className="text-xs text-gray-500 mt-1">Bài 12 - Minna no Nihongo (N5)</p>
                  </div>
                  <button className="ml-auto text-gray-400 hover:text-gray-600"><MoreVertical size={16} /></button>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100 text-center">
                <button className="text-sm text-gray-500 font-medium hover:text-gray-800">Xem tất cả 15 báo cáo</button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}