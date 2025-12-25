// src/enums/AssessmentType.ts
export enum AssessmentType {
  // ===== LANGUAGE KNOWLEDGE =====
  FILL_BLANK = "FILL_BLANK",
  VOCAB_CONTEXT = "VOCAB_CONTEXT",
  SENTENCE_ORDER = "SENTENCE_ORDER",

  // ===== READING =====
  READING_SHORT = "READING_SHORT",
  READING_DIALOGUE = "READING_DIALOGUE",
  READING_LETTER = "READING_LETTER",
  READING_PERSONAL = "READING_PERSONAL",
  READING_PLACE = "READING_PLACE",
  READING_INFO = "READING_INFO",

  // ===== KANJI =====
  KANJI_READING = "KANJI_READING",
  KANJI_MEMORY = "KANJI_MEMORY",

  // ===== LISTENING (JLPT) =====
  LISTENING_TASK = "LISTENING_TASK", // 問題1：Nghe câu hỏi → nghe đoạn hội thoại
  LISTENING_CHOICE_PREVIEW = "LISTENING_CHOICE_PREVIEW", // 問題2：Xem lựa chọn trước
  LISTENING_MAIN_IDEA = "LISTENING_MAIN_IDEA", // 問題3：Nghe ý chính
  LISTENING_RESPONSE = "LISTENING_RESPONSE", // 問題4：Phản hồi hội thoại
  LISTENING_LONG = "LISTENING_LONG", // 問題5：Nghe đoạn dài
  LISTENING_INSTANT = "LISTENING_INSTANT", // Nghe và trả lời ngay
}
