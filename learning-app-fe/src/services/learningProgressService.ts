import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

/** ===== Response mapping từ BE ===== */
export interface LevelProgressDto {
  level: string;
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  averageScore?: number;
  accuracy: number;
  lastExamAt?: string; // LocalDateTime → ISO string
}

export interface DailyProgressDto {
  date: string; // "2025-12-26"
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  accuracy: number; // %
}

export interface UserLearningDashboardResponse {
  userId: string;

  // Tổng quan
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  accuracy: number; // %

  lastLevel?: string;
  lastExamAt?: string;

  // Theo level
  levels: LevelProgressDto[];
}

export const learningProgressService = {
  async view(): Promise<UserLearningDashboardResponse> {
    try {
      // Lấy accessToken từ store
      const { accessToken } = useAuthStore.getState();

      const res = await axiosClient.get<
        ApiResponse<UserLearningDashboardResponse>
      >(API_ENDPOINTS.LEARNING_PROGRESS.PROGRESS_VIEW, {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Không lấy được learning progress");
      }

      return res.data.result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Lỗi không xác định khi lấy learning progress");
    }
  },
  // Daily progress
  async getDailyProgress(days: number = 7): Promise<DailyProgressDto[]> {
    try {
      const { accessToken } = useAuthStore.getState();
      const res = await axiosClient.get<ApiResponse<DailyProgressDto[]>>(
        `${API_ENDPOINTS.LEARNING_PROGRESS.PROGRESS_RESULT_DAILY}/daily?days=${days}`,
        {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        }
      );
      if (!res.data.success) {
        throw new Error(res.data.message || "Không lấy được daily progress");
      }
      return res.data.result;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      throw new Error("Lỗi không xác định khi lấy daily progress");
    }
  },
};
