/**
 * LandingScreen.jsx - The Entry Point UI
 * 
 * WHAT IS A COMPONENT?
 * A React component is a reusable piece of UI. It's like a custom HTML element.
 * Components can:
 * - Accept "props" (inputs from parent)
 * - Have their own "state" (internal data)
 * - Return JSX (HTML-like syntax)
 * 
 * THIS COMPONENT:
 * Shows the login/connect screen with room ID input and connect button.
 * When user clicks connect, it initializes camera and connects to signaling.
 */

import { useState } from 'react';
import { useCall } from '../context/CallContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMediaStream } from '../hooks/useMediaStream';

export function LandingScreen({ onConnected }) {
    // Local component state for input and loading
    const [roomInput, setRoomInput] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    // Get global state and hooks
    const { userId, setRoomId, setIsConnected, addChatMessage, connectToPeers, setupSocketListeners } = useCall();
    const { connect } = useWebSocket();
    const { initializeMedia } = useMediaStream();

    // Handle connect button click
    const handleConnect = async () => {
        setIsConnecting(true);

        try {
            // 1. Get camera access
            const stream = await initializeMedia();

            // 2. Connect to WebSocket
            const socket = await connect(roomInput || null);

            // 3. Set up message handler
            socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                console.log('RX:', msg);

                switch (msg.type) {
                    case 'room_created':
                        setRoomId(msg.roomId);
                        setIsConnected(true);
                        addChatMessage(`Connected to Room ${msg.roomId}`);
                        onConnected(msg); // Tell parent to switch to AppScreen

                        // Setup Listeners for future events
                        setupSocketListeners();
                        break;

                    case 'room_joined':
                        setRoomId(msg.roomId);
                        setIsConnected(true);
                        addChatMessage(`Connected to Room ${msg.roomId}`);
                        onConnected(msg); // Tell parent to switch to AppScreen

                        // 1. Connect to existing peers
                        connectToPeers(msg.participants);

                        // 2. Setup Listeners for future events
                        setupSocketListeners();
                        break;

                    case 'error':
                        alert(msg.message);
                        setIsConnecting(false);
                        break;
                }
            };
        } catch (error) {
            console.error('Connection failed:', error);
            setIsConnecting(false);
        }
    };


    return (
        <main className="relative w-full max-w-[420px] bg-white border-2 border-black brutal-shadow p-8 z-20 m-4 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 text-xs border-b-2 border-black pb-2">
                <span>FIG_001 [ USER_AUTH ]</span>
                <span>v2.0.4</span>
            </div>

            {/* Title */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">ChillCall</h1>
                <p className="text-sm opacity-70">Enter credentials to access the visual uplink.</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
                <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wide ml-1 mb-1">
                        &gt; Frequency_ (Room ID)
                    </label>
                    <input
                        type="text"
                        value={roomInput}
                        onChange={(e) => setRoomInput(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-black focus:bg-gray-50 focus:outline-none placeholder-gray-400 font-mono"
                        placeholder="Leave empty to create new"
                    />
                </div>

                <div className="text-xs font-mono opacity-50 my-4">
                    BUFFER: ▒▒▒▒▒▒▒▒░░░░░
                </div>

                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full bg-white text-black font-bold uppercase py-4 border-2 border-black hover:bg-black hover:text-white transition-all flex items-center justify-center group disabled:opacity-50"
                >
                    <span className="mr-2">
                        {isConnecting ? 'CONNECTING...' : 'Connect_Uplink'}
                    </span>
                    {!isConnecting && (
                        <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform" />
                    )}
                </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t-2 border-black flex justify-between text-[10px] uppercase tracking-wider">
                <span>&copy; 1986 - 2025</span>
                <span>MEM: 64KB OK</span>
            </div>
        </main>
    );
}
