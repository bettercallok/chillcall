/**
 * useMediaStream.js - Custom Hook for Camera/Microphone Access
 * 
 * WHAT THIS HOOK DOES:
 * - Requests access to camera and microphone
 * - Stores the MediaStream in context
 * - Provides functions to toggle mic/camera on/off
 * 
 * WHAT IS A MEDIASTREAM?
 * A MediaStream is a browser API object that represents audio/video data.
 * When you call getUserMedia(), the browser asks for camera permission
 * and returns a MediaStream that you can display in a <video> element.
 */

import { useCallback, useState } from 'react';
import { useCall } from '../context/CallContext';

export function useMediaStream() {
    const { localStreamRef } = useCall();
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    // Request camera and microphone access
    const initializeMedia = useCallback(async () => {
        try {
            // navigator.mediaDevices.getUserMedia() prompts user for permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Store in ref so other components can access it
            localStreamRef.current = stream;

            return stream;
        } catch (error) {
            console.warn('Camera access denied:', error);
            // Return null but don't fail - allow demo mode
            return null;
        }
    }, [localStreamRef]);

    // Toggle microphone on/off
    const toggleMic = useCallback(() => {
        if (localStreamRef.current) {
            // MediaStreamTrack.enabled controls whether track is active
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    }, [localStreamRef]);

    // Toggle camera on/off
    const toggleCamera = useCallback(() => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    }, [localStreamRef]);

    // Stop all tracks (cleanup)
    const stopMedia = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
    }, [localStreamRef]);

    return {
        initializeMedia,
        toggleMic,
        toggleCamera,
        stopMedia,
        isMicOn,
        isCameraOn,
        localStream: localStreamRef.current,
    };
}
