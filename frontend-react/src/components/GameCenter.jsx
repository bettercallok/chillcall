/**
 * GameCenter.jsx - Tic-Tac-Toe
 */

import { useState, useEffect } from 'react';
import { useCall } from '../context/CallContext';

export function GameCenter({ onClose }) {
    const { publishData } = useCall();
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const winner = calculateWinner(board);

    // Sync game state
    useEffect(() => {
        const handleMessage = (e) => {
            const msg = e.detail;
            if (msg.type === 'game_move') {
                setBoard(msg.board);
                setIsXNext(msg.isXNext);
            }
            if (msg.type === 'game_reset') {
                setBoard(Array(9).fill(null));
                setIsXNext(true);
            }
        };

        window.addEventListener('chillcall_message', handleMessage);
        return () => window.removeEventListener('chillcall_message', handleMessage);
    }, []);

    const handleClick = (i) => {
        if (winner || board[i]) return;

        const newBoard = board.slice();
        newBoard[i] = isXNext ? 'X' : 'O';

        setBoard(newBoard);
        setIsXNext(!isXNext);

        // Broadcast move
        publishData({
            type: 'game_move',
            board: newBoard,
            isXNext: !isXNext
        });
    };

    const handleReset = () => {
        publishData({ type: 'game_reset' });
        setBoard(Array(9).fill(null));
        setIsXNext(true);
    };

    return (
        <div className="bg-white border-2 border-black brutal-shadow pointer-events-auto w-[300px]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
                <span className="font-bold font-mono text-sm">TIC_TAC_TOE</span>
                <button onClick={onClose} className="hover:text-red-500 font-bold">X</button>
            </div>

            {/* Board */}
            <div className="p-4 flex flex-col items-center gap-4">
                <div className="grid grid-cols-3 gap-2">
                    {board.map((square, i) => (
                        <button
                            key={i}
                            onClick={() => handleClick(i)}
                            className="w-16 h-16 border-2 border-black flex items-center justify-center text-3xl font-bold font-mono hover:bg-gray-100 disabled:bg-gray-50"
                            disabled={!!winner || !!square}
                        >
                            {square}
                        </button>
                    ))}
                </div>

                {/* Status */}
                <div className="font-mono text-sm text-center">
                    {winner ? (
                        <span className="text-green-600 font-bold">WINNER: {winner}</span>
                    ) : (
                        <span>NEXT PLAYER: {isXNext ? 'X' : 'O'}</span>
                    )}
                </div>

                <button
                    onClick={handleReset}
                    className="w-full py-2 border-2 border-black font-bold text-xs uppercase hover:bg-black hover:text-white transition-colors"
                >
                    Reset System
                </button>
            </div>
        </div>
    );
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
