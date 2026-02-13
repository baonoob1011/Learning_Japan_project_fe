// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
  TIMEOUT: 10000, // 10 giây
} as const;

// API Endpoints (flat)
// API Endpoints (flat)
export const API_ENDPOINTS = {
  USER: {
    PROFILE: "/users/me",
    UPLOAD_AVATAR: "/users/upload-avatar",
    CHANGE_PASSWORD: "/users/change-password",
    ALL_USERS: "/admin/users",
    SEARCH: "/users/search", // ✅ thêm dòng này
  },

  LESSON_PART_PROGRESS: {
    UPDATE: "/lesson-part-progress",
    GET: (lessonPartId: string) => `/lesson-part-progress/${lessonPartId}`,
  },

  CHAT_ROOM: {
    MY_ROOMS: "/chat-room/my-rooms",
    CREATE_PRIVATE: "/chat-room/private",
    GET_BY_ID: (roomId: string) => `/chat-room/${roomId}`,
    MESSAGES: (roomId: string, page: number, size: number) =>
      `/chat-room/${roomId}/messages?page=${page}&size=${size}`,
  },
  /* ===================== COURSE ===================== */
  COURSE: {
    CREATE: "/course",
    GET_ALL: "/course",
    GET_DETAIL: (courseId: string) => `/course/${courseId}`,
    TOGGLE_ACTIVE: (courseId: string) => `/course/${courseId}/active`,
  },

  /* ===================== SECTION ===================== */
  SECTION: {
    CREATE: "/section",
    GET_BY_COURSE: (courseId: string) => `/section/course/${courseId}`,
    GET_DETAIL: (sectionId: string) => `/section/${sectionId}`,
    DELETE: (sectionId: string) => `/section/${sectionId}`,
  },
  // config/api.ts

  LESSON_DOCUMENT: {
    CREATE: "/lesson-document",
    GET_BY_LESSON: (lessonId: string) => `/lesson-document/lesson/${lessonId}`,
    GET_DETAIL: (id: string) => `/lesson-document/${id}`,
    DELETE: (id: string) => `/lesson-document/${id}`,
  },

  /* ===================== LESSON ===================== */
  LESSON: {
    CREATE: "/lesson",
    GET_BY_SECTION: (sectionId: string) => `/lesson/section/${sectionId}`,
    GET_DETAIL: (lessonId: string) => `/lesson/${lessonId}`,
    DELETE: (lessonId: string) => `/lesson/${lessonId}`,
  },

  /* ===================== SECTION DOCUMENT ===================== */
  SECTION_DOCUMENT: {
    CREATE: "/section-document",
    GET_BY_SECTION: (sectionId: string) =>
      `/section-document/section/${sectionId}`,
  },
  LESSON_PART: {
    CREATE: "/lesson-part",
    GET_BY_LESSON: (lessonId: string) => `/lesson-part/lesson/${lessonId}`,
    GET_DETAIL: (id: string) => `/lesson-part/${id}`,
    DELETE: (id: string) => `/lesson-part/${id}`,
  },

  /* ===================== ADMIN ===================== */
  ADMIN: {
    PROGRESS_VIEW: "/admin/learning-progress/:userId",
    PROGRESS_RESULT_DAILY: "/admin/learning-progress/:userId/daily",
    ALL_USERS_MANAGER: "/admin/users/manager",
    BAN_USER: (email: string) => `/admin/users/ban/${email}`,
    UNBAN_USER: (email: string) => `/admin/users/unban/${email}`,
    DELETE_USER: `/admin/users/delete-account`,
    DELETE_USERS: `/admin/users/delete-accounts`,
    USER_STATISTICS: "/admin/users/stats",
  },

  NOTIFICATION: {
    GET_MY: "/notifications",
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: "/notifications/read-all",
    DELETE: (id: string) => `/notifications/${id}`,
  },

  FORGOT_PASSWORD: "/users/forgot-password",
  CONFIRM_FORGOT_PASSWORD: "/users/confirm-forgot-password",
  REGISTER: "/users/register",
  LOGIN: "/auth/login",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOG_OUT: "/auth/logout",

  /* ===================== VIDEO ===================== */
  VIDEO: {
    GET_ALL_PROGRESS: "/video-tracking",
    UPLOAD: "/youtube/upload",
    TRACK_PROGRESS: "/video-tracking",
    SAVE: (videoId: string) => `/youtube/${videoId}`,
    VIEW: "/youtube",
    VIEW_BY_ID: "/transcripts",
    MY_SAVED: "/youtube/me",
    SEARCH: "/videos/search",
    VIEW_BY_VOCAB: "/youtube/vocab",
  },

  LEARNING_PROGRESS: {
    PROGRESS_VIEW: "/learning-progress",
    PROGRESS_RESULT_DAILY: "/learning-progress",
  },

  EXAM: {
    EXAM_VIEW_ALL: "/exams",
    QUESTION_LISTEN: "/questions/listen",
    EXAM_SUBMIT: "exams/submit",
    EXAM_START: "/exams/start",
    QUESTION_VIEW_ALL: "/questions",
  },

  TRANSLATE: {
    CREATE: "/translates",
  },

  PRONUNCIATION: {
    SUBMIT: "/pronunciation/submit",
    RESULT: "/pronunciation/result",
  },

  AI: {
    CHAT: "/ai/chat",
    REALTIME_TOKEN: "/ai/realtime-token",
  },

  VOCAB: {
    MARK_VOCAB: "/learning/vocab/mark",
    CREATE: "/vocab",
    GET_MY: "/vocab",
    GET_MY_VIDEO: (videoId: string) => `/vocab/my/video/${videoId}`,
    UPDATE_MEANING: "/vocab",
    DELETE: (surface: string) => `/vocab/${encodeURIComponent(surface)}`,
    GET_STATUS: (vocabId: string) => `/vocab/${vocabId}/status`,
  },
} as const;

// Helper function để lấy full endpoint URL
export const getEndpoint = (endpointKey: keyof typeof API_ENDPOINTS) => {
  return `${API_CONFIG.BASE_URL}${API_ENDPOINTS[endpointKey]}`;
};
