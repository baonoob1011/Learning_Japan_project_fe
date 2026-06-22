"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, LogOut } from "lucide-react";

interface KickOutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const KickOutModal: React.FC<KickOutModalProps> = ({ isOpen, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with extreme blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl"
          >
            {/* Top decorative accent */}
            <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

            <div className="p-8">
              {/* Icon Section */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"
                  />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <AlertTriangle size={40} />
                  </div>
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center">
                <h2 className="mb-3 text-2xl font-bold text-zinc-900 dark:text-white">
                  Phát hiện đăng nhập mới!
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Tài khoản của bạn vừa được đăng nhập từ một thiết bị khác. Để bảo mật thông tin, phiên làm việc này sẽ bị kết thúc ngay lập tức.
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-8">
                <button
                  onClick={onConfirm}
                  className="group relative w-full overflow-hidden rounded-2xl bg-zinc-900 dark:bg-white px-6 py-4 font-semibold text-white dark:text-zinc-900 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <LogOut size={20} />
                    <span>Tôi đã hiểu & Đăng xuất</span>
                  </div>
                  <div className="absolute inset-0 translate-y-full bg-red-500 transition-transform group-hover:translate-y-0" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
