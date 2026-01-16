"use client";
import React from "react";
import { 
  LayoutDashboard, Users, BookOpen, Layers, 
  MessageSquare, Settings, LogOut, Tv, 
  MessageCircle, FileText, BrainCircuit, ShieldCheck 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // 1. Import useRouter

const menuGroups = [
  {
    section: "TỔNG QUAN",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Users, label: "Học viên (User 360)", href: "/admin/users" },
    ]
  },
  {
    section: "HỌC TẬP (LMS)",
    items: [
      { icon: Layers, label: "Lộ trình (Junbi/Taisaku)", href: "/admin/curriculum" },
      { icon: FileText, label: "Kho đề thi (JLPT)", href: "/admin/exams" },
      { icon: BookOpen, label: "Sách & Tài liệu", href: "/admin/books" },
    ]
  },
  {
    section: "MEDIA & AI",
    items: [
      { icon: Tv, label: "Video & Script", href: "/admin/videos" },
      { icon: BrainCircuit, label: "AI & Chatbot Logs", href: "/admin/ai-logs" },
    ]
  },
  {
    section: "CỘNG ĐỒNG",
    items: [
      { icon: MessageCircle, label: "Kiểm duyệt bài đăng", href: "/admin/community" },
      { icon: ShieldCheck, label: "Báo cáo vi phạm", href: "/admin/reports" },
    ]
  },
  {
    section: "HỆ THỐNG",
    items: [
      { icon: MessageSquare, label: "Phản hồi & Góp ý", href: "/admin/feedback" },
      { icon: Settings, label: "Cấu hình chung", href: "/admin/settings" },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter(); // 2. Khởi tạo router

  // 3. Hàm xử lý Đăng xuất
  const handleLogout = () => {
    // Thêm bước xác nhận để tránh bấm nhầm
    const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?");
    
    if (confirmLogout) {
      // TODO: Xóa token/cookie lưu trữ phiên đăng nhập ở đây
      // Ví dụ: localStorage.removeItem("accessToken");
      // Ví dụ: await signOut(); // Nếu dùng NextAuth
      
      console.log("Đã đăng xuất");
      router.push("/login"); // Chuyển hướng về trang Login
    }
  };

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col border-r border-gray-800 z-50">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800 shrink-0">
        <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
          NIBO Admin
        </span>
      </div>

      {/* Menu Area */}
      <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6 last:mb-0">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
              {group.section}
            </h3>
            
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      isActive 
                        ? "bg-blue-600 text-white shadow-md font-semibold" 
                        : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Sidebar - Nút Đăng Xuất đã sửa */}
      <div className="p-4 border-t border-gray-800 shrink-0 bg-gray-900">
        <button 
          onClick={handleLogout} // 4. Gắn sự kiện vào đây
          className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg w-full transition font-medium text-sm"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}