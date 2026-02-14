"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  kanjiService,
  KanjiResponse,
  KanjiCheckResponse,
  PointDTO,
} from "@/services/kanjiService";
import KanjiCanvas from "@/components/kanji/Kanjicanvas";
import KanjiInfo from "@/components/kanji/Kanjiinfo";
import KanjiResult from "@/components/kanji/Kanjiresult";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function KanjiPractice({ params }: PageProps) {
  const router = useRouter();
  const [kanjiId, setKanjiId] = useState<string | null>(null);
  const [kanji, setKanji] = useState<KanjiResponse | null>(null);
  const [result, setResult] = useState<KanjiCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    params.then(({ id }) => setKanjiId(id));
  }, [params]);

  useEffect(() => {
    if (!kanjiId) return;

    loadKanji();
  }, [kanjiId]);

  const loadKanji = async () => {
    if (!kanjiId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await kanjiService.getById(kanjiId);
      setKanji(data);
    } catch (err) {
      setError("Failed to load kanji");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async (strokes: PointDTO[][]) => {
    if (!kanji) return;

    try {
      setChecking(true);
      const res = await kanjiService.check({
        kanjiId: kanji.id,
        strokes,
      });
      setResult(res);
    } catch (err) {
      console.error("Failed to check kanji:", err);
      alert("Failed to check your writing. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleTryAgain = () => {
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          <p className="text-gray-600">Loading kanji...</p>
        </div>
      </div>
    );
  }

  if (error || !kanji) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">
            {error || "Kanji not found"}
          </p>
          <button
            onClick={() => router.push("/kanji")}
            className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/kanji")}
            className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 transition mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition" />
            <span className="font-medium">Back to Kanji List</span>
          </button>

          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Practice Kanji Writing
          </h1>
          <p className="text-gray-600">
            Draw the kanji character on the canvas below
          </p>
        </div>

        {/* Kanji Info */}
        <KanjiInfo kanji={kanji} />

        {/* Canvas Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Draw Here
          </h2>
          <KanjiCanvas onCheck={handleCheck} />

          {checking && (
            <div className="text-center mt-4 text-cyan-600 font-medium">
              Checking your writing...
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <>
            <KanjiResult result={result} />

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleTryAgain}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition transform hover:scale-105 shadow-md"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/kanji")}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition transform hover:scale-105 shadow-md"
              >
                Back to List
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
