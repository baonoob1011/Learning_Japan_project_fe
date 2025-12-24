import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";

export interface ExamResponse {
  id: string;
  code: string;
  level: string;
  duration: number;
  numSections: number;
  numQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export const examService = {
  async getAll(): Promise<ExamResponse[]> {
    try {
      const res = await axiosClient.get<ApiResponse<ExamResponse[]>>(
        API_ENDPOINTS.EXAM.EXAM_VIEW_ALL
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Không lấy được danh sách đề thi");
      }

      return res.data.result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Lỗi không xác định khi lấy danh sách đề thi");
    }
  },
};
