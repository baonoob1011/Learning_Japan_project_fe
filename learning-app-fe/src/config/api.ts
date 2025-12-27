// API Configuration
export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
  TIMEOUT: 10000, // 10 giây
} as const;

// API Endpoints (flat)
export const API_ENDPOINTS = {
  REGISTER: "/users/register",
  LOGIN: "/auth/login",
  REFRESH_TOKEN: "/auth/refresh-token",
  LOG_OUT: "/auth/logout",
  VIDEO: {
    VIEW: "/youtube",
    VIEW_BY_ID: "/transcripts",
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
} as const;

// Helper function để lấy full endpoint URL
export const getEndpoint = (endpointKey: keyof typeof API_ENDPOINTS) => {
  return `${API_CONFIG.BASE_URL}${API_ENDPOINTS[endpointKey]}`;
};
