import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";

/* ===================== TYPES ===================== */

export interface PointDTO {
  x: number;
  y: number;
}

export interface KanjiResponse {
  id: string;
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokes: PointDTO[][];
}

export interface KanjiCheckRequest {
  kanjiId: string;
  strokes: PointDTO[][];
}

export interface KanjiCheckResponse {
  correct: boolean;
  score: number;
  expectedStrokeCount: number;
  userStrokeCount: number;
}

export interface CreateKanjiRequest {
  character: string;
  meaning: string;
  onyomi: string;
  kunyomi: string;
  strokeData: string; // JSON string
}

/* ===================== SERVICE ===================== */

export const kanjiService = {
  /**
   * Lấy tất cả kanji
   */
  getAll(): Promise<KanjiResponse[]> {
    return http.get<KanjiResponse[]>(API_ENDPOINTS.KANJI.GET_ALL);
  },

  /**
   * Lấy kanji theo ID
   */
  getById(id: string): Promise<KanjiResponse> {
    return http.get<KanjiResponse>(API_ENDPOINTS.KANJI.GET_BY_ID(id));
  },

  /**
   * Tạo kanji mới
   */
  create(request: CreateKanjiRequest): Promise<KanjiResponse> {
    return http.post<KanjiResponse>(API_ENDPOINTS.KANJI.CREATE, request);
  },

  /**
   * Check nét viết kanji
   */
  check(request: KanjiCheckRequest): Promise<KanjiCheckResponse> {
    return http.post<KanjiCheckResponse>(API_ENDPOINTS.KANJI.CHECK, request);
  },
};
