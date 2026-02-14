import { KanjiCheckResponse } from "@/services/kanjiService";
import { CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface Props {
  result: KanjiCheckResponse;
  isDarkMode?: boolean;
}

export default function KanjiResult({ result, isDarkMode = false }: Props) {
  const isCorrect = result.correct;
  const scorePercentage = Math.round(result.score);

  return (
    <div
      className={`mt-6 p-6 rounded-xl shadow-lg border-2 ${
        isCorrect
          ? isDarkMode
            ? "bg-green-900/20 border-green-700"
            : "bg-green-50 border-green-200"
          : isDarkMode
          ? "bg-orange-900/20 border-orange-700"
          : "bg-orange-50 border-orange-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <CheckCircle
              className={`w-8 h-8 ${
                isDarkMode ? "text-green-400" : "text-green-600"
              }`}
            />
          ) : (
            <XCircle
              className={`w-8 h-8 ${
                isDarkMode ? "text-orange-400" : "text-orange-600"
              }`}
            />
          )}
          <h3
            className={`text-2xl font-bold ${
              isCorrect
                ? isDarkMode
                  ? "text-green-300"
                  : "text-green-700"
                : isDarkMode
                ? "text-orange-300"
                : "text-orange-700"
            }`}
          >
            {isCorrect ? "🎉 Excellent!" : "Keep practicing!"}
          </h3>
        </div>

        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <TrendingUp
            className={`w-5 h-5 ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <span
            className={`text-2xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {scorePercentage}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-lg ${
            isDarkMode ? "bg-gray-800/50" : "bg-white/80"
          }`}
        >
          <p
            className={`text-sm mb-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Your Strokes
          </p>
          <p
            className={`text-3xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {result.userStrokeCount}
          </p>
        </div>

        <div
          className={`p-4 rounded-lg ${
            isDarkMode ? "bg-gray-800/50" : "bg-white/80"
          }`}
        >
          <p
            className={`text-sm mb-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Expected Strokes
          </p>
          <p
            className={`text-3xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {result.expectedStrokeCount}
          </p>
        </div>
      </div>

      {!isCorrect && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            isDarkMode ? "bg-orange-900/30" : "bg-orange-100"
          }`}
        >
          <p
            className={`text-sm ${
              isDarkMode ? "text-orange-200" : "text-orange-800"
            }`}
          >
            💡 Tip: Try to match the stroke count and follow the correct stroke
            order!
          </p>
        </div>
      )}
    </div>
  );
}
