import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

// ==================== TYPES ====================
export interface TranscriptDTO {
  id: string;
  text: string;
  startOffset: number; // ms
  endOffset: number; // ms
  createdAt: string; // ISO string
}

export interface YoutubeTranscriptResponse {
  id: string;
  videoId: string;
  title: string;
  urlVideo?: string;
  transcriptsDTOS: TranscriptDTO[];
}

// ==================== CACHE SYSTEM ====================
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface TranscriptCache {
  transcripts: Map<string, CacheItem<YoutubeTranscriptResponse>>;
  pendingRequests: Map<string, Promise<YoutubeTranscriptResponse>>;
}

const cache: TranscriptCache = {
  transcripts: new Map(),
  pendingRequests: new Map(),
};

// Cache TTL: 10 phút (transcripts ít thay đổi)
const CACHE_TTL = 10 * 60 * 1000;

// ==================== HELPERS ====================

/**
 * Kiểm tra cache còn hợp lệ không
 */
const isCacheValid = <T>(item: CacheItem<T> | undefined): boolean => {
  if (!item) return false;
  return Date.now() - item.timestamp < CACHE_TTL;
};

/**
 * Tạo headers một lần (tránh gọi getState() nhiều lần)
 */
const getHeaders = () => {
  const { accessToken } = useAuthStore.getState();
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
};

/**
 * Fetch API với error handling
 */
async function fetchTranscriptAPI(
  videoId: string
): Promise<YoutubeTranscriptResponse> {
  const res = await axiosClient.get<ApiResponse<YoutubeTranscriptResponse>>(
    `${API_ENDPOINTS.VIDEO.VIEW_BY_ID}/${videoId}`,
    { headers: getHeaders() }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to fetch transcripts");
  }

  return res.data.result;
}

// ==================== SERVICE ====================
export const transcriptService = {
  /**
   * ✅ Lấy transcript với các tối ưu:
   * 1. In-memory cache (10 phút TTL)
   * 2. Request deduplication (tránh gọi API trùng lặp)
   * 3. Prefetch support
   */
  async getTranscripts(
    videoId: string,
    forceRefresh: boolean = false
  ): Promise<YoutubeTranscriptResponse> {
    // ✅ 1. Check cache
    if (!forceRefresh) {
      const cachedItem = cache.transcripts.get(videoId);
      if (isCacheValid(cachedItem)) {
        console.log(`[Cache HIT] Transcript: ${videoId}`);
        return cachedItem!.data;
      }
    }

    // ✅ 2. Request deduplication: nếu đang fetch rồi, đợi kết quả
    const pendingRequest = cache.pendingRequests.get(videoId);
    if (pendingRequest) {
      console.log(`[Dedup] Waiting for existing request: ${videoId}`);
      return pendingRequest;
    }

    // ✅ 3. Fetch mới
    console.log(`[Cache MISS] Fetching transcript: ${videoId}`);
    const request = fetchTranscriptAPI(videoId)
      .then((data) => {
        // Lưu vào cache
        cache.transcripts.set(videoId, {
          data,
          timestamp: Date.now(),
        });
        return data;
      })
      .finally(() => {
        // Xóa khỏi pending requests
        cache.pendingRequests.delete(videoId);
      });

    // Lưu vào pending requests
    cache.pendingRequests.set(videoId, request);

    return request;
  },

  /**
   * ✅ Prefetch transcript (gọi trước khi cần)
   * Dùng khi user hover vào video card
   */
  async prefetchTranscript(videoId: string): Promise<void> {
    const cachedItem = cache.transcripts.get(videoId);
    if (!isCacheValid(cachedItem) && !cache.pendingRequests.has(videoId)) {
      try {
        await this.getTranscripts(videoId);
        console.log(`[Prefetch SUCCESS] Transcript: ${videoId}`);
      } catch (err) {
        console.warn(`[Prefetch FAILED] Transcript: ${videoId}`, err);
      }
    }
  },

  /**
   * ✅ Xóa cache cho 1 video
   */
  clearCache(videoId: string): void {
    cache.transcripts.delete(videoId);
    cache.pendingRequests.delete(videoId);
    console.log(`[Cache CLEAR] Transcript: ${videoId}`);
  },

  /**
   * ✅ Xóa toàn bộ cache
   */
  clearAllCache(): void {
    cache.transcripts.clear();
    cache.pendingRequests.clear();
    console.log("[Cache CLEAR ALL] All transcripts");
  },

  /**
   * ✅ Lấy thông tin cache (debug)
   */
  getCacheInfo() {
    return {
      cachedCount: cache.transcripts.size,
      cachedVideoIds: Array.from(cache.transcripts.keys()),
      pendingCount: cache.pendingRequests.size,
      pendingVideoIds: Array.from(cache.pendingRequests.keys()),
    };
  },

  /**
   * ✅ Batch prefetch nhiều videos (tối ưu cho list)
   * Dùng khi render video list
   */
  async prefetchMultiple(videoIds: string[]): Promise<void> {
    const promises = videoIds
      .slice(0, 5) // Chỉ prefetch 5 video đầu tiên
      .map((id) => this.prefetchTranscript(id));

    await Promise.allSettled(promises);
  },
};
