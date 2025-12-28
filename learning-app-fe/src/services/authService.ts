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

export interface RefreshTokenRequest {
  username: string;
  refreshToken: string;
}

// ----- Login API -----
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

    const { setTokens } = useAuthStore.getState();
    setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    axiosClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${result.accessToken}`;

    return result;
  } catch (error: unknown) {
    if (error instanceof HttpClientError)
      throw new Error(error.message || "Đăng nhập thất bại");
    if (axios.isAxiosError(error)) {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        error.message;
      throw new Error(msg);
    }
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Có lỗi xảy ra");
  }
};

// ----- Refresh Token API -----
export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const endpoint = getEndpoint("REFRESH_TOKEN");

    const response = await axiosClient.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >(endpoint, data);

    const resData = response.data;
    if (!resData.success)
      throw new Error(resData.message || "Làm mới token thất bại");

    const result = resData.result;

    const { setTokens } = useAuthStore.getState();
    setTokens({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    axiosClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${result.accessToken}`;

    return result;
  } catch (error: unknown) {
    if (error instanceof HttpClientError)
      throw new Error(error.message || "Làm mới token thất bại");
    if (axios.isAxiosError(error)) {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        error.message;
      throw new Error(msg);
    }
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Có lỗi xảy ra");
  }
};

// ----- Logout API -----
export const logout = async (): Promise<void> => {
  try {
    const { accessToken, logout } = useAuthStore.getState();

    if (!accessToken) return;

    const endpoint = getEndpoint("LOG_OUT");

    await axiosClient.post<ApiResponse<null>>(endpoint, { accessToken });

    // Dùng logout action trong store để xóa token
    logout();
    delete axiosClient.defaults.headers.common["Authorization"];
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        error.message;
      throw new Error(msg);
    }
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Có lỗi xảy ra khi đăng xuất");
  }
};
