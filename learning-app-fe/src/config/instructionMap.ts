// /config/instructionMap.ts
import { AssessmentType } from "@/enums/assessmentType";

export const instructionMap: Record<AssessmentType, string> = {
  [AssessmentType.FILL_BLANK]:
    "問題___の言葉の読み方として最もよいものを、1から一つ選びなさい。",
  [AssessmentType.VOCAB_CONTEXT]:
    "問題(　　)に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
  [AssessmentType.SENTENCE_ORDER]:
    "問題___の言葉の意味が最も近いものを、1・2・3・4から一つ選びなさい。",
  [AssessmentType.READING_SHORT]:
    "問題 次の文章の内容を読んで、最も適切な答えを1から一つ選びなさい。",
  [AssessmentType.READING_DIALOGUE]:
    "問題 会話文を読んで、空欄に入る最も適切な答えを1から一つ選びなさい。",
  [AssessmentType.READING_LETTER]: "問題 手紙の内容を読み、設問に答えなさい。",
  [AssessmentType.READING_PERSONAL]:
    "問題 説明文を読んで、文章の内容に最も合う答えを1から一つ選びなさい。",
  [AssessmentType.READING_PLACE]:
    "問題 場所や環境に関する文章を読み、設問に答えなさい。",
  [AssessmentType.READING_INFO]:
    "問題 お知らせやスケジュールを読んで、設問に答えなさい。",
  [AssessmentType.KANJI_READING]:
    "問題 漢字の読み方として正しいものを1から一つ選びなさい。",
  [AssessmentType.KANJI_MEMORY]:
    "問題 漢字の意味や書き順を思い出して答えなさい。",
  [AssessmentType.LISTENING_TASK]:
    "問題 音声を聞いて、課題を理解し最適な答えを1から一つ選びなさい。",
  [AssessmentType.LISTENING_CHOICE_PREVIEW]:
    "問題 音声を聞き、重要なポイントに基づいて答えを選びなさい。",
  [AssessmentType.LISTENING_MAIN_IDEA]:
    "問題 音声全体の要旨を理解し、最も適切な答えを選びなさい。",
  [AssessmentType.LISTENING_RESPONSE]:
    "問題 会話の内容に基づき、最も適切な応答を選びなさい。",
  [AssessmentType.LISTENING_INSTANT]:
    "問題 音声を聞いて即座に答えを選びなさい。",
  [AssessmentType.LISTENING_LONG]:
    "問題 長めの音声を聞き、内容を理解して答えを選びなさい。",
  [AssessmentType.PARAPHRASE]:
    "問題 次の（　）の言葉の意味が最も近いものを、1・2・3・4から一つ選びなさい。",
  [AssessmentType.GRAMMAR_SELECT]:
    "問題 (　　) に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。",
  [AssessmentType.TEXT_COMPLETION]:
    "問題 次の文章の意味を考えて、(　　)に入る最もよいものを、1・2・3・4から一つ選びなさい。",
  [AssessmentType.READING_MEDIUM]:
    "問題 次の文章を読んで、後の問いに対する答えとして最もよいものを、1・2・3・4から一つ選びなさい。",
};
