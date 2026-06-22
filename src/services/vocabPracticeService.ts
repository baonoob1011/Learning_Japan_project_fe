import { axiosClient } from "@/lib/axios";

export interface VocabPracticeQuestion {
  id: string;
  vocabId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  vocab?: {
    surface: string;
    reading: string;
    translated: string;
  };
}

export const vocabPracticeService = {
  generateExercises: async (): Promise<void> => {
    await axiosClient.post("/vocab/practice/generate");
  },

  getExercises: async (): Promise<VocabPracticeQuestion[]> => {
    const response = await axiosClient.get("/vocab/practice");
    return response.data.result;
  },
};
