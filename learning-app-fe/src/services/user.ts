import axios from "axios";
import { axiosClient, HttpClientError } from "@/lib/axios";
import { getEndpoint } from "@/config/api";
import { ApiResponse } from "./api-types"; // <-- dùng từ file api-types

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

    // Gọi API, kiểu ApiResponse<RegisterResult>
    const response = await axiosClient.post<ApiResponse<RegisterResult>>(
      endpoint,
      data,
      { headers: { Authorization: undefined } }
    );

    const resData = response.data;

    // Check success từ backend
    if (!resData.success) {
      throw new Error(resData.message || "Đăng ký thất bại");
    }

    return resData.result;
  } catch (error: unknown) {
    // Xử lý lỗi
    if (error instanceof HttpClientError) {
      throw new Error(error.message || "Đăng ký thất bại");
    }

    if (axios.isAxiosError(error)) {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        error.message;
      throw new Error(msg);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Có lỗi xảy ra");
  }
};
