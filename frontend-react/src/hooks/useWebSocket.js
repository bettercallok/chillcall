/**
 * useWebSocket.js - Custom Hook for WebSocket Signaling
 * 
 * WHAT IS A CUSTOM HOOK?
 * A custom hook is a JavaScript function that:
 * 1. Starts with "use" (e.g., useWebSocket)
 * 2. Can call other hooks (useState, useEffect, etc.)
 * 3. Encapsulates reusable logic
 * 
 * WHY USE CUSTOM HOOKS?
 * Instead of putting all WebSocket logic in a component, we extract it to a hook.
 * This keeps components clean and makes the logic reusable across the app.
 * 
 * WHAT THIS HOOK DOES:
 * - Connects to the signaling server (ws://localhost:8080/signaling)
 * - Handles room creation and joining
 * - Receives and processes signaling messages (offers, answers, ICE candidates)
 */

import { useCallback } from 'react';
import { useCall } from '../context/CallContext';

const SIGNALING_SERVER = 'ws://localhost:8080/signaling';

export function useWebSocket() {
    const {
        userId,
        setRoomId,
        setIsConnected,
        addChatMessage,
        socketRef,
    } = useCall();

    // Connect to WebSocket and create or join a room
    const connect = useCallback((roomIdToJoin = null) => {
        return new Promise((resolve, reject) => {
            try {
                // Create new WebSocket connection
                const socket = new WebSocket(SIGNALING_SERVER);
                socketRef.current = socket;

                socket.onopen = () => {
                    console.log('[WS] Connected');

                    // Decide: create new room or join existing
                    const payload = roomIdToJoin
                        ? { type: 'join_room', roomId: roomIdToJoin, userId }
                        : { type: 'create_room', userId };

                    console.log('[WS] Sending:', payload);
                    socket.send(JSON.stringify(payload));
                };

                socket.onerror = (err) => {
                    console.error('[WS] Error:', err);
                    reject(err);
                };

                socket.onclose = () => {
                    console.log('[WS] Disconnected');
                    setIsConnected(false);
                };

                // Return message handler setup function
                resolve(socket);
            } catch (e) {
                console.error('[WS] Exception:', e);
                reject(e);
            }
        });
    }, [userId, setIsConnected, socketRef]);

    // Send a message through the WebSocket
    const sendMessage = useCallback((message) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        }
    }, [socketRef]);

    // Disconnect WebSocket
    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    }, [socketRef]);

    return {
        connect,
        sendMessage,
        disconnect,
    };
}
