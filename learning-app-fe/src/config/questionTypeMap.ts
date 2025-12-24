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
};
