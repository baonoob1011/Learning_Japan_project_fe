// src/services/exam.ts
import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";
import type { AxiosError } from "axios";

export interface SectionWithQuestionsResponse {
  id: string;
  examId: string;
  title: string;
  sectionDuration: number; // thêm field này
  sectionOrder: number;
  questions: {
    id: string;
    sectionOrder: number;
    questionType: string;
    questionText: string;
    options: string;
    answer: string;
    imageUrl: string;
    audioUrl: string;
    questionOrder: number;
  }[];
}

export interface ExamResponse {
  id: string;
  code: string;
  level: string;
  participant: number;
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
  startedAt: string; // ISO string
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
  aiReview?: string | null;

  totalScore: number; // điểm thi thực tế
  completed: boolean;
  answeredCount: number;
  totalQuestions: number;
  correctCount: number; // số câu đúng
  skippedCount: number; // số câu bỏ qua

  startedAt: string; // ISO string
  finishedAt: string; // ISO string

  answers: {
    questionId: string;
    questionText: string;
    questionType: string;
    optionsJson: string; // JSON string của các option
    correctAnswer: string;
    sectionOrder?: number; // order của section
    sectionTitle?: string; // title của section
    sectionDuration?: number; // thời gian section
    answer: string | null;
    isCorrect: boolean;
    score: number;
    questionOrder: number;
    explanation: string;
    imageUrl?: string;
    audioUrl?: string;
  }[];
}

export const examService = {
  async getSections(examId: string): Promise<SectionWithQuestionsResponse[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      const res = await axiosClient.get<
        ApiResponse<SectionWithQuestionsResponse[]>
      >(`/exams/sections/${examId}`, {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
        },
      });

      if (!res.data.success) {
        throw new Error(
          res.data.message || "Không lấy được sections của đề thi"
        );
      }

      return res.data.result;
    } catch (error: unknown) {
      const axiosErr = error as AxiosError<ApiResponse<unknown>>;
      if (axiosErr.response) {
        throw new Error(
          axiosErr.response.data?.message ||
          `Lỗi khi fetch sections, status ${axiosErr.response.status}`
        );
      } else if (axiosErr.request) {
        throw new Error("Không nhận được phản hồi từ server");
      } else if (error instanceof Error) {
        throw error;
      }
      throw new Error("Lỗi không xác định khi fetch sections");
    }
  },
  async getAll(): Promise<ExamResponse[]> {
    try {
      const { accessToken } = useAuthStore.getState();

      const res = await axiosClient.get<ApiResponse<ExamResponse[]>>(
        API_ENDPOINTS.EXAM.EXAM_VIEW_ALL,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Không lấy được danh sách đề thi");
      }

      return res.data.result;
    } catch (error: unknown) {
      if (error instanceof Error) return Promise.reject(error);
      return Promise.reject(
        new Error("Lỗi không xác định khi lấy danh sách đề thi")
      );
    }
  },

  async startExam(request: StartExamRequest): Promise<StartExamResponse> {
    try {
      const { accessToken } = useAuthStore.getState();

      console.log("[StartExam] Request:", request);

      const res = await axiosClient.post<ApiResponse<StartExamResponse>>(
        API_ENDPOINTS.EXAM.EXAM_START,
        request,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          },
        }
      );

      console.log("[StartExam] Response:", res.data);

      if (!res.data.success) {
        throw new Error(res.data.message || "Không thể bắt đầu bài thi");
      }

      return res.data.result;
    } catch (error: unknown) {
      const axiosErr = error as AxiosError<ApiResponse<unknown>>;
      if (axiosErr.response) {
        console.error("[StartExam] Server error:", axiosErr.response.data);
        throw new Error(
          axiosErr.response.data?.message || "Lỗi server khi bắt đầu bài thi"
        );
      } else if (axiosErr.request) {
        console.error("[StartExam] No response:", axiosErr.request);
        throw new Error("Không nhận được phản hồi từ server");
      } else if (error instanceof Error) {
        throw error;
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
            Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          },
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Không thể submit bài thi");
      }

      return res.data.result;
    } catch (error: unknown) {
      const axiosErr = error as AxiosError<ApiResponse<unknown>>;

      if (axiosErr.response) {
        throw new Error(
          axiosErr.response.data?.message ||
          `Lỗi submit bài thi, status ${axiosErr.response.status}`
        );
      } else if (axiosErr.request) {
        throw new Error("Không nhận được phản hồi từ server");
      } else if (error instanceof Error) {
        throw error;
      }
      throw new Error("Lỗi không xác định khi submit bài thi");
    }
  },
};
