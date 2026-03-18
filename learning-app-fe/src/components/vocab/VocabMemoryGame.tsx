import React, { useState, useEffect, useCallback } from 'react';
import { vocabService, VocabResponse } from "@/services/vocabService";
import { Layers, RotateCw, Trophy, Gamepad2 } from "lucide-react";

interface GameCard {
    id: string;
    originalId: string;
    content: string;
    type: 'word' | 'meaning';
    isFlipped: boolean;
    isMatched: boolean;
}

interface VocabMemoryGameProps {
    isDarkMode: boolean;
}

const VocabMemoryGame: React.FC<VocabMemoryGameProps> = ({ isDarkMode }) => {
    const [cards, setCards] = useState<GameCard[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [loading, setLoading] = useState(true);

    const initializeGame = useCallback(async () => {
        try {
            setLoading(true);
            const vocabs = await vocabService.getMyVocabs();
            // Use 12 items for 24 cards
            const gameVocabs = vocabs.length >= 12 ? vocabs.slice(0, 12) : vocabs;

            const gameCards: GameCard[] = [];
            gameVocabs.forEach((v) => {
                gameCards.push({
                    id: `${v.id}-word`,
                    originalId: v.id,
                    content: v.surface,
                    type: 'word',
                    isFlipped: false,
                    isMatched: false,
                });
                gameCards.push({
                    id: `${v.id}-mean`,
                    originalId: v.id,
                    content: v.translated,
                    type: 'meaning',
                    isFlipped: false,
                    isMatched: false,
                });
            });

            // Shuffle
            for (let i = gameCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
            }

            setCards(gameCards);
            setFlippedCards([]);
            setMoves(0);
            setScore(0);
            setIsWon(false);
        } catch (err) {
            console.error("Failed to load vocabs for game", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const handleCardClick = (index: number) => {
        if (cards[index].isFlipped || cards[index].isMatched || flippedCards.length === 2) return;

        const updatedCards = [...cards];
        updatedCards[index].isFlipped = true;
        setCards(updatedCards);

        const newFlipped = [...flippedCards, index];
        setFlippedCards(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const firstIndex = newFlipped[0];
            const secondIndex = newFlipped[1];
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.originalId === secondCard.originalId) {
                setTimeout(() => {
                    setCards(prev => {
                        const next = [...prev];
                        next[firstIndex].isMatched = true;
                        next[secondIndex].isMatched = true;
                        if (next.every(c => c.isMatched)) setIsWon(true);
                        return next;
                    });
                    setFlippedCards([]);
                    setScore(prev => prev + 10);
                }, 600);
            } else {
                setTimeout(() => {
                    setCards(prev => {
                        const next = [...prev];
                        next[firstIndex].isFlipped = false;
                        next[secondIndex].isFlipped = false;
                        return next;
                    });
                    setFlippedCards([]);
                }, 1200);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <RotateCw className="w-10 h-10 animate-spin text-cyan-500 mb-4" />
                <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Đang chuẩn bị trò chơi...</p>
            </div>
        );
    }

    return (
        <div className={`w-full max-w-5xl mx-auto p-4 flex flex-col relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

            {/* Game Stats */}
            <div className="flex justify-between items-center mb-8 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Score</span>
                        <span className="text-3xl font-black text-cyan-400">{score}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Moves</span>
                        <span className="text-3xl font-black">{moves}</span>
                    </div>
                </div>

                <button
                    onClick={initializeGame}
                    className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all font-bold"
                >
                    <RotateCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Chơi mới</span>
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        className="aspect-square relative perspective-1000 cursor-pointer"
                    >
                        <div className={`w-full h-full transition-all duration-500 preserve-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                            {/* Card Back (Hidden) */}
                            <div className={`absolute inset-0 backface-hidden rounded-2xl border-2 flex items-center justify-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-lg shadow-gray-200/50'
                                } hover:border-cyan-400`}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                    <Gamepad2 className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Card Front (Visible content) */}
                            <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 flex items-center justify-center p-2 text-center select-none ${card.isMatched
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/40 dark:border-emerald-400 dark:text-emerald-300'
                                    : isDarkMode ? 'bg-gray-700 border-cyan-400 text-cyan-300' : 'bg-cyan-50 border-cyan-300 text-cyan-700'
                                }`}>
                                <span className={`${card.type === 'word' ? 'text-2xl font-black' : 'text-[10px] sm:text-xs font-bold'}`}>
                                    {card.content}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Win Overlay */}
            {isWon && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/90 backdrop-blur-xl rounded-3xl animate-in zoom-in duration-300">
                    <div className="bg-white dark:bg-gray-800 p-12 rounded-[40px] shadow-2xl flex flex-col items-center text-center max-w-sm">
                        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-yellow-500/50">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">EXCELLENT!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Bạn đã hoàn thành với {moves} lượt lật thẻ.</p>
                        <button
                            onClick={initializeGame}
                            className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-2xl font-black shadow-xl shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            CHƠI LẠI
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VocabMemoryGame;
