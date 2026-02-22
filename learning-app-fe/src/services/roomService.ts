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
export interface ChatUserResponse {
  userId: string;
  fullName: string;
  avatarUrl?: string;
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
   * 👥 Lấy tất cả user khác mà mình đã từng chat chung room
   */
  getMyChatUsers(): Promise<ChatUserResponse[]> {
    return http.get<ChatUserResponse[]>(API_ENDPOINTS.CHAT_ROOM.MY_USERS);
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
   * 🔍 Search phòng chat theo tên người đã chat
   */
  searchRooms(keyword: string): Promise<ChatRoomResponse[]> {
    return http.get<ChatRoomResponse[]>(
      API_ENDPOINTS.CHAT_ROOM.SEARCH(keyword)
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
