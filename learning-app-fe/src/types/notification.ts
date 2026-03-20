export type Notification = {
  id: string;
  type?: "REVIEW_REMINDER" | "MISSED_REVIEW" | "SYSTEM";
  title: string;
  content: string;
  metadata?: string | null;
  createdAt: string;
  isRead: boolean;
};
