// src/services/vocabService.ts
import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";
import { LearningStatus } from "@/enums/LearningStatus";

/* ===================== TYPES ===================== */

export interface UpdateVocabRequest {
  surface: string;
  translated: string;
}

export interface CreateManualVocabRequest {
  surface: string;
  translated?: string;
  reading?: string;
  romaji?: string;
  partOfSpeech?: string;
}
export enum StudyMode {
  FLASHCARD = "FLASHCARD",
  LISTEN = "LISTEN",
  WRITE = "WRITE",
  QUIZ = "QUIZ"
}

export interface MarkVocabRequest {
  remembered: boolean;
  vocabId: string;
  studyMode: StudyMode;
}
export type Skill = "READING" | "LISTENING" | "TRANSLATION" | "WRITING";

export interface SmartSkillAttemptRequest {
  vocabId: string;
  skill?: Skill;
  studyMode: StudyMode;
  success: boolean;
}
export interface SmartFinalizeWordRequest {
  vocabId: string;
  wrongCount: number;
  failedInRetry: boolean;
}
export interface SmartFinalizeWordResponse {
  vocabId: string;
  wordProgressId: string;
  grade: "AGAIN" | "HARD" | "GOOD" | "EASY";
  wrongCount: number;
  nextReviewAt: string;
}
export interface VocabStatusResponse {
  vocabId: string;
  status: LearningStatus;
}
export interface VocabResponse {
  id: string;
  surface: string;
  reading: string;
  romaji: string;
  translated: string;
  partOfSpeech: string;
  audioUrl?: string;
  status?: LearningStatus;
  nextReviewAt?: string;
}

/* ===================== SERVICE ===================== */

export const vocabService = {
  /**
   * Lưu vocab cho user hiện tại
   */
  save(surface: string): Promise<void> {
    return http.post<void>(API_ENDPOINTS.VOCAB.CREATE, { surface });
  },

  createManual(request: CreateManualVocabRequest): Promise<VocabResponse> {
    return http.post<VocabResponse>(API_ENDPOINTS.VOCAB.CREATE_MANUAL, request);
  },

  getMyVocabsByVideo(videoId: string): Promise<VocabResponse[]> {
    return http.get<VocabResponse[]>(API_ENDPOINTS.VOCAB.GET_MY_VIDEO(videoId));
  },
  /**
   * Lấy danh sách vocab đã lưu
   */ getMyVocabs(): Promise<VocabResponse[]> {
    return http.get<VocabResponse[]>(API_ENDPOINTS.VOCAB.GET_MY);
  },

  /**
   * Chỉ sửa nghĩa vocab
   */
  updateMeaning(request: UpdateVocabRequest): Promise<void> {
    return http.put<void>(API_ENDPOINTS.VOCAB.UPDATE_MEANING, request);
  },

  /**
   * Xóa vocab của user hiện tại
   */
  remove(surface: string): Promise<void> {
    return http.delete<void>(API_ENDPOINTS.VOCAB.DELETE(surface));
  },

  markVocab(request: MarkVocabRequest): Promise<void> {
    return http.post<void>(API_ENDPOINTS.VOCAB.MARK_VOCAB, request);
  }, // ✅ GET vocab status
  smartAttemptSkill(request: SmartSkillAttemptRequest): Promise<void> {
    return http.post<void>(API_ENDPOINTS.VOCAB.SMART_ATTEMPT_SKILL, request);
  },

  smartFinalizeWord(request: SmartFinalizeWordRequest): Promise<SmartFinalizeWordResponse> {
    return http.post<SmartFinalizeWordResponse>(API_ENDPOINTS.VOCAB.SMART_FINALIZE_WORD, request);
  },

  getStatus(vocabId: string): Promise<VocabStatusResponse> {
    return http.get<VocabStatusResponse>(
      API_ENDPOINTS.VOCAB.GET_STATUS(vocabId)
    );
  },
};
