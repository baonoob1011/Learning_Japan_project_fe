// src/config/questionTypeMap.ts
import { AssessmentType } from "@/enums/assessmentType";

export const typeInstructionStyles: Record<
  AssessmentType,
  { bg: string; text: string; instruction: string }
> = {
  [AssessmentType.FILL_BLANK]: {
    bg: "bg-gray-900",
    text: "text-white",
    instruction:
      "もんだい1（　）に何を入れますか。1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.VOCAB_CONTEXT]: {
    bg: "bg-gray-200",
    text: "text-black",
    instruction:
      "もんだい2: ____★____に何を入れますか。1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.SENTENCE_ORDER]: {
    bg: "bg-gray-200",
    text: "text-black",
    instruction:
      "もんだい3: １から５に何を入れますか。文章の意味を考えて、1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.READING_SHORT]: {
    bg: "bg-gray-100",
    text: "text-black",
    instruction:
      "もんだい4: 次の文章を読んで質問に答えてください。答えは1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.READING_DIALOGUE]: {
    bg: "bg-gray-100",
    text: "text-black",
    instruction:
      "もんだい5: 次の会話を読んで質問に答えてください。答えは1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.READING_LETTER]: {
    bg: "bg-gray-100",
    text: "text-black",
    instruction:
      "もんだい6: 次の手紙やメッセージを読んで質問に答えてください。答えは1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.READING_PERSONAL]: {
    bg: "bg-gray-100",
    text: "text-black",
    instruction:
      "もんだい7: 次の文章を読んで質問に答えてください。答えは1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.READING_PLACE]: {
    bg: "bg-gray-100",
    text: "text-black",
    instruction:
      "もんだい8: 次の文章を読んで質問に答えてください。答えは1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.READING_INFO]: {
    bg: "bg-gray-100",
    text: "text-black",
    instruction:
      "もんだい9: 次の文章を読んで質問に答えてください。答えは1・2・3・4からいちばんいいものを一つえらんでください。",
  },
  [AssessmentType.KANJI_READING]: {
    bg: "bg-gray-200",
    text: "text-black",
    instruction: "漢字を読んで、意味や読み方を選んでください。",
  },
  [AssessmentType.KANJI_MEMORY]: {
    bg: "bg-gray-200",
    text: "text-black",
    instruction: "漢字の形や意味を思い出して答えてください。",
  },
  [AssessmentType.LISTENING_TASK]: {
    bg: "bg-blue-900",
    text: "text-white",
    instruction:
      "問題1では、まず質問を聞いてください。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つ選んでください。",
  },

  [AssessmentType.LISTENING_CHOICE_PREVIEW]: {
    bg: "bg-blue-800",
    text: "text-white",
    instruction:
      "問題2では、まず質問を聞いてください。そのあと、問題用紙のせんたくしを読んでください。読む時間があります。それから話を聞いて、問題用紙の1から4の中から、最もよいものを一つ選んでください。",
  },

  [AssessmentType.LISTENING_MAIN_IDEA]: {
    bg: "bg-blue-700",
    text: "text-white",
    instruction:
      "問題3では、問題用紙に何も印刷されていません。この問題は、全体としてどんな内容かを聞く問題です。話の前に質問はありません。まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、最もよいものを一つ選んでください。",
  },

  [AssessmentType.LISTENING_RESPONSE]: {
    bg: "bg-blue-600",
    text: "text-white",
    instruction:
      "問題4では、問題用紙に何もいんさつされていません。まず文を聞いてください。それから、それに対する返事を聞いて、1から3の中から、最もよいものを一つ選んでください。",
  },

  [AssessmentType.LISTENING_LONG]: {
    bg: "bg-blue-500",
    text: "text-white",
    instruction:
      "問題5では、長めの話を聞きます。この問題には練習はありません。メモをとってもかまいません。まず話を聞いてください。それから、質問とせんたくしを聞いて、1から4の中から、最もよいものを一つ選んでください。",
  },
  [AssessmentType.LISTENING_INSTANT]: {
    bg: "bg-blue-900",
    text: "text-white",
    instruction:
      "問題0では、すぐに質問を聞いて答えてください。話を聞いたら、問題用紙の1から4の中から最もよいものを一つ選んでください。",
  },
};
