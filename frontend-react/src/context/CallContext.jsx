/**
 * CallContext.jsx - Global State Management
 */

import { createContext, useContext, useState, useRef, useEffect } from 'react';

// 1. Create the Context object
const CallContext = createContext(null);

// 2. Create a Provider component that wraps the app
export function CallProvider({ children }) {
    // --- STATE ---
    const [roomId, setRoomId] = useState(null);
    const [userId, setUserId] = useState('User-' + Math.floor(Math.random() * 99999));
    const [isConnected, setIsConnected] = useState(false);
    const [chatMessages, setChatMessages] = useState([{ text: 'Ready.', sender: 'SYS' }]);
    const [remoteStreams, setRemoteStreams] = useState({}); // { peerId: MediaStream }
    const [localStream, setLocalStream] = useState(null); // React state for UI rendering
    const [mediaError, setMediaError] = useState(null); // Capture permission errors

    // --- REFS ---
    const socketRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnectionsRef = useRef({});
    const dataChannelsRef = useRef({});

    useEffect(() => {
        // Initialize Media Stream on startup
        const startStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream; // Update ref for WebRTC logic
                setLocalStream(stream); // Update state for UI
                setMediaError(null);
            } catch (err) {
                console.error("Failed to get user media", err);
                setMediaError(err.name); // 'NotAllowedError', 'NotFoundError', etc.
            }
        };
        startStream();
    }, []);

    // --- HELPER FUNCTIONS ---
    const addChatMessage = (text, sender = 'SYSTEM') => {
        setChatMessages(prev => [...prev, { text, sender }]);
    };

    const addRemoteStream = (peerId, stream) => {
        setRemoteStreams(prev => ({ ...prev, [peerId]: stream }));
    };

    const removeRemoteStream = (peerId) => {
        setRemoteStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[peerId];
            return newStreams;
        });
        if (peerConnectionsRef.current[peerId]) {
            peerConnectionsRef.current[peerId].close();
            delete peerConnectionsRef.current[peerId];
        }
    };

    // --- WEBRTC LOGIC ---
    const createPeerConnection = (peerId, isInitiator) => {
        if (peerConnectionsRef.current[peerId]) return;

        console.log(`[WebRTC] Creating PeerConnection for ${peerId} (Initiator: ${isInitiator})`);

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Add local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.send(JSON.stringify({
                    type: 'ice_candidate',
                    target: peerId,
                    candidate: event.candidate
                }));
            }
        };

        // Handle Remote Stream
        pc.ontrack = (event) => {
            console.log(`[WebRTC] Received Remote Stream from ${peerId}`);
            addRemoteStream(peerId, event.streams[0]);
        };

        peerConnectionsRef.current[peerId] = pc;

        // --- DATA CHANNEL SETUP ---
        const setupDc = (dc) => {
            dc.onopen = () => console.log(`[DataChannel] Open with ${peerId}`);
            dc.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    // Dispatch to global listener
                    window.dispatchEvent(new CustomEvent('chillcall_message', { detail: msg }));

                    // Internal handlers for chat (legacy, though chat can now listen event too)
                    if (msg.type === 'chat') {
                        addChatMessage(msg.text, msg.sender);
                    }
                } catch (e) {
                    console.error('DC Message Error:', e);
                }
            };
            dataChannelsRef.current[peerId] = dc;
        };

        if (isInitiator) {
            const dc = pc.createDataChannel("chillcall_data");
            setupDc(dc);
        } else {
            pc.ondatachannel = (event) => {
                setupDc(event.channel);
            };
        }

        if (isInitiator) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    if (socketRef.current) {
                        socketRef.current.send(JSON.stringify({
                            type: 'offer',
                            target: peerId,
                            sdp: pc.localDescription
                        }));
                    }
                })
                .catch(e => console.error('Error creating offer:', e));
        }

        return pc;
    };

    const handleOffer = async (msg) => {
        const pc = createPeerConnection(msg.from, false); // Not initiator
        if (!pc) return;

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (socketRef.current) {
                socketRef.current.send(JSON.stringify({
                    type: 'answer',
                    target: msg.from,
                    sdp: pc.localDescription
                }));
            }
        } catch (e) {
            console.error('Error handling offer:', e);
        }
    };

    const handleAnswer = async (msg) => {
        const pc = peerConnectionsRef.current[msg.from];
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            } catch (e) {
                console.error('Error handling answer:', e);
            }
        }
    };

    const handleCandidate = async (msg) => {
        const pc = peerConnectionsRef.current[msg.from];
        if (pc) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            } catch (e) {
                console.error('Error adding ICE candidate:', e);
            }
        }
    };

    // Public method to be called by LandingScreen when joining a room
    const connectToPeers = (participants) => {
        console.log('[WebRTC] Connecting to existing peers:', participants);
        participants.forEach(p => {
            // p is { sessionId: "...", userId: "..." }
            createPeerConnection(p.sessionId, true);
        });
    };

    // --- SOCKET LISTENER (Main Handler) ---
    // This attaches to the socket ONCE connected to handle signaling
    const setupSocketListeners = () => {
        if (!socketRef.current) return;

        socketRef.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            console.log('[Signaling] RX:', msg.type);

            switch (msg.type) {
                case 'participant_joined':
                    addChatMessage(`Peer ${msg.userId} Joined`);
                    break;

                case 'participant_left':
                    addChatMessage(`Peer ${msg.userId} Left`);
                    removeRemoteStream(msg.sessionId);
                    break;

                case 'offer':
                    handleOffer(msg);
                    break;

                case 'answer':
                    handleAnswer(msg);
                    break;

                case 'ice_candidate':
                    handleCandidate(msg);
                    break;
            }
        };
    };

    // --- DATA CHANNEL ACTIONS ---
    const publishData = (message) => {
        const payload = JSON.stringify(message);
        console.log(`[DataChannel] Broadcasting:`, message);
        Object.values(dataChannelsRef.current).forEach(dc => {
            if (dc.readyState === 'open') {
                dc.send(payload);
            }
        });
    };

    // 3. The value object contains everything we want to share
    const value = {
        // State
        roomId, setRoomId,
        userId, setUserId,
        isConnected, setIsConnected,
        chatMessages, addChatMessage,
        remoteStreams, addRemoteStream, removeRemoteStream,
        localStream, setLocalStream,
        mediaError, // Exposed error state

        // Refs (for WebRTC)
        socketRef,
        localStreamRef,
        peerConnectionsRef,
        // Actions
        connectToPeers,
        setupSocketListeners,
        publishData
    };

    // 4. Provider wraps children and passes value to all descendants
    return (
        <CallContext.Provider value={value}>
            {children}
        </CallContext.Provider>
    );
}

// 5. Custom hook to easily access the context
export function useCall() {
    const context = useContext(CallContext);
    if (!context) {
        throw new Error('useCall must be used within a CallProvider');
    }
    return context;
}
