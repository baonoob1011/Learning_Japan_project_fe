// src/services/vocabService.ts
import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

// request body
export interface SaveVocabRequest {
  surface: string;
}

// helper headers
const getHeaders = () => {
  const { accessToken } = useAuthStore.getState();
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
};

// generic POST (void)
async function postAPI<T>(url: string, body?: unknown): Promise<T> {
  const res = await axiosClient.post<ApiResponse<T>>(url, body, {
    headers: getHeaders(),
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "API request failed");
  }

  return res.data.result;
}

export const vocabService = {
  /**
   * Lưu từ vựng cho user hiện tại
   * - API trả void (result = null)
   */
  async save(surface: string): Promise<void> {
    await postAPI<void>(API_ENDPOINTS.VOCAB.CREATE, {
      surface,
    });

    console.log(`[Vocab Saved] ${surface}`);
  },
};
