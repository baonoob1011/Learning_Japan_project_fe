import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";
import { API_ENDPOINTS } from "@/config/api";
import { useAuthStore } from "@/stores/authStore";

// ==================== TYPES ====================
export interface LevelProgressDto {
  level: string;
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  averageScore?: number;
  accuracy: number;
  lastExamAt?: string;
}

export interface DailyProgressDto {
  date: string;
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  accuracy: number;
}

export interface UserLearningDashboardResponse {
  userId: string;
  totalExamsTaken: number;
  totalQuestionsDone: number;
  correctQuestions: number;
  accuracy: number;
  lastLevel?: string;
  lastExamAt?: string;
  levels: LevelProgressDto[];
}

// ==================== CACHE SYSTEM ====================
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface CacheStorage {
  dashboard: CacheItem<UserLearningDashboardResponse> | null;
  dailyProgress: Map<number, CacheItem<DailyProgressDto[]>>;
  pendingRequests: {
    dashboard: Promise<UserLearningDashboardResponse> | null;
    dailyProgress: Map<number, Promise<DailyProgressDto[]>>;
  };
}

const cache: CacheStorage = {
  dashboard: null,
  dailyProgress: new Map(),
  pendingRequests: {
    dashboard: null,
    dailyProgress: new Map(),
  },
};

// Cache TTL
const CACHE_TTL = {
  DASHBOARD: 5 * 60 * 1000, // 5 phút (data thay đổi khi làm bài)
  DAILY: 10 * 60 * 1000, // 10 phút (data ít thay đổi hơn)
};

// ==================== HELPERS ====================

/**
 * Kiểm tra cache còn hợp lệ không
 */
const isCacheValid = <T>(
  item: CacheItem<T> | null | undefined,
  ttl: number
): boolean => {
  if (!item) return false;
  return Date.now() - item.timestamp < ttl;
};

/**
 * Tạo headers
 */
const getHeaders = () => {
  const { accessToken } = useAuthStore.getState();
  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
  };
};

/**
 * Generic error handler
 */
const handleError = (error: unknown, defaultMessage: string): never => {
  const message = error instanceof Error ? error.message : defaultMessage;
  throw new Error(message);
};

// ==================== API CALLERS ====================

/**
 * Fetch dashboard data từ API
 */
async function fetchDashboardAPI(): Promise<UserLearningDashboardResponse> {
  const res = await axiosClient.get<ApiResponse<UserLearningDashboardResponse>>(
    API_ENDPOINTS.LEARNING_PROGRESS.PROGRESS_VIEW,
    {
      headers: getHeaders(),
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Không lấy được learning progress");
  }

  return res.data.result;
}

/**
 * Fetch daily progress từ API
 */
async function fetchDailyProgressAPI(
  days: number
): Promise<DailyProgressDto[]> {
  const res = await axiosClient.get<ApiResponse<DailyProgressDto[]>>(
    `${API_ENDPOINTS.LEARNING_PROGRESS.PROGRESS_RESULT_DAILY}/daily?days=${days}`,
    {
      headers: getHeaders(),
    }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Không lấy được daily progress");
  }

  return res.data.result;
}

// ==================== SERVICE ====================
export const learningProgressService = {
  /**
   * ✅ Lấy dashboard với cache và request deduplication
   */
  async view(
    forceRefresh: boolean = false
  ): Promise<UserLearningDashboardResponse> {
    // 1. Check cache
    if (!forceRefresh && isCacheValid(cache.dashboard, CACHE_TTL.DASHBOARD)) {
      console.log("[Cache HIT] Dashboard");
      return cache.dashboard!.data;
    }

    // 2. Request deduplication
    if (cache.pendingRequests.dashboard) {
      console.log("[Dedup] Waiting for existing dashboard request");
      return cache.pendingRequests.dashboard;
    }

    // 3. Fetch mới
    console.log("[Cache MISS] Fetching dashboard");
    const request = fetchDashboardAPI()
      .then((data) => {
        // Lưu vào cache
        cache.dashboard = {
          data,
          timestamp: Date.now(),
        };
        return data;
      })
      .finally(() => {
        // Xóa khỏi pending
        cache.pendingRequests.dashboard = null;
      });

    cache.pendingRequests.dashboard = request;

    try {
      return await request;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi lấy learning progress"
      );
    }
  },

  /**
   * ✅ Lấy daily progress với cache per days
   */
  async getDailyProgress(
    days: number = 7,
    forceRefresh: boolean = false
  ): Promise<DailyProgressDto[]> {
    // 1. Check cache
    const cachedItem = cache.dailyProgress.get(days);
    if (!forceRefresh && isCacheValid(cachedItem, CACHE_TTL.DAILY)) {
      console.log(`[Cache HIT] Daily progress (${days} days)`);
      return cachedItem!.data;
    }

    // 2. Request deduplication
    const pendingRequest = cache.pendingRequests.dailyProgress.get(days);
    if (pendingRequest) {
      console.log(`[Dedup] Waiting for daily progress (${days} days)`);
      return pendingRequest;
    }

    // 3. Fetch mới
    console.log(`[Cache MISS] Fetching daily progress (${days} days)`);
    const request = fetchDailyProgressAPI(days)
      .then((data) => {
        // Lưu vào cache
        cache.dailyProgress.set(days, {
          data,
          timestamp: Date.now(),
        });
        return data;
      })
      .finally(() => {
        // Xóa khỏi pending
        cache.pendingRequests.dailyProgress.delete(days);
      });

    cache.pendingRequests.dailyProgress.set(days, request);

    try {
      return await request;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Lỗi không xác định khi lấy daily progress"
      );
    }
  },

  /**
   * ✅ Xóa cache dashboard (gọi sau khi submit exam)
   */
  clearDashboardCache(): void {
    cache.dashboard = null;
    cache.pendingRequests.dashboard = null;
    console.log("[Cache CLEAR] Dashboard");
  },

  /**
   * ✅ Xóa cache daily progress (gọi sau khi submit exam)
   */
  clearDailyCache(days?: number): void {
    if (days !== undefined) {
      cache.dailyProgress.delete(days);
      cache.pendingRequests.dailyProgress.delete(days);
      console.log(`[Cache CLEAR] Daily progress (${days} days)`);
    } else {
      cache.dailyProgress.clear();
      cache.pendingRequests.dailyProgress.clear();
      console.log("[Cache CLEAR] All daily progress");
    }
  },

  /**
   * ✅ Xóa toàn bộ cache
   */
  clearAllCache(): void {
    cache.dashboard = null;
    cache.dailyProgress.clear();
    cache.pendingRequests.dashboard = null;
    cache.pendingRequests.dailyProgress.clear();
    console.log("[Cache CLEAR ALL] Learning progress");
  },

  /**
   * ✅ Invalidate cache sau khi hoàn thành exam
   * Gọi function này sau khi submit exam
   */
  invalidateAfterExam(): void {
    this.clearDashboardCache();
    this.clearDailyCache(); // Clear tất cả daily cache
    console.log("[Cache INVALIDATE] After exam completion");
  },

  /**
   * ✅ Prefetch data (gọi trước khi cần)
   */
  async prefetchDashboard(): Promise<void> {
    if (
      !isCacheValid(cache.dashboard, CACHE_TTL.DASHBOARD) &&
      !cache.pendingRequests.dashboard
    ) {
      try {
        await this.view();
        console.log("[Prefetch SUCCESS] Dashboard");
      } catch (err) {
        console.warn("[Prefetch FAILED] Dashboard", err);
      }
    }
  },

  /**
   * ✅ Prefetch daily progress
   */
  async prefetchDaily(days: number = 7): Promise<void> {
    const cachedItem = cache.dailyProgress.get(days);
    if (
      !isCacheValid(cachedItem, CACHE_TTL.DAILY) &&
      !cache.pendingRequests.dailyProgress.has(days)
    ) {
      try {
        await this.getDailyProgress(days);
        console.log(`[Prefetch SUCCESS] Daily progress (${days} days)`);
      } catch (err) {
        console.warn(`[Prefetch FAILED] Daily progress (${days} days)`, err);
      }
    }
  },

  /**
   * ✅ Lấy thông tin cache (debug)
   */
  getCacheInfo() {
    return {
      dashboard: {
        cached: cache.dashboard !== null,
        age: cache.dashboard ? Date.now() - cache.dashboard.timestamp : null,
        isPending: cache.pendingRequests.dashboard !== null,
      },
      dailyProgress: {
        cachedDays: Array.from(cache.dailyProgress.keys()),
        count: cache.dailyProgress.size,
        pendingCount: cache.pendingRequests.dailyProgress.size,
      },
    };
  },
};
