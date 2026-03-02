import { axiosUpload } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export type S3FolderType = "images" | "audios" | "videos" | "exam";

export const s3Service = {
    upload: async (file: File, type: S3FolderType) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        return axiosUpload.post(API_ENDPOINTS.S3.UPLOAD, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    uploadExam: async (file: File, onProgress?: (pct: number) => void) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "exam"); // Default type is exam

        return axiosUpload.post(API_ENDPOINTS.S3.UPLOAD, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (evt) => {
                if (onProgress && evt.total) {
                    onProgress(Math.round((evt.loaded / evt.total) * 100));
                }
            },
        });
    },
};