// src/services/roomService.ts
import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";
import {
  ChatRoomResponse,
  ChatMessageResponse,
  CreatePrivateRoomRequest,
} from "@/types/chat";

/* ===================== TYPES ===================== */

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/* ===================== SERVICE ===================== */

export const roomService = {
  /**
   * Lấy danh sách phòng chat của user hiện tại
   */
  getMyRooms(): Promise<ChatRoomResponse[]> {
    return http.get<ChatRoomResponse[]>(API_ENDPOINTS.CHAT_ROOM.MY_ROOMS);
  },

  /**
   * Tạo phòng chat private
   */
  createPrivateRoom(
    request: CreatePrivateRoomRequest
  ): Promise<ChatRoomResponse> {
    return http.post<ChatRoomResponse>(
      API_ENDPOINTS.CHAT_ROOM.CREATE_PRIVATE,
      request
    );
  },

  /**
   * Lấy lịch sử tin nhắn của phòng chat
   */
  getMessages(
    roomId: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<ChatMessageResponse>> {
    return http.get<PageResponse<ChatMessageResponse>>(
      API_ENDPOINTS.CHAT_ROOM.MESSAGES(roomId, page, size)
    );
  },
};
