/**
 * ControlDock.jsx - Bottom Control Bar
 */

import { useState } from 'react';
import { useMediaStream } from '../hooks/useMediaStream';

export function ControlDock({ onOpenMedia, onOpenGame }) {
    const { toggleMic, toggleCamera, isMicOn, isCameraOn } = useMediaStream();
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="pixel-cloud px-6 py-4 flex items-center gap-6">
                {/* Media Buttons */}
                <div className="flex gap-3 border-r-2 border-black pr-6">
                    <button
                        onClick={() => onOpenMedia('Apple Music')}
                        className="pixel-btn btn-apple w-10 h-10 flex items-center justify-center text-lg"
                    >
                        <i className="fa-brands fa-apple" />
                    </button>
                    <button
                        onClick={() => onOpenMedia('Spotify')}
                        className="pixel-btn btn-spotify w-10 h-10 flex items-center justify-center text-lg"
                    >
                        <i className="fa-brands fa-spotify" />
                    </button>
                    <button
                        onClick={() => onOpenMedia('YouTube')}
                        className="pixel-btn btn-youtube w-10 h-10 flex items-center justify-center text-lg"
                    >
                        <i className="fa-brands fa-youtube" />
                    </button>
                    <button
                        onClick={onOpenGame}
                        className="pixel-btn btn-game w-10 h-10 flex items-center justify-center text-lg"
                    >
                        <i className="fa-solid fa-gamepad" />
                    </button>
                </div>

                {/* Call Controls */}
                <div className="flex gap-4">
                    <button
                        onClick={toggleMic}
                        className={`pixel-btn w-12 h-12 flex items-center justify-center text-xl ${!isMicOn ? 'bg-red-500 text-white' : ''}`}
                    >
                        <i className={`fa-solid ${isMicOn ? 'fa-microphone' : 'fa-microphone-slash'}`} />
                    </button>
                    <button
                        onClick={toggleCamera}
                        className={`pixel-btn w-12 h-12 flex items-center justify-center text-xl ${!isCameraOn ? 'bg-red-500 text-white' : ''}`}
                    >
                        <i className={`fa-solid ${isCameraOn ? 'fa-video' : 'fa-video-slash'}`} />
                    </button>
                    <button
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className={`pixel-btn w-12 h-12 flex items-center justify-center text-xl ${!isSpeakerOn ? 'bg-red-500 text-white' : ''}`}
                    >
                        <i className={`fa-solid ${isSpeakerOn ? 'fa-volume-high' : 'fa-volume-xmark'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
}
