import { AssessmentType } from "@/enums/assessmentType";
import { QuestionTypeOrder } from "./questionTypeOrder";

/**
 * Thứ tự chuẩn JLPT N5 – Listening
 */
export const LISTENING_TYPE_ORDER: QuestionTypeOrder[] = [
  {
    key: "LISTENING_UNDERSTAND_KEY",
    label: "問題",
    assessmentType: AssessmentType.LISTENING_UNDERSTAND_KEY,
  },
  {
    key: "LISTENING_TASK",
    label: "問題",
    assessmentType: AssessmentType.LISTENING_TASK,
  },
  {
    key: "LISTENING_MAIN_POINT",
    label: "問題",
    assessmentType: AssessmentType.LISTENING_MAIN_POINT,
  },
  {
    key: "LISTENING_MAIN_IDEA",
    label: "問題",
    assessmentType: AssessmentType.LISTENING_MAIN_IDEA,
  },
  {
    key: "LISTENING_CORRECT_RESPONSE",
    label: "問題",
    assessmentType: AssessmentType.LISTENING_CORRECT_RESPONSE,
  },
  {
    key: "LISTENING_COMPREHENSIVE",
    label: "問題",
    assessmentType: AssessmentType.LISTENING_COMPREHENSIVE,
  },
];
