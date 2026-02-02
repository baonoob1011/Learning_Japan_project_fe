// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
  TIMEOUT: 10000, // 10 giây
} as const;

// API Endpoints (flat)
export const API_ENDPOINTS = {
  USER: {
    PROFILE: "/users/me",
    UPLOAD_AVATAR: "/users/upload-avatar",
    CHANGE_PASSWORD: "/users/change-password",
    ALL_USERS: "/admin/users",
  },
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
  FORGOT_PASSWORD: "/users/forgot-password",
  CONFIRM_FORGOT_PASSWORD: "/users/confirm-forgot-password",
  REGISTER: "/users/register",
  LOGIN: "/auth/login",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOG_OUT: "/auth/logout",
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
  VOCAB: {
    MARK_VOCAB: "/learning/vocab/mark",
    CREATE: "/vocab",
    GET_MY: "/vocab",
    GET_MY_VIDEO: (videoId: string) => `/vocab/my/video/${videoId}`,
    UPDATE_MEANING: "/vocab",
    DELETE: (surface: string) => `/vocab/${encodeURIComponent(surface)}`,
  },
} as const;

// Helper function để lấy full endpoint URL
export const getEndpoint = (endpointKey: keyof typeof API_ENDPOINTS) => {
  return `${API_CONFIG.BASE_URL}${API_ENDPOINTS[endpointKey]}`;
};
