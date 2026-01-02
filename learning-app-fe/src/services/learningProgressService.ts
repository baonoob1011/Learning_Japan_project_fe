import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

/* ==================== TYPES ==================== */

export interface LevelProgressDto {
  level: string;
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  averageScore?: number;
  accuracy: number;
  lastExamAt?: string;
}

export interface DailyProgressDto {
  date: string;
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  accuracy: number;
}

export interface UserLearningDashboardResponse {
  userId: string;
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  accuracy: number;
  lastLevel?: string;
  lastExamAt?: string;
  levels: LevelProgressDto[];
}

/* ==================== HELPERS ==================== */

const getHeaders = () => {
  const { accessToken } = useAuthStore.getState();
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
};

async function fetchAPI<T>(url: string): Promise<T> {
  const res = await axiosClient.get<ApiResponse<T>>(url, {
    headers: getHeaders(),
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "API Error");
  }

  return res.data.result;
}

/* ==================== SERVICE ==================== */

export const learningProgressService = {
  /**
   * Lấy dashboard học tập
   * ❌ Không cache
   */
  async view(): Promise<UserLearningDashboardResponse> {
    return fetchAPI<UserLearningDashboardResponse>(
      API_ENDPOINTS.LEARNING_PROGRESS.PROGRESS_VIEW
    );
  },

  /**
   * Lấy daily progress
   * ❌ Không cache
   */
  async getDailyProgress(days: number = 7): Promise<DailyProgressDto[]> {
    return fetchAPI<DailyProgressDto[]>(
      `${API_ENDPOINTS.LEARNING_PROGRESS.PROGRESS_RESULT_DAILY}/daily?days=${days}`
    );
  },
};
