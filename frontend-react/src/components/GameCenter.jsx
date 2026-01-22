/**
 * GameCenter.jsx - Tic-Tac-Toe Game
 */

import { useState, useEffect } from 'react';
import { useCall } from '../context/CallContext';

export function GameCenter({ onClose }) {
    const { publishData } = useCall();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState(null);
    const [gameRole, setGameRole] = useState(null); // 'X' or 'O'

    // Listen for incoming moves
    useEffect(() => {
        const handleMessage = (e) => {
            const msg = e.detail;
            if (msg.type === 'game_move') {
                setBoard(prev => {
                    const newBoard = [...prev];
                    newBoard[msg.index] = msg.value; // 'X' or 'O'
                    return newBoard;
                });
                setIsXNext(msg.value === 'O'); // If 'O' moved, X is next
            }
            if (msg.type === 'game_reset') {
                setBoard(Array(9).fill(null));
                setWinner(null);
                setIsXNext(true);
            }
        };

        window.addEventListener('chillcall_message', handleMessage);
        return () => window.removeEventListener('chillcall_message', handleMessage);
    }, []);

    // Check winner whenever board changes
    useEffect(() => {
        const w = checkWinner(board);
        if (w) setWinner(w);
    }, [board]);

    const checkWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleSquareClick = (i) => {
        if (board[i] || winner) return;

        // In P2P, only allow move if it's our turn
        if (gameRole === 'X' && !isXNext) return;
        if (gameRole === 'O' && isXNext) return;

        const value = isXNext ? 'X' : 'O';

        // Update Local
        const newBoard = [...board];
        newBoard[i] = value;
        setBoard(newBoard);
        setIsXNext(!isXNext);

        // Broadcast Move
        publishData({
            type: 'game_move',
            index: i,
            value: value
        });
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setIsXNext(true);

        publishData({ type: 'game_reset' });
    };

    return (
        <div className="bg-white border-2 border-black brutal-shadow w-full max-w-[450px] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-black text-white px-3 py-2 flex justify-between items-center shrink-0">
                <span className="font-bold font-mono text-xs md:text-sm pointer-events-none">SIMULATION: TIC_TAC_TOE</span>
                <button onClick={onClose} className="hover:text-red-500 font-bold px-2">X</button>
            </div>

            <div className="bg-[#f0f0f0] p-4 flex flex-col items-center">
                {/* Role Selection (Mockup) */}
                {!gameRole && (
                    <div className="w-full text-center mb-4">
                        <p className="text-[10px] font-mono mb-2 opacity-70">Assign roles.</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setGameRole('X')} className="border-2 border-black bg-white p-2 hover:bg-black hover:text-white w-16 font-bold">X</button>
                            <button onClick={() => setGameRole('O')} className="border-2 border-black bg-white p-2 hover:bg-black hover:text-white w-16 font-bold">O</button>
                        </div>
                    </div>
                )}

                {/* Status */}
                <div className="mb-4 font-mono text-sm font-bold">
                    {winner ? `WINNER: ${winner}` : `TURN: ${isXNext ? 'X' : 'O'}`}
                </div>

                {/* Board */}
                <div className="grid grid-cols-3 gap-1 bg-black border-2 border-black">
                    {board.map((cell, i) => (
                        <button
                            key={i}
                            onClick={() => handleSquareClick(i)}
                            className="w-16 h-16 bg-white flex items-center justify-center text-3xl font-bold hover:bg-gray-100"
                        >
                            {cell}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="mt-6 flex gap-4 w-full">
                    <button onClick={resetGame} className="flex-1 border-2 border-black bg-white py-2 font-bold text-xs hover:bg-black hover:text-white uppercase">
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
}
