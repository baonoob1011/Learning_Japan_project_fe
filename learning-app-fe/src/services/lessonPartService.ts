import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";

/* ===================== SERVICE ===================== */
export interface CreateLessonPartRequest {
  lessonId: string;
  title: string; // Ví dụ: Từ vựng
  partOrder: number;
}

export interface LessonPartResponse {
  id: string;
  lessonPartType: string;
  videoUrl: string;
  title: string;
  duration: string;
  partOrder: number;
}

export const lessonPartService = {
  /**
   * ✅ Create lesson part
   */
  create(request: CreateLessonPartRequest): Promise<string> {
    return http.post<string>(API_ENDPOINTS.LESSON_PART.CREATE, request);
  },

  /**
   * ✅ Get lesson parts by lesson
   */
  getByLesson(lessonId: string): Promise<LessonPartResponse[]> {
    return http.get<LessonPartResponse[]>(
      API_ENDPOINTS.LESSON_PART.GET_BY_LESSON(lessonId)
    );
  },

  /**
   * ✅ Get detail
   */
  getDetail(id: string): Promise<LessonPartResponse> {
    return http.get<LessonPartResponse>(
      API_ENDPOINTS.LESSON_PART.GET_DETAIL(id)
    );
  },

  /**
   * ✅ Delete
   */
  delete(id: string): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.LESSON_PART.DELETE(id));
  },
};
