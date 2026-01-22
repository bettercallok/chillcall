/**
 * AppScreen.jsx - Main Video Call Interface
 * 
 * This is the main screen shown after connecting to a room.
 * It contains the video grid, chat sidebar, and control dock.
 */

import { useState, useEffect, useRef } from 'react';
import { useCall } from '../context/CallContext';
import { VideoCard } from './VideoCard';
import { ChatSidebar } from './ChatSidebar';
import { ControlDock } from './ControlDock';
import { MediaPlayer } from './MediaPlayer';
import { GameCenter } from './GameCenter';

export function AppScreen() {
    const { roomId, localStream, remoteStreams, publishData, mediaError } = useCall();
    const [currentMediaUrl, setCurrentMediaUrl] = useState('');
    const [currentMediaService, setCurrentMediaService] = useState('Spotify');
    const [showMediaPlayer, setShowMediaPlayer] = useState(false);
    const [showGameCenter, setShowGameCenter] = useState(false);

    const [showMobileChat, setShowMobileChat] = useState(false);

    // Draggable positions state (default positions)
    const [positions, setPositions] = useState({
        local: { x: 20, y: 20 },
        remote0: { x: window.innerWidth - 300, y: 20 },
        remote1: { x: 20, y: window.innerHeight - 300 },
        remote2: { x: window.innerWidth - 300, y: window.innerHeight - 300 }
    });

    // Refs for drag state (avoids re-renders during drag)
    const dragRefs = {
        local: useRef(null),
        remote0: useRef(null),
        remote1: useRef(null),
        remote2: useRef(null)
    };

    const handleDragStart = (e, key) => {
        // Only allow dragging if media is active
        if (!showMediaPlayer && !showGameCenter) return;

        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startPos = positions[key] || { x: 0, y: 0 };
        const element = dragRefs[key].current;

        if (!element) return;

        // Add dragging class
        element.classList.add('z-50', 'pointer-events-none'); // Raise z-index

        const handleMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            // Direct DOM update for performance
            element.style.left = `${startPos.x + dx}px`;
            element.style.top = `${startPos.y + dy}px`;
        };

        const handleMouseUp = (upEvent) => {
            // Commit final position to React state
            const dx = upEvent.clientX - startX;
            const dy = upEvent.clientY - startY;

            setPositions(prev => ({
                ...prev,
                [key]: { x: startPos.x + dx, y: startPos.y + dy }
            }));

            element.classList.remove('z-50', 'pointer-events-none');

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Listen for incoming sync events
    useEffect(() => {
        const handleMessage = (e) => {
            try {
                const msg = e.detail;
                console.log("[AppScreen] Processing message:", msg);

                // Media Session Sync
                if (msg.type === 'media_session') {
                    if (msg.action === 'open') {
                        setCurrentMediaService(msg.service || 'Spotify');
                        setCurrentMediaUrl(msg.url || '');
                        setShowMediaPlayer(true);
                        setShowGameCenter(false);
                    } else if (msg.action === 'close') {
                        setShowMediaPlayer(false);
                        setCurrentMediaUrl('');
                    }
                }

                // Game Session Sync
                if (msg.type === 'game_session') {
                    if (msg.action === 'open') {
                        setShowGameCenter(true);
                        setShowMediaPlayer(false);
                    } else if (msg.action === 'close') {
                        setShowGameCenter(false);
                    }
                }
            } catch (err) {
                console.error("[AppScreen] Error handling message:", err);
            }
        };

        window.addEventListener('chillcall_message', handleMessage);
        return () => window.removeEventListener('chillcall_message', handleMessage);
    }, []);

    const handleOpenMedia = (service) => {
        console.log("[AppScreen] Opening Media Locally:", service);
        setCurrentMediaService(service);
        setShowMediaPlayer(true);
        setShowGameCenter(false);

        // Broadcast immediately to peers so their player opens too
        publishData({
            type: 'media_session',
            action: 'open',
            service: service,
            url: '' // Empty URL just opens the panel
        });
    };

    const handleBroadcastMedia = (url) => {
        console.log("[AppScreen] Broadcasting Media:", url);
        setCurrentMediaUrl(url);
        // Broadcast to peers
        publishData({
            type: 'media_session',
            action: 'open',
            service: currentMediaService,
            url: url
        });
    };

    const handleCloseMedia = () => {
        console.log("[AppScreen] Closing Media");
        setShowMediaPlayer(false);
        setCurrentMediaUrl('');
        // Broadcast close
        publishData({
            type: 'media_session',
            action: 'close'
        });
    };

    const handleOpenGame = () => {
        console.log("[AppScreen] Opening Game Locally");
        setShowGameCenter(true);
        setShowMediaPlayer(false);

        // Broadcast game open
        publishData({
            type: 'game_session',
            action: 'open'
        });
    };

    const handleCloseGame = () => {
        console.log("[AppScreen] Closing Game");
        setShowGameCenter(false);

        // Broadcast game close
        publishData({
            type: 'game_session',
            action: 'close'
        });
    };

    // Get remote streams as array for rendering
    const remoteStreamEntries = Object.entries(remoteStreams);
    const isMediaActive = showMediaPlayer || showGameCenter;

    return (
        <div className="absolute inset-0 z-30 p-2 md:p-4 flex flex-col gap-4 bg-transparent">
            {/* Permission Error Banner */}
            {mediaError && (
                <div className="bg-red-600 text-white p-2 font-mono text-xs font-bold text-center border-2 border-black">
                    ⚠️ CAMERA_ACCESS_DENIED: Please allow camera/microphone access in your browser address bar and reload.
                </div>
            )}

            {/* Header */}
            <header className="w-full bg-white border-2 border-black brutal-shadow p-3 md:p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg md:text-xl font-bold uppercase tracking-tight">Mainframe_View</h1>
                </div>
                <div className="flex items-center gap-2 md:gap-4 text-xs">
                    {/* Mobile Chat Toggle */}
                    <button
                        onClick={() => setShowMobileChat(!showMobileChat)}
                        className="md:hidden pixel-btn px-2 py-1 text-[10px] font-bold"
                    >
                        {showMobileChat ? 'CLOSE_CHAT' : 'CHAT'}
                    </button>

                    <span className="font-mono">FREQ:</span>
                    <span className="bg-black text-white px-2 py-1 font-mono text-[10px] md:text-xs truncate max-w-[150px] md:max-w-none">
                        {roomId?.toUpperCase() || 'CONNECTING...'}
                    </span>
                    <button
                        onClick={() => navigator.clipboard.writeText(roomId)}
                        className="pixel-btn px-2 py-1 text-[10px] font-bold"
                    >
                        [ COPY ]
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className={`flex-1 overflow-hidden min-h-0 relative flex gap-4 ${isMediaActive ? 'media-active' : ''}`}>

                {/* Video Stage */}
                <div className={`flex-1 relative transition-all duration-500 ease-in-out ${isMediaActive ? '' : 'grid grid-cols-2 grid-rows-2 gap-3'}`}>

                    {/* Floating Media/Game Overlays - NOW INSIDE STAGE and BEHIND VIDEOS */}
                    {(showMediaPlayer || showGameCenter) && (
                        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-auto">
                            {/* z-0 ensures it is behind z-10 video cards */}
                            {showMediaPlayer && (
                                <MediaPlayer
                                    service={currentMediaService}
                                    initialUrl={currentMediaUrl}
                                    onBroadcast={handleBroadcastMedia}
                                    onClose={handleCloseMedia}
                                />
                            )}

                            {showGameCenter && (
                                <GameCenter onClose={handleCloseGame} />
                            )}
                        </div>
                    )}

                    {/* Local Video */}
                    <div
                        ref={dragRefs.local}
                        onMouseDown={isMediaActive ? (e) => handleDragStart(e, 'local') : null}
                        style={isMediaActive ? { left: positions.local.x, top: positions.local.y, position: 'absolute', width: '240px', height: '180px', zIndex: 10, cursor: 'grab' } : {}}
                        className={`${!isMediaActive ? 'w-full h-full transition-all duration-300' : 'shadow-xl'}`}
                    >
                        <VideoCard
                            stream={localStream}
                            label="LOCAL"
                            slotNumber={1}
                            isLocal={true}
                        />
                    </div>

                    {/* Remote Videos */}
                    {[0, 1, 2].map((index) => {
                        const [peerId, stream] = remoteStreamEntries[index] || [null, null];
                        const key = `remote${index}`;
                        const pos = positions[key] || { x: 0, y: 0 };

                        return (
                            <div
                                key={peerId || `slot-${index}`}
                                ref={dragRefs[`remote${index}`]}
                                onMouseDown={isMediaActive ? (e) => handleDragStart(e, key) : null}
                                style={isMediaActive ? { left: pos.x, top: pos.y, position: 'absolute', width: '240px', height: '180px', zIndex: 10, cursor: 'grab' } : {}}
                                className={`${!isMediaActive ? 'w-full h-full transition-all duration-300' : 'shadow-xl'}`}
                            >
                                <VideoCard
                                    stream={stream}
                                    label="REMOTE"
                                    slotNumber={index + 2}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Chat Sidebar - Desktop (hidden on mobile, block on md) */}
                <div className="w-80 shrink-0 hidden md:block h-full">
                    <ChatSidebar />
                </div>

                {/* Chat Sidebar - Mobile Overlay */}
                {showMobileChat && (
                    <div className="absolute inset-0 z-50 md:hidden">
                        <ChatSidebar />
                    </div>
                )}
            </div>

            {/* Control Dock */}
            <ControlDock
                onOpenMedia={handleOpenMedia}
                onOpenGame={handleOpenGame}
            />
        </div>
    );
}
