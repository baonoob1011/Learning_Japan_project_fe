import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export interface CallRecordRequest {
  callerId: string;
  receiverId: string;
  type: "VIDEO" | "VOICE";
  status: "COMPLETED" | "MISSED" | "REJECTED" | "CANCELLED";
  duration: number;
  roomId: string;
}

export const callService = {
  saveCall: async (request: CallRecordRequest) => {
    try {
      const response = await axios.post(`${API_URL}/api/call-history/save`, request);
      return response.data;
    } catch (error) {
      console.error("Failed to save call history:", error);
      throw error;
    }
  },

  getUserHistory: async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/call-history/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch call history:", error);
      throw error;
    }
  },
};

// --- Signaling Helpers ---

export const sendOffer = (stomp: any, roomId: string, offer: any, senderId: string) => {
  if (stomp?.connected) {
    stomp.publish({
      destination: "/app/call.offer",
      body: JSON.stringify({ type: "offer", roomId, data: offer, senderId }),
    });
  }
};

export const sendAnswer = (stomp: any, roomId: string, answer: any, senderId: string) => {
  if (stomp?.connected) {
    stomp.publish({
      destination: "/app/call.answer",
      body: JSON.stringify({ type: "answer", roomId, data: answer, senderId }),
    });
  }
};

export const sendIceCandidate = (stomp: any, roomId: string, candidate: any, senderId: string) => {
  if (stomp?.connected) {
    stomp.publish({
      destination: "/app/call.ice",
      body: JSON.stringify({ type: "ice", roomId, data: candidate, senderId }),
    });
  }
};

export const sendIncomingNotification = (stomp: any, notification: any) => {
  if (stomp?.connected) {
    stomp.publish({
      destination: "/app/call.incoming",
      body: JSON.stringify(notification),
    });
  }
};

