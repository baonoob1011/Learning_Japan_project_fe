import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

/* ===================== TYPES ===================== */

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
};
