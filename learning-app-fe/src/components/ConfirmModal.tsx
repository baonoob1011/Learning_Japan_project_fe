import React from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    isLoading?: boolean;
    isDark: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    isDanger = true,
    isLoading = false,
    isDark,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div
                className={`relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl transition-all transform animate-in zoom-in-95 duration-200 ${isDark ? "bg-gray-900 border border-gray-800" : "bg-white"
                    }`}
            >
                {/* Header/Banner */}
                <div className={`h-2 w-full ${isDanger ? "bg-red-500" : "bg-cyan-500"}`} />

                <div className="p-8">
                    {/* Icon & Close */}
                    <div className="flex items-start justify-between mb-6">
                        <div
                            className={`p-3 rounded-2xl ${isDanger
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-cyan-500/10 text-cyan-500"
                                }`}
                        >
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-gray-800 text-gray-500" : "hover:bg-gray-100 text-gray-400"
                                }`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <h3
                        className={`text-xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"
                            }`}
                    >
                        {title}
                    </h3>
                    <p
                        className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                    >
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className={`flex-1 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all ${isDark
                                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95"
                                }`}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white transition-all shadow-lg active:scale-95 ${isDanger
                                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                                    : "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/20"
                                } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
