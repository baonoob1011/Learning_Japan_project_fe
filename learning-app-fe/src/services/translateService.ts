import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

export interface TranslateRequest {
  videoId?: string; // ID video liên quan (optional)
  text: string; // từ/câu cần dịch
  sourceLang: string; // "ja"
  targetLang: string; // "vi"
}

export interface TranslateResult {
  original: string;
  translated: string;
  reading?: string;
  romaji?: string;
  explain?: string;
  partOfSpeech?: string; // loại từ
  targetDefs?: string; // nghĩa ngôn ngữ đích
  audioUrl?: string; // đường dẫn audio
  videoId?: string;
}

// ✅ Cache để lưu kết quả dịch
const translateCache = new Map<string, TranslateResult>();

// ✅ Tạo cache key duy nhất cho mỗi từ
const createCacheKey = (
  text: string,
  sourceLang: string,
  targetLang: string
): string => {
  return `${text.trim().toLowerCase()}_${sourceLang}_${targetLang}`;
};

export const translateService = {
  /**
   * Dịch từ/câu với cache
   * - Nếu đã dịch rồi → trả về từ cache (không gọi API)
   * - Nếu chưa dịch → gọi API và lưu vào cache
   */
  async translate(payload: TranslateRequest): Promise<TranslateResult> {
    const { text, sourceLang, targetLang } = payload;

    // ✅ Kiểm tra cache trước
    const cacheKey = createCacheKey(text, sourceLang, targetLang);

    if (translateCache.has(cacheKey)) {
      console.log(`[Cache HIT] Lấy từ cache: "${text}"`);
      return translateCache.get(cacheKey)!;
    }

    console.log(`[Cache MISS] Gọi API dịch: "${text}"`);

    // ✅ Gọi API nếu chưa có trong cache
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

    const result = res.data.result;

    // ✅ Lưu vào cache
    translateCache.set(cacheKey, result);
    console.log(`[Cache SAVE] Đã lưu vào cache: "${text}"`);

    return result;
  },

  /**
   * Xóa cache cho 1 từ cụ thể
   */
  clearCache(
    text: string,
    sourceLang: string = "ja",
    targetLang: string = "vi"
  ): void {
    const cacheKey = createCacheKey(text, sourceLang, targetLang);
    translateCache.delete(cacheKey);
    console.log(`[Cache CLEAR] Đã xóa cache: "${text}"`);
  },

  /**
   * Xóa toàn bộ cache
   */
  clearAllCache(): void {
    const size = translateCache.size;
    translateCache.clear();
    console.log(`[Cache CLEAR ALL] Đã xóa ${size} items từ cache`);
  },

  /**
   * Lấy thông tin cache (để debug)
   */
  getCacheInfo(): { size: number; keys: string[] } {
    return {
      size: translateCache.size,
      keys: Array.from(translateCache.keys()),
    };
  },

  /**
   * Kiểm tra xem từ đã có trong cache chưa
   */
  hasInCache(
    text: string,
    sourceLang: string = "ja",
    targetLang: string = "vi"
  ): boolean {
    const cacheKey = createCacheKey(text, sourceLang, targetLang);
    return translateCache.has(cacheKey);
  },
};
