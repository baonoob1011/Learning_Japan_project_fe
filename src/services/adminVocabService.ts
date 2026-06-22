import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";
import { VocabResponse } from "./vocabService";

export interface PageResponse<T> {
    page: number;
    totalPages: number;
    size: number;
    totalElements: number;
    data: T[];
}

export const adminVocabService = {
    getAllVocabsManager(page: number, size: number, search?: string): Promise<PageResponse<VocabResponse>> {
        const params: any = { page, size };
        if (search) params.search = search;
        return http.get<PageResponse<VocabResponse>>(API_ENDPOINTS.ADMIN.VOCAB_MANAGER, { params });
    },

    createVocab(data: Partial<VocabResponse>): Promise<VocabResponse> {
        return http.post<VocabResponse>(API_ENDPOINTS.ADMIN.VOCAB_ADMIN, data);
    },

    updateVocab(id: string, data: Partial<VocabResponse>): Promise<VocabResponse> {
        return http.put<VocabResponse>(API_ENDPOINTS.ADMIN.VOCAB_ADMIN_BY_ID(id), data);
    },

    deleteVocab(id: string): Promise<void> {
        return http.delete<void>(API_ENDPOINTS.ADMIN.VOCAB_ADMIN_BY_ID(id));
    },
};
