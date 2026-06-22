import { Notification } from "@/types/notification";

type SrsBreakdown = {
  total: number;
  urgent: number;
  fuzzy: number;
  longTerm: number;
};

const extractFirstNumber = (text: string) => {
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

export const isSrsVocabNotification = (notification: Pick<Notification, "title" | "content">) => {
  const source = `${notification.title} ${notification.content}`.toLowerCase();
  return (
    source.includes("srs") ||
    source.includes("nhac on tu vung") ||
    source.includes("nhắc ôn từ vựng") ||
    source.includes("ôn tập") ||
    source.includes("đến hạn ôn")
  );
};

export const parseSrsBreakdown = (content: string): SrsBreakdown | null => {
  const normalized = content.toLowerCase();
  if (!normalized.includes("tu")) {
    return null;
  }

  const totalMatch = normalized.match(/co\s+(\d+)\s+tu|có\s+(\d+)\s+từ/);
  const urgentMatch = normalized.match(/(\d+)\s+tu\s+can\s+on\s+som|(\d+)\s+từ\s+cần\s+ôn\s+sớm/);
  const fuzzyMatch = normalized.match(/(\d+)\s+tu\s+dang\s+nho\s+mo\s+ho|(\d+)\s+từ\s+đang\s+nhớ\s+mơ\s+hồ/);
  const longTermMatch = normalized.match(/(\d+)\s+tu\s+can\s+on\s+lai|(\d+)\s+từ\s+cần\s+ôn\s+lại/);

  const total = totalMatch ? Number(totalMatch[1] || totalMatch[2]) : extractFirstNumber(content);
  const urgent = urgentMatch ? Number(urgentMatch[1] || urgentMatch[2]) : 0;
  const fuzzy = fuzzyMatch ? Number(fuzzyMatch[1] || fuzzyMatch[2]) : 0;
  const longTerm = longTermMatch ? Number(longTermMatch[1] || longTermMatch[2]) : 0;

  return { total, urgent, fuzzy, longTerm };
};

export const buildSrsToastMessage = (content: string) => {
  const breakdown = parseSrsBreakdown(content);
  if (!breakdown) {
    return content;
  }

  return `Đến lịch ôn ${breakdown.total} từ: ${breakdown.urgent} từ cần ôn gấp, ${breakdown.fuzzy} từ nhớ mơ hồ, ${breakdown.longTerm} từ giữ nhớ lâu.`;
};

export const isMissedCallNotification = (notification: Pick<Notification, "title" | "content">) => {
  const source = `${notification.title} ${notification.content}`.toLowerCase();
  return (
    source.includes("cuộc gọi nhỡ") ||
    source.includes("missed call") ||
    source.includes("từ chối cuộc gọi") ||
    source.includes("cuộc gọi bị từ chối")
  );
};

export const getRoomIdFromNotification = (notification: Notification) => {
  if (isMissedCallNotification(notification)) {
    return notification.metadata || null;
  }
  return null;
};
