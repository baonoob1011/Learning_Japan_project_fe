import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

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
  duration: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const youtubeService = {
  async getAll(): Promise<YoutubeVideoSummary[]> {
    const { accessToken } = useAuthStore.getState();
    const res = await axiosClient.get<ApiResponse<YoutubeVideoSummary[]>>(
      API_ENDPOINTS.VIDEO.VIEW,
      {
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
      }
    );
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.result;
  },

  async getById(id: string): Promise<YoutubeVideoDetail> {
    const { accessToken } = useAuthStore.getState();
    const res = await axiosClient.get<ApiResponse<YoutubeVideoDetail>>(
      `${API_ENDPOINTS.VIDEO.VIEW}/${id}`,
      {
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
      }
    );
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.result;
  },
};
