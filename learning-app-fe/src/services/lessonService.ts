import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";
import { LessonLevel } from "@/enums/LessonLevel";

export interface CreateLessonRequest {
  sectionId: string;
  title: string;
  lessonLevel: LessonLevel;
  lessonOrder: number;
}

export interface LessonResponse {
  id: string;
  title: string;
  lessonLevel: LessonLevel;
  lessonOrder: number;
  createdAt: string;
}

/* ===================== SERVICE ===================== */

export const lessonService = {
  /**
   * ✅ Create lesson
   */
  create(request: CreateLessonRequest): Promise<string> {
    return http.post<string>(API_ENDPOINTS.LESSON.CREATE, request);
  },

  /**
   * ✅ Get lessons by section
   */
  getBySection(sectionId: string): Promise<LessonResponse[]> {
    return http.get<LessonResponse[]>(
      API_ENDPOINTS.LESSON.GET_BY_SECTION(sectionId)
    );
  },

  /**
   * ✅ Get lesson detail
   */
  getDetail(lessonId: string): Promise<LessonResponse> {
    return http.get<LessonResponse>(API_ENDPOINTS.LESSON.GET_DETAIL(lessonId));
  },

  /**
   * ✅ Delete lesson
   */
  delete(lessonId: string): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.LESSON.DELETE(lessonId));
  },
};
