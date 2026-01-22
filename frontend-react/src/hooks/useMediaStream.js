/**
 * useMediaStream.js - manages local stream/mic/camera toggles
 */

import { useState } from 'react';
import { useCall } from '../context/CallContext';

export function useMediaStream() {
    const { localStreamRef } = useCall();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    const toggleMic = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicOn(prev => !prev);
        }
    };

    const toggleCamera = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOn(prev => !prev);
        }
    };

    return {
        toggleMic,
        toggleCamera,
        isMicOn,
        isCameraOn
    };
}
