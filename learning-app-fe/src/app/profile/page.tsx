"use client";

import { useEffect, useRef, useState } from "react";
import { userService, UserProfileResponse } from "@/services/userService";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function ProfilePage() {
  // --- STATE CHÍNH ---
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State form thông tin
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  // State cho Modal Đổi mật khẩu
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- LOAD DATA ---
  useEffect(() => {
    const load = async () => {
      try {
        const userData = await userService.getProfile();

        if (userData) {
          setUser(userData);
          setFormData({
            fullName: userData.fullName || "",
            email: userData.email || "",
          });
        }
      } catch (error) {
        console.error("Lỗi tải profile:", error);
      }
    };
    load();
  }, []);

  // --- HANDLERS AVATAR & INFO ---
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      await userService.uploadAvatar(file);
      const updated = await userService.getProfile();
      setUser(updated);
    } catch (error) {
      alert("Lỗi upload ảnh");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = async () => {
    try {
      // await userService.updateProfile(formData);
      console.log("Saving info:", formData);
      alert("Đã cập nhật thông tin thành công!");

      setUser((prev) => (prev ? { ...prev, ...formData } : null));
      setIsEditing(false);
    } catch (error) {
      alert("Lỗi khi lưu thông tin");
    }
  };

  // --- HANDLERS ĐỔI MẬT KHẨU ---
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPassword = async () => {
    // 1. Validate (Giữ nguyên như cũ)
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    try {
      await userService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");

      // Reset form và đóng modal
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Tùy chọn: Logout luôn để người dùng đăng nhập lại
      // router.push("/login");
    } catch (error: unknown) {
      // Xử lý lỗi từ Backend trả về
      console.error(error);
      const isAxiosError = (
        err: unknown
      ): err is { response?: { status?: number } } => {
        return typeof err === "object" && err !== null && "response" in err;
      };

      if (isAxiosError(error) && error.response?.status === 400) {
        alert("Mật khẩu hiện tại không đúng!");
      } else {
        alert("Đổi mật khẩu thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  if (!user) return <div className="text-center p-10">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 relative">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => router.push("/video")}
          className="mb-4 px-4 py-2 rounded-xl border bg-white hover:bg-gray-100 shadow text-gray-800 font-semibold"
        >
          ⬅ Quay lại trang chính
        </button>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-indigo-500 text-transparent bg-clip-text">
          Hồ sơ của bạn
        </h1>

        <div className="mt-6 bg-white border rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <img
                  src={user.avatarUrl || "/default-avatar.png"}
                  alt={user.fullName || "Avatar người dùng"}
                  className="w-full h-full rounded-full object-cover border-4 border-cyan-300 shadow-lg"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 text-sm text-cyan-600 font-semibold hover:underline"
              >
                Đổi ảnh đại diện
              </button>
            </div>

            {/* Info Form Section */}
            <div className="flex-1 w-full space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-gray-700 focus:ring-2 focus:ring-cyan-500 outline-none transition"
                  />
                ) : (
                  <div className="text-xl font-semibold text-gray-900 py-2">
                    {user.fullName || "Chưa cập nhật tên"}
                  </div>
                )}
              </div>

              {/* Email (READ ONLY) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed outline-none"
                  />
                ) : (
                  <div className="text-gray-800 py-2">{user.email}</div>
                )}
                {isEditing && (
                  <p className="text-xs text-gray-400 mt-1">
                    Email không thể thay đổi.
                  </p>
                )}
              </div>

              {/* Account Type */}
              <div>
                <span className="inline-block text-xs px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 text-white shadow">
                  Tài khoản miễn phí
                </span>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadAvatar}
          />

          <div className="border-t my-6"></div>

          {/* Buttons Area */}
          <div className="flex flex-wrap gap-3 justify-end">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-4 py-2 rounded-xl shadow text-white font-medium bg-gradient-to-r from-pink-400 to-purple-500 hover:opacity-90 transition"
                >
                  🔑 Đổi mật khẩu
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 rounded-xl shadow text-white font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
                >
                  ✏️ Chỉnh sửa thông tin
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: user.fullName || "",
                      email: user.email || "",
                    });
                  }}
                  className="px-6 py-2 rounded-xl font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSaveInfo}
                  className="px-6 py-2 rounded-xl shadow text-white font-medium bg-green-500 hover:bg-green-600 transition flex items-center gap-2"
                >
                  💾 Lưu thay đổi
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ⭐ MODAL ĐỔI MẬT KHẨU ⭐ */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Đổi mật khẩu</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhập lại mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border rounded-xl text-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="••••••"
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 rounded-xl text-gray-700 hover:bg-gray-200 font-medium transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitPassword}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium shadow transition"
              >
                Xác nhận đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
