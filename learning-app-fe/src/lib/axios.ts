// src/lib/axios-client.ts
import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { refreshToken as refreshTokenApi } from "@/services/authService";

// ----- Axios public (không auth) -----
export const axiosPublic = axios.create({
  baseURL: "https://api.nibojapan.cloud/api/v1",
  timeout: 10000,
  headers: {
    Authorization: undefined,
  },
});

// ----- Axios client (cần auth) -----
export const axiosClient = axios.create({
  baseURL: "https://api.nibojapan.cloud/api/v1",
  timeout: 60000,
});

// ----- Axios client cho upload (timeout 10 phút) -----
export const axiosUpload = axios.create({
  baseURL: "https://api.nibojapan.cloud/api/v1",
  timeout: 600000,
});

// ----- Custom error -----
export class HttpClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpClientError";
  }
}

// ----- Helper decode JWT -----
const getTokenExpiration = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000;
  } catch {
    return 0;
  }
};

const setupRequestInterceptor = (instance: any) => {
  instance.interceptors.request.use(async (config: any) => {
    const { accessToken, refreshToken, logout, setTokens, user } = useAuthStore.getState();
    if (!accessToken) return config;

    const now = Date.now();
    const exp = getTokenExpiration(accessToken);

    if (!config.headers) {
      config.headers = axios.AxiosHeaders.from({});
    }

    if (exp - now < 60 * 1000 && refreshToken && user?.username) {
      try {
        const result = await refreshTokenApi({ username: user.username, refreshToken });
        setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
        config.headers.set("Authorization", `Bearer ${result.accessToken}`);
      } catch (err) {
        logout();
      }
    } else {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    // 🛡️ [SINGLE SESSION] Header
    if (typeof window !== "undefined") {
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        config.headers.set("X-Session-ID", sessionId);
      }
    }
    return config;
  });
};

const setupResponseInterceptor = (instance: any) => {
  instance.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
      if (error.response && error.response.status === 401) {
        const msg = error.response.data?.message || "";
        // Nếu lỗi do bị thiết bị khác đăng nhập
        if (msg.includes("Session invalidated")) {
          const { setKickedOut, logout } = useAuthStore.getState();
          console.warn("🛑 [AXIOS] Detect 401 single session error");
          
          // Clear session và hiện Modal đẹp
          localStorage.removeItem("sessionId"); 
          logout();
          setKickedOut(true);
        }
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors
setupRequestInterceptor(axiosClient);
setupRequestInterceptor(axiosUpload);
setupResponseInterceptor(axiosClient);
setupResponseInterceptor(axiosUpload);
