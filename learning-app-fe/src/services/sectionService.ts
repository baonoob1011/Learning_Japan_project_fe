import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";
import { LessonLevel } from "@/enums/LessonLevel";

/* ===================== TYPES ===================== */

export interface CreateSectionRequest {
  courseId: string;
  title: string;
  lessonLevel: LessonLevel;
}

export interface SectionResponse {
  id: string;
  title: string;
  lessonLevel: LessonLevel;
  createdAt: string;
}
export interface UpdateSectionRequest {
  title?: string;
  lessonLevel?: LessonLevel;
}

/* ===================== SERVICE ===================== */

export const sectionService = {
  /**
   * ✅ Tạo section
   */
  create(request: CreateSectionRequest): Promise<string> {
    return http.post<string>(API_ENDPOINTS.SECTION.CREATE, request);
  },
  /**
   * ✅ Cập nhật section (partial)
   */
  update(
    sectionId: string,
    request: UpdateSectionRequest
  ): Promise<string> {
    return http.put<string>(
      API_ENDPOINTS.SECTION.UPDATE(sectionId),
      request
    );
  },
  /**
   * ✅ Lấy danh sách section theo course
   */
  getByCourse(courseId: string): Promise<SectionResponse[]> {
    return http.get<SectionResponse[]>(
      API_ENDPOINTS.SECTION.GET_BY_COURSE(courseId)
    );
  },

  /**
   * ✅ Lấy chi tiết section
   */
  getDetail(sectionId: string): Promise<SectionResponse> {
    return http.get<SectionResponse>(
      API_ENDPOINTS.SECTION.GET_DETAIL(sectionId)
    );
  },

  /**
   * ✅ Xóa section
   */
  delete(sectionId: string): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.SECTION.DELETE(sectionId));
  },
};
