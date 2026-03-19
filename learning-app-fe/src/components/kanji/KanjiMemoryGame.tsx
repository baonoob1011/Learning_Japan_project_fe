import React, { useState, useEffect, useCallback } from 'react';
import { KanjiResponse } from "@/services/kanjiService";
import { Layers, RotateCw, Trophy } from "lucide-react";

interface GameCard {
    id: string; // unique ID for the card instance (e.g., character-0)
    originalId: string; // The Kanji ID from API
    content: string;
    type: 'character' | 'meaning';
    isFlipped: boolean;
    isMatched: boolean;
}

interface KanjiMemoryGameProps {
    kanjis: KanjiResponse[];
    isDarkMode: boolean;
    onClose: () => void;
}

const KanjiMemoryGame: React.FC<KanjiMemoryGameProps> = ({ kanjis, isDarkMode, onClose }) => {
    const [cards, setCards] = useState<GameCard[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]); // indexes
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [isWon, setIsWon] = useState(false);

    // Initialize Shuffled Cards
    const initializeGame = useCallback(() => {
        // Take 12 kanjis for 24 cards
        const gameKanjis = kanjis.length >= 12 ? kanjis.slice(0, 12) : kanjis;
        const gameCards: GameCard[] = [];

        gameKanjis.forEach((k) => {
            // Add Character card
            gameCards.push({
                id: `${k.id}-char`,
                originalId: k.id,
                content: k.character,
                type: 'character',
                isFlipped: false,
                isMatched: false,
            });
            // Add Meaning card
            gameCards.push({
                id: `${k.id}-mean`,
                originalId: k.id,
                content: k.meaning,
                type: 'meaning',
                isFlipped: false,
                isMatched: false,
            });
        });

        // Shuffle (Fisher-Yates)
        for (let i = gameCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
        }

        setCards(gameCards);
        setFlippedCards([]);
        setMoves(0);
        setScore(0);
        setIsWon(false);
    }, [kanjis]);

    useEffect(() => {
        if (kanjis.length > 0) {
            initializeGame();
        }
    }, [kanjis, initializeGame]);

    const handleCardClick = (index: number) => {
        // Ignore if already flipped, matched, or 2 cards already flipped
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
                // MATCH!
                setTimeout(() => {
                    setCards(prev => {
                        const next = [...prev];
                        next[firstIndex].isMatched = true;
                        next[secondIndex].isMatched = true;

                        // Check win
                        if (next.every(c => c.isMatched)) {
                            setIsWon(true);
                        }
                        return next;
                    });
                    setFlippedCards([]);
                    setScore(prev => prev + 10);
                }, 600);
            } else {
                // NO MATCH
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

    return (
        <div className={`p-6 bg-transparent h-full flex flex-col relative ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {/* 3D Classes within styled-jsx for isolation */}
            <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { 
          backface-visibility: hidden; 
          -webkit-backface-visibility: hidden; 
        }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

            {/* Header Info */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-6">
                    <div className="flex flex-col">
                        <span className="text-xs opacity-60 uppercase font-bold tracking-wider">Điểm số</span>
                        <span className="text-2xl font-black text-cyan-400">{score}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs opacity-60 uppercase font-bold tracking-wider">Lượt lật</span>
                        <span className="text-2xl font-black">{moves}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={initializeGame}
                        title="Chơi lại"
                        className={`p-3 rounded-xl transition-all active:scale-95 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200 shadow-sm'
                            }`}
                    >
                        <RotateCw className="w-5 h-5 text-cyan-500" />
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl shadow-lg shadow-red-500/20 hover:scale-105 transition-all font-bold"
                    >
                        Kết thúc
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-1 py-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-4 content-start">
                {cards.map((card, index) => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        className={`aspect-square relative perspective-1000 cursor-pointer group`}
                    >
                        <div className={`w-full h-full transition-all duration-500 preserve-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
                            {/* Back Face (Hidden Face - initially visible) */}
                            <div className={`absolute inset-0 backface-hidden rounded-2xl border-2 flex items-center justify-center transition-all ${isDarkMode
                                    ? 'bg-gray-800 border-gray-700 shadow-black/40'
                                    : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'
                                } hover:border-cyan-400 group-hover:scale-[1.02]`}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-400/20">
                                    <Layers className="w-5 h-5 text-white" />
                                </div>
                            </div>

                            {/* Front Face (Revealed Face) */}
                            <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 flex items-center justify-center p-3 text-center select-none shadow-xl ${card.isMatched
                                    ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/40 dark:border-green-400 dark:text-green-300'
                                    : isDarkMode
                                        ? 'bg-gray-700 border-cyan-400 text-cyan-300'
                                        : 'bg-cyan-50 border-cyan-300 text-cyan-700'
                                }`}>
                                <span className={`${card.type === 'character' ? 'text-4xl font-bold' : 'text-xs sm:text-sm font-black leading-tight'}`}>
                                    {card.content}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Winning Screen Overlay */}
            {isWon && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-md rounded-3xl overflow-hidden">
                    <div className={`transform animate-in zoom-in duration-500 max-w-sm w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                        } p-10 rounded-3xl shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col items-center text-center`}>
                        <div className="relative mb-8">
                            <div className="absolute inset-0 animate-ping bg-yellow-400/20 rounded-full"></div>
                            <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center shadow-xl shadow-yellow-500/40">
                                <Trophy className="w-12 h-12 text-white drop-shadow-md" />
                            </div>
                        </div>

                        <h2 className="text-4xl font-black mb-2 bg-gradient-to-br from-cyan-400 to-indigo-500 bg-clip-text text-transparent italic">
                            TUYỆT VỜI!
                        </h2>
                        <p className={`text-sm mb-8 opacity-60`}>Bạn đã hoàn thành thử thách ghi nhớ!</p>

                        <div className="grid grid-cols-2 gap-4 w-full mb-10">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                                <div className="text-xs opacity-50 uppercase font-bold mb-1">Cấp độ</div>
                                <div className="text-xl font-black text-cyan-500">Master</div>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                                <div className="text-xs opacity-50 uppercase font-bold mb-1">Điểm</div>
                                <div className="text-xl font-black text-green-500">{score}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={initializeGame}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-2xl font-black shadow-xl shadow-cyan-500/30 transform active:scale-95 transition-all text-lg"
                            >
                                THỬ LẠI NGAY
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 rounded-2xl font-bold transition-all"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanjiMemoryGame;
