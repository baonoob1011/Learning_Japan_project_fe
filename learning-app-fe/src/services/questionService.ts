// services/questionService.ts
import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";

export interface ApiOption {
  label: string;
  text: string;
}

export interface QuestionApiResponse {
  id: string;
  sectionOrder: number;
  questionType: string;
  questionText: string;
  options: string; // JSON string
  answer: string;
  imageUrl?: string;
  audioUrl?: string;
  questionOrder: number;
}

export const questionService = {
  /**
   * ✅ Lấy danh sách câu hỏi
   */
  getAll(): Promise<QuestionApiResponse[]> {
    return http.get<QuestionApiResponse[]>(API_ENDPOINTS.QUESTION.GET_ALL);
  },
  /**
   * ✅ Lấy danh sách câu hỏi theo examId
   */
  getByExamId(examId: string): Promise<QuestionApiResponse[]> {
    return http.get<QuestionApiResponse[]>(API_ENDPOINTS.QUESTION.GET_BY_EXAM_ID(examId));
  },

  /**
   * ✅ Xóa câu hỏi
   */
  delete(id: string): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.QUESTION.DELETE(id));
  },
};
