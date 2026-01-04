import { axiosClient, axiosUpload } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";
import { http } from "@/lib/http";

/* ===================== TYPES ===================== */

export interface UploadYoutubeVideoRequest {
  url: string;
  videoTag: VideoTag;
  level: JLPTLevel;
} /* ===================== ENUM ===================== */

export type JLPTLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type VideoTag =
  | "NEWS"
  | "BEGINNER"
  | "PODCAST"
  | "TECHNOLOGY"
  | "BUSINESS"
  | "TED"
  | "GRAMMAR"
  | "ANIME"
  | "SHORT_VIDEO"
  | "MOVIE"
  | "TRAVEL"
  | "CULTURE"
  | "FOOD"
  | "KIDS";

export interface YoutubeVideoSummary {
  id: string;
  title: string;
  urlVideo: string;
  duration: string;
  createdAt: string;
}

export interface YoutubeVideoDetail extends YoutubeVideoSummary {
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt?: string;
  updatedAt: string;
}

/* ===================== HELPERS ===================== */

const getHeaders = () => {
  const { accessToken } = useAuthStore.getState();
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
};

async function fetchAPI<T>(url: string): Promise<T> {
  try {
    const res = await axiosClient.get<ApiResponse<T>>(url, {
      headers: getHeaders(),
    });

    if (!res.data.success) {
      throw new Error(res.data.message || "API Error");
    }

    return res.data.result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? error.message);
    }
    throw error;
  }
}

/* ===================== SERVICE ===================== */

export const youtubeService = {
  /**
   * Upload video - sử dụng axiosUpload với timeout 10 phút
   */
  async uploadVideo(request: UploadYoutubeVideoRequest): Promise<void> {
    try {
      const res = await axiosUpload.post<ApiResponse<void>>(
        API_ENDPOINTS.VIDEO.UPLOAD,
        request,
        {
          headers: getHeaders(),
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Upload failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message ?? error.message);
      }
      throw error;
    }
  },
  /**
   * Lấy danh sách tất cả video
   * ❌ Không cache
   */
  async getAll(): Promise<YoutubeVideoSummary[]> {
    return fetchAPI<YoutubeVideoSummary[]>(API_ENDPOINTS.VIDEO.VIEW);
  },

  /**
   * Trigger API lấy chi tiết video
   * (Backend xử lý async, FE không cần data)
   */
  async getById(id: string): Promise<void> {
    await fetchAPI<void>(`${API_ENDPOINTS.VIDEO.VIEW}/${id}`);
    console.log(`[API CALLED] Video detail: ${id}`);
  },

  saveVideo(videoId: string): Promise<void> {
    return http.post<void>(API_ENDPOINTS.VIDEO.SAVE(videoId));
  },

  /**
   * Remove video đã save
   */
  removeSavedVideo(videoId: string): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.VIDEO.SAVE(videoId));
  },
  /**
   * ✅ NEW — Get video đã save của user hiện tại
   */ getMySavedVideos(): Promise<YoutubeVideoSummary[]> {
    return http.get(API_ENDPOINTS.VIDEO.MY_SAVED);
  },
};
