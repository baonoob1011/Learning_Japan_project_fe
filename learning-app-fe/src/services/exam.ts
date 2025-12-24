import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";
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
export interface StartExamRequest {
  examId: string;
}
export interface StartExamResponse {
  participantId: string;
  examId: string;
  examCode: string;
  duration: number;
  userId: string;
  completed: boolean;
  startedAt: string; // chuyển LocalDateTime thành string
}

export interface SubmitExamRequest {
  participantId: string;
  answers: {
    questionId: string;
    answer: string;
  }[];
}

export interface SubmitExamResponse {
  participantId: string;
  examId: string;
  examCode: string;
  aiReview?: string; // nếu backend trả về
  score: number;
  completed: boolean;
  startedAt: string; // LocalDateTime chuyển sang ISO string
  finishedAt: string;
}

export const examService = {
  async getAll(): Promise<ExamResponse[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      const res = await axiosClient.get<ApiResponse<ExamResponse[]>>(
        API_ENDPOINTS.EXAM.EXAM_VIEW_ALL,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }
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

  async startExam(request: StartExamRequest): Promise<StartExamResponse> {
    try {
      const { accessToken } = useAuthStore.getState();

      const res = await axiosClient.post<ApiResponse<StartExamResponse>>(
        API_ENDPOINTS.EXAM.EXAM_START,
        request,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Không thể bắt đầu bài thi");
      }

      return res.data.result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Lỗi không xác định khi bắt đầu bài thi");
    }
  },
  async submitExam(request: SubmitExamRequest): Promise<SubmitExamResponse> {
    try {
      const { accessToken } = useAuthStore.getState();

      const res = await axiosClient.post<ApiResponse<SubmitExamResponse>>(
        API_ENDPOINTS.EXAM.EXAM_SUBMIT,
        request,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Không thể submit bài thi");
      }

      return res.data.result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Lỗi không xác định khi submit bài thi");
    }
  },
};
