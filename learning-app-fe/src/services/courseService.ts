// src/services/courseService.ts
import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";
import { JLPTLevel } from "@/enums/JLPTLevel";
import { LessonProcess } from "@/enums/LessonProcess";

/* ===================== TYPES ===================== */

export interface CreateCourseRequest {
  title: string;
  description: string;
  level: JLPTLevel;
  lessonProcess: LessonProcess;
  image?: File;
}

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  level: JLPTLevel;
  lessonProcess: LessonProcess;
  createdBy: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string; // ✅ thêm dòng này
}

/* ===================== SERVICE ===================== */

export const courseService = {
  create(request: CreateCourseRequest): Promise<string> {
    const formData = new FormData();

    formData.append("title", request.title);
    formData.append("description", request.description);
    formData.append("level", request.level);
    formData.append("lessonProcess", request.lessonProcess);

    if (request.image) {
      formData.append("image", request.image);
    }

    return http.post<string>(API_ENDPOINTS.COURSE.CREATE, formData);
  },

  getAll(): Promise<CourseResponse[]> {
    return http.get<CourseResponse[]>(API_ENDPOINTS.COURSE.GET_ALL);
  },

  getDetail(courseId: string): Promise<CourseResponse> {
    return http.get<CourseResponse>(API_ENDPOINTS.COURSE.GET_DETAIL(courseId));
  },

  toggleActive(courseId: string): Promise<void> {
    return http.put<void>(API_ENDPOINTS.COURSE.TOGGLE_ACTIVE(courseId));
  },
};
