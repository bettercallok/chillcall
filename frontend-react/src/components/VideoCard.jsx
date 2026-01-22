/**
 * VideoCard.jsx - Individual Video Display
 * 
 * PROPS:
 * Props are inputs passed to a component from its parent, like function arguments.
 * 
 * Example usage:
 *   <VideoCard stream={myVideoStream} label="LOCAL" slotNumber={1} />
 * 
 * Inside the component, we receive these as: { stream, label, slotNumber }
 */

import { useEffect, useRef } from 'react';

export function VideoCard({ stream, label = 'REMOTE', slotNumber = 1, isLocal = false }) {
    // useRef gives us a reference to the actual DOM element
    // We need this to set video.srcObject, which can't be done through JSX
    const videoRef = useRef(null);

    // useEffect runs AFTER the component renders
    // When 'stream' changes, we update the video element's srcObject
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            // Explicitly try to play to avoid "black screen" on some browsers
            videoRef.current.play().catch(e => console.warn("Video play blocked:", e));
        }
    }, [stream]); // Dependency array: re-run when 'stream' changes

    return (
        <div className="video-card relative bg-white border-2 border-black overflow-hidden aspect-video shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Label */}
            <div className="absolute top-2 left-2 z-10 bg-black text-white px-2 py-1 text-[10px] font-bold font-mono">
                {label} // CAM_0{slotNumber}
            </div>

            {/* Video Element */}
            {stream ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal} // Mute local video to prevent echo
                    className="w-full h-full object-cover"
                />
            ) : (
                // Placeholder when no stream
                <div className="w-full h-full flex items-center justify-center bg-white">
                    <span className="text-gray-400 text-xs font-mono tracking-widest">NO_SIGNAL</span>
                </div>
            )}
        </div>
    );
}
