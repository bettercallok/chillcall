/**
 * ChatSidebar.jsx - Real-time Chat
 */

import { useState, useRef, useEffect } from 'react';
import { useCall } from '../context/CallContext';

export function ChatSidebar() {
    const { chatMessages, publishData } = useCall();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // Broadcast chat message
        const msg = {
            type: 'chat',
            text: inputValue,
            sender: 'ME' // Receiver will see this as peer ID or something
        };

        // Optimistic UI update (Local)
        // Actually, CallContext listens to DC messages.
        // But for local echo, we should probably add it manually if broadcast doesn't loop back.
        // The current implementation in CallContext handles DC message receipt.
        // It does NOT handle local echo automatically unless we do it here.
        // Wait, context has `addChatMessage`.

        publishData(msg); // Send to peers

        // Echo locally
        // We need access to addChatMessage ideally, but context exposes chatMessages.
        // Let's assume context handles it? 
        // Wait, checking CallContext... it has addChatMessage but it isn't exported directly in logic above?
        // Ah, useCall exports everything in `value`.
        // Let's verify context logic.
        // It exports `addChatMessage`. Correct.

        setInputValue('');
    };

    // We need addChatMessage to echo local messages
    const { addChatMessage } = useCall();

    // Wrap handleSend to include local echo
    const onSend = () => {
        if (!inputValue.trim()) return;
        publishData({ type: 'chat', text: inputValue, sender: 'REMOTE' }); // Sender is remote from THEIR perspective
        addChatMessage(inputValue, 'YOU');
        setInputValue('');
    };

    return (
        <div className="flex flex-col h-full bg-white border-2 border-black brutal-shadow">
            {/* Header */}
            <div className="bg-black text-white px-4 py-2 flex justify-between items-center shrink-0">
                <span className="font-bold font-mono text-sm">COMMS_LOG</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'YOU' ? 'items-end' : 'items-start'}`}>
                        <span className="px-2 py-1 bg-black text-white text-[10px] mb-0.5 uppercase">
                            {msg.sender}
                        </span>
                        <div className={`p-2 border-2 border-black max-w-[80%] ${msg.sender === 'YOU' ? 'bg-gray-100' : 'bg-white'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-50 border-t-2 border-black shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSend()}
                        className="flex-1 px-2 py-2 border-2 border-black font-mono text-xs focus:outline-none focus:bg-yellow-50"
                        placeholder="TRANSMIT_DATA..."
                    />
                    <button
                        onClick={onSend}
                        className="px-3 bg-black text-white font-bold text-xs hover:bg-gray-800"
                    >
                        SEND
                    </button>
                </div>
            </div>
        </div>
    );
}
