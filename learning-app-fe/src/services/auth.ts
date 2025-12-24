import axios from "axios";
import { axiosClient, HttpClientError } from "@/lib/axios";
import { getEndpoint } from "@/config/api";
import { ApiResponse } from "./api-types";
import { useAuthStore } from "@/stores/authStore";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  accessToken: string;
  refreshToken: string;
}

export const login = async (data: LoginRequest): Promise<UserLoginResponse> => {
  try {
    const endpoint = getEndpoint("LOGIN");

    const response = await axiosClient.post<ApiResponse<UserLoginResponse>>(
      endpoint,
      data,
      { headers: { Authorization: undefined } }
    );

    const resData = response.data;

    if (!resData.success) {
      throw new Error(resData.message || "Đăng nhập thất bại");
    }

    const result = resData.result;

    // ✅ GỌI ACTION, KHÔNG GỌI set
    const { setTokens } = useAuthStore.getState();
    setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    // Gắn token cho axios
    axiosClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${result.accessToken}`;

    return result;
  } catch (error: unknown) {
    if (error instanceof HttpClientError) {
      throw new Error(error.message || "Đăng nhập thất bại");
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
