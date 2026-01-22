/**
 * LandingScreen.jsx - Initial Connection Screen
 */

import { useState } from 'react';
import { useCall } from '../context/CallContext';

export function LandingScreen({ onConnected }) {
    const { setRoomId, setUserId, socketRef, setupSocketListeners, connectToPeers } = useCall();
    const [inputRoomId, setInputRoomId] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        const ws = new WebSocket('ws://localhost:8080/signaling');
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('[WS] Connected');
            const msg = inputRoomId.trim()
                ? { type: 'join_room', roomId: inputRoomId }
                : { type: 'create_room' };

            console.log('[WS] Sending:', msg);
            ws.send(JSON.stringify(msg));
        };

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            console.log('RX:', msg);

            if (msg.type === 'room_created') {
                setRoomId(msg.roomId);
                setUserId(msg.userId);
                setupSocketListeners(); // Switch to main listener
                onConnected(msg);
            } else if (msg.type === 'room_joined') {
                setRoomId(msg.roomId);
                setUserId(msg.userId);
                setupSocketListeners();

                // If we joined, there might be existing peers
                if (msg.participants) {
                    connectToPeers(msg.participants);
                }

                onConnected(msg);
            }
        };
    };

    return (
        <div className="flex flex-col items-center gap-8 z-20">
            <div className="text-center space-y-2">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase glitch-text">
                    ChillCall
                </h1>
                <p className="font-mono text-sm md:text-base tracking-widest text-gray-600">
                    SECURE_UPLINK_PROTOCOL_V1.0
                </p>
            </div>

            <div className="bg-white p-2 border-2 border-black brutal-shadow flex flex-col gap-2 w-80">
                <div className="bg-black text-white px-2 py-1 text-xs font-bold font-mono">
                    TARGET_FREQUENCY (ROOM_ID)
                </div>
                <input
                    type="text"
                    value={inputRoomId}
                    onChange={(e) => setInputRoomId(e.target.value)}
                    placeholder="LEAVE EMPTY TO HOST"
                    className="w-full bg-gray-100 border-2 border-black p-3 font-mono text-sm outline-none focus:bg-yellow-50 placeholder:text-gray-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                />
                <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-black text-white py-4 font-bold tracking-widest hover:bg-gray-800 transition-colors relative overflow-hidden group disabled:opacity-50"
                >
                    <span className="relative z-10">
                        {isConnecting ? 'ESTABLISHING_UPLINK...' : '[ CONNECT_UPLINK ]'}
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>

            <div className="flex gap-8 text-[10px] font-mono font-bold tracking-widest opacity-50">
                <span>ENCRYPTED</span>
                <span>P2P_MESH</span>
                <span>LOW_LATENCY</span>
            </div>
        </div>
    );
}
