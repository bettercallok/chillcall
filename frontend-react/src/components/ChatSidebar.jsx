/**
 * ChatSidebar.jsx - Chat Messages Display
 */

import { useState } from 'react';
import { useCall } from '../context/CallContext';

export function ChatSidebar() {
    const { chatMessages, addChatMessage } = useCall();
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;
        addChatMessage(inputText, 'YOU');
        setInputText('');
        // TODO: Send through data channel to peers
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="bg-white border-2 border-black brutal-shadow flex flex-col h-full">
            {/* Header */}
            <div className="bg-black text-white p-3 shrink-0">
                <span className="font-bold text-xs">&gt; SYSTEM_LOGS</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map((msg, i) => (
                    <div key={i} className="border-2 border-black p-2">
                        <span className="text-blue-600 font-bold text-xs">[{msg.sender}]:</span>
                        <span className="text-xs ml-1">{msg.text}</span>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t-2 border-black flex gap-2">
                <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-2 border-black px-2 py-1 text-xs font-mono"
                    placeholder="Type message..."
                />
                <button
                    onClick={handleSend}
                    className="pixel-btn px-3 py-1 text-xs font-bold"
                >
                    TX
                </button>
            </div>
        </div>
    );
}
