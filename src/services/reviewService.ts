import { API_ENDPOINTS } from "@/config/api";
import { LearningStatus } from "@/enums/LearningStatus";
import { http } from "@/lib/http";

export type ReviewQueueType = "NEW" | "DUE_TODAY" | "OVERDUE";
export type ReviewGrade = "AGAIN" | "HARD" | "GOOD" | "EASY";

export interface ReviewWordItem {
  wordProgressId: string;
  vocabId: string;
  word: string;
  meaning: string;
  type: ReviewQueueType;
  status: LearningStatus;
  lapseCount: number;
  intervalDays: number;
  nextReviewAt: string;
  completed: boolean;
}

export interface TodayReviewSummary {
  newCount: number;
  dueCount: number;
  overdueCount: number;
  todayQueueCount: number;
}

export interface TodayReviewResponse {
  sessionId: string;
  summary: TodayReviewSummary;
  todayQueue: ReviewWordItem[];
  recoveryMessage?: string | null;
}

export interface GradeReviewResponse {
  wordProgressId: string;
  status: LearningStatus;
  intervalDays: number;
  easeFactor: number;
  lapseCount: number;
  successCount: number;
  nextReviewAt: string;
}

export const reviewService = {
  getToday(): Promise<TodayReviewResponse> {
    return http.get<TodayReviewResponse>(API_ENDPOINTS.REVIEW.TODAY);
  },

  grade(wordProgressId: string, grade: ReviewGrade): Promise<GradeReviewResponse> {
    return http.post<GradeReviewResponse>(API_ENDPOINTS.REVIEW.GRADE(wordProgressId), { grade });
  },

  getWordStats(): Promise<{ newCount: number; dueCount: number; overdueCount: number; total: number }> {
    return http.get<{ newCount: number; dueCount: number; overdueCount: number; total: number }>(
      API_ENDPOINTS.WORDS.STATS
    );
  },
};

