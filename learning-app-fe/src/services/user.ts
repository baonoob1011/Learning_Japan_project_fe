import axios from "axios";
import { axiosClient, HttpClientError } from "@/lib/axios";
import { getEndpoint } from "@/config/api";
import { ApiResponse } from "./api-types";

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export const register = async (
  data: RegisterRequest
): Promise<RegisterResult> => {
  try {
    const endpoint = getEndpoint("REGISTER");

    // Explicitly bỏ Authorization header
    const response = await axiosClient.post(endpoint, data, {
      headers: { Authorization: undefined },
    });

    return response.data.result;
  } catch (error: unknown) {
    // Check nếu error là instance của Error (có message)
    if (error instanceof Error) {
      // Custom client error
      if (error instanceof HttpClientError) {
        throw new Error(error.message || "Đăng ký thất bại");
      }

      // Axios error
      if (axios.isAxiosError(error)) {
        const msg =
          (error.response?.data as { message?: string })?.message ||
          error.message;
        throw new Error(msg);
      }

      // Lỗi khác có message
      throw new Error(error.message);
    }

    // fallback: unknown không có message
    throw new Error("Có lỗi xảy ra");
  }
};
