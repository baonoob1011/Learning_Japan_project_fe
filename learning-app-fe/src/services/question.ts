// services/questionService.ts
import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

export interface ApiOption {
  label: string;
  text: string;
}

export interface QuestionApiResponse {
  id: string;
  sectionId: string;
  questionType: string;
  questionText: string;
  options: string; // JSON string
  answer: string;
  imageUrl?: string;
  audioUrl?: string;
  orderNum: number;
}

export const questionService = {
  async getAll(): Promise<QuestionApiResponse[]> {
    try {
      // Lấy accessToken từ store
      const { accessToken } = useAuthStore.getState();

      const res = await axiosClient.get<ApiResponse<QuestionApiResponse[]>>(
        API_ENDPOINTS.EXAM.QUESTION_VIEW_ALL,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Không lấy được danh sách câu hỏi");
      }

      return res.data.result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Lỗi không xác định khi lấy danh sách câu hỏi");
    }
  },
};
