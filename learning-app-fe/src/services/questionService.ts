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
  passage?: PassageResponse
}
export interface CreateQuestionRequest {
  sectionId: string;
  type: string;
  questionText: string;
  options: string; // JSON string
  answer: string;
  imageUrl?: string;
  audioUrl?: string;
  sectionOrder: number;
}
export interface PassageResponse {
  id: string;
  title: string;
  content: string;
  passageOrder: string;
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
  updateQuestion(question: QuestionApiResponse): Promise<QuestionApiResponse> {
    return http.put<QuestionApiResponse>(API_ENDPOINTS.QUESTION.UPDATE(question.id), question);
  },
  getByExamId(examId: string): Promise<QuestionApiResponse[]> {
    return http.get<QuestionApiResponse[]>(API_ENDPOINTS.QUESTION.GET_BY_EXAM_ID(examId));
  },
  createQuestion(question: CreateQuestionRequest): Promise<QuestionApiResponse> {
    return http.post<QuestionApiResponse>(API_ENDPOINTS.QUESTION.CREATE, question);
  },
  /**
   * ✅ Xóa câu hỏi
   */
  delete(id: string): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.QUESTION.DELETE(id));
  },
};
