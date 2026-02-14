"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { kanjiService, KanjiResponse } from "@/services/kanjiService";

export default function KanjiListPage() {
  const router = useRouter();
  const [kanjis, setKanjis] = useState<KanjiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadKanjis();
  }, []);

  const loadKanjis = async () => {
    try {
      setLoading(true);
      const data = await kanjiService.getAll();
      setKanjis(data);
      setError(null);
    } catch (err) {
      setError("Failed to load kanji list");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKanjiClick = (id: string) => {
    router.push(`/kanji/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading kanji...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Kanji Practice
          </h1>
          <p className="text-gray-600">Select a kanji to start practicing</p>
        </div>

        {kanjis.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No kanji available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {kanjis.map((kanji) => (
              <button
                key={kanji.id}
                onClick={() => handleKanjiClick(kanji.id)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-6 flex flex-col items-center justify-center group cursor-pointer border-2 border-transparent hover:border-blue-500"
              >
                <div className="text-6xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-3">
                  {kanji.character}
                </div>
                <div className="text-sm text-gray-600 text-center">
                  {kanji.meaning}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {kanji.strokes?.length || 0} strokes
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
