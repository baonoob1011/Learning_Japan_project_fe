import axios from "axios";
import { axiosClient, HttpClientError } from "@/lib/axios";
import { getEndpoint } from "@/config/api";
import { ApiResponse } from "./api-types"; // <-- dùng từ file api-types
import { API_ENDPOINTS } from "@/config/api";
import { http } from "@/lib/http";
import { Upload } from "lucide-react";


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


export interface UserProfileResponse {
  fullName: string;
  email: string;
  createdAt: string;
}

export const userService = {
  getProfile(): Promise<UserProfileResponse> {
    return http.get(API_ENDPOINTS.USER.PROFILE); // token đi kèm trong header
  },

  uploadAvatar(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    return http.put(API_ENDPOINTS.USER.UPLOAD_AVATAR, formData);
  },

  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return http.post(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }
};

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
