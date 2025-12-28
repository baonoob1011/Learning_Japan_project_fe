import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

export interface TranslateRequest {
  text: string;
  sourceLang: string; // "ja"
  targetLang: string; // "vi"
}

export interface TranslateResult {
  original: string;
  translated: string;
}

export const translateService = {
  async translate(payload: TranslateRequest): Promise<TranslateResult> {
    const { accessToken } = useAuthStore.getState();

    const res = await axiosClient.post<ApiResponse<TranslateResult>>(
      API_ENDPOINTS.TRANSLATE.CREATE,
      payload,
      {
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : "",
        },
      }
    );

    if (!res.data.success) {
      throw new Error(res.data.message);
    }

    return res.data.result;
  },
};
