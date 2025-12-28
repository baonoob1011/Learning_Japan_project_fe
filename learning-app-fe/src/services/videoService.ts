import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

export interface YoutubeVideoSummary {
  id: string;
  title: string;
  urlVideo: string;
  duration: string;
  createdAt: string;
}

export interface YoutubeVideoDetail extends YoutubeVideoSummary {
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Cache với TTL (Time To Live)
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache = {
  videos: null as CacheItem<YoutubeVideoSummary[]> | null,
  details: new Map<string, CacheItem<YoutubeVideoDetail>>(),
};

const CACHE_TTL = 5 * 60 * 1000; // 5 phút

// ✅ Helper: Kiểm tra cache còn hợp lệ không (chấp nhận cả null và undefined)
const isCacheValid = <T>(item: CacheItem<T> | null | undefined): boolean => {
  if (!item) return false;
  return Date.now() - item.timestamp < CACHE_TTL;
};

// ✅ Helper: Tạo headers (DRY - Don't Repeat Yourself)
const getHeaders = () => {
  const { accessToken } = useAuthStore.getState();
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
};

// ✅ Helper: Generic API caller với error handling
async function fetchAPI<T>(url: string): Promise<T> {
  const res = await axiosClient.get<ApiResponse<T>>(url, {
    headers: getHeaders(),
  });

  if (!res.data.success) {
    throw new Error(res.data.message || "API request failed");
  }

  return res.data.result;
}

export const youtubeService = {
  /**
   * Lấy danh sách tất cả video
   * - Cache 5 phút
   * - Return từ cache nếu còn valid
   */
  async getAll(forceRefresh: boolean = false): Promise<YoutubeVideoSummary[]> {
    // ✅ Check cache
    if (!forceRefresh && isCacheValid(cache.videos)) {
      console.log("[Cache HIT] Videos list");
      return cache.videos!.data;
    }

    console.log("[Cache MISS] Fetching videos list");
    const data = await fetchAPI<YoutubeVideoSummary[]>(
      API_ENDPOINTS.VIDEO.VIEW
    );

    // ✅ Save to cache
    cache.videos = {
      data,
      timestamp: Date.now(),
    };

    return data;
  },

  /**
   * Lấy chi tiết 1 video
   * - Cache 5 phút per video ID
   * - Return từ cache nếu còn valid
  //  */
  // async getById(
  //   id: string,
  //   forceRefresh: boolean = false
  // ): Promise<YoutubeVideoDetail> {
  //   // ✅ Check cache
  //   const cachedItem = cache.details.get(id);
  //   if (!forceRefresh && isCacheValid(cachedItem)) {
  //     console.log(`[Cache HIT] Video detail: ${id}`);
  //     return cachedItem!.data;
  //   }

  //   console.log(`[Cache MISS] Fetching video detail: ${id}`);
  //   const data = await fetchAPI<YoutubeVideoDetail>(
  //     `${API_ENDPOINTS.VIDEO.VIEW}/${id}`
  //   );

  //   // ✅ Save to cache
  //   cache.details.set(id, {
  //     data,
  //     timestamp: Date.now(),
  //   });

  //   return data;
  // },
  async getById(id: string, forceRefresh: boolean = false): Promise<void> {
    // Chỉ trigger API, không dùng dữ liệu trả về
    await fetchAPI<void>(`${API_ENDPOINTS.VIDEO.VIEW}/${id}`);
    console.log(`[Trigger] Video detail API called: ${id}`);
  },
  /**
   * Xóa cache cho 1 video cụ thể
   */
  clearVideoCache(id: string): void {
    cache.details.delete(id);
    console.log(`[Cache CLEAR] Video ${id}`);
  },

  /**
   * Xóa cache danh sách videos
   */
  clearListCache(): void {
    cache.videos = null;
    console.log("[Cache CLEAR] Videos list");
  },

  /**
   * Xóa toàn bộ cache
   */
  clearAllCache(): void {
    cache.videos = null;
    cache.details.clear();
    console.log("[Cache CLEAR ALL] All youtube data");
  },

  /**
   * Lấy thông tin cache (để debug)
   */
  getCacheInfo() {
    return {
      videosListCached: cache.videos !== null,
      videosListAge: cache.videos ? Date.now() - cache.videos.timestamp : null,
      detailsCached: cache.details.size,
      detailsIds: Array.from(cache.details.keys()),
    };
  },

  /**
   * Prefetch video details (tải trước cho UX tốt hơn)
   * Gọi hàm này khi user hover vào video card
  //  */
  // async prefetchVideo(id: string): Promise<void> {
  //   // Chỉ prefetch nếu chưa có trong cache
  //   if (!cache.details.has(id)) {
  //     try {
  //       await this.getById(id);
  //       console.log(`[Prefetch] Video ${id} loaded`);
  //     } catch (err) {
  //       console.warn(`[Prefetch FAILED] Video ${id}`, err);
  //     }
  //   }
  // },
};
