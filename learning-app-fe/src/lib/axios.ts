// src/lib/axios-client.ts
import axios from "axios";

// ✅ Axios cho request public (không gắn Authorization)
export const axiosPublic = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
  headers: {
    // Explicit không gửi Authorization
    Authorization: undefined,
  },
});

// ✅ Axios cho request cần auth
export const axiosClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1",
  timeout: 10000,
  // Nếu bạn có JWT, sẽ attach token ở đây
  // headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export class HttpClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpClientError";
  }
}
