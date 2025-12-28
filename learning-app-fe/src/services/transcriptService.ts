import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

// interface frontend
export interface TranscriptDTO {
  id: string;
  text: string;
  startOffset: number; // ms
  endOffset: number; // ms
  createdAt: string; // ISO string
}

export interface YoutubeTranscriptResponse {
  id: string;
  videoId: string;
  title: string;
  urlVideo?: string;
  transcriptsDTOS: TranscriptDTO[];
}

// Service gọi API
export const youtubeService = {
  // Lấy transcript theo videoId
  async getTranscripts(videoId: string): Promise<YoutubeTranscriptResponse> {
    const { accessToken } = useAuthStore.getState();

    const res = await axiosClient.get<ApiResponse<YoutubeTranscriptResponse>>(
      `${API_ENDPOINTS.VIDEO.VIEW_BY_ID}/${videoId}`, // template string đúng
      {
        headers: { Authorization: accessToken ? `Bearer ${accessToken}` : "" },
      }
    );

    if (!res.data.success) throw new Error(res.data.message);

    // trả về đúng kiểu YoutubeTranscriptResponse
    return res.data.result;
  },
};
