import { axiosUpload } from "@/lib/axios";
import { API_ENDPOINTS } from "@/config/api";

export type S3FolderType = "images" | "audios" | "videos";

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
};