/**
 * VideoCard.jsx - Individual Video Stream
 */

import { useState } from 'react';

export function VideoCard({ stream, label, slotNumber, isLocal }) {
    return (
        <div className="w-full h-full bg-black border-2 border-black p-1 relative group bg-grid">
            {/* Header */}
            <div className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] font-bold px-2 py-0.5 border border-white">
                {label} // CAM_{String(slotNumber).padStart(2, '0')}
            </div>

            {/* Video Element */}
            {stream ? (
                <video
                    ref={(el) => {
                        if (el && stream) el.srcObject = stream;
                    }}
                    autoPlay
                    playsInline
                    muted={isLocal} // Mute local video to prevent feedback
                    className="w-full h-full object-cover grayscale-0 contrast-125 transition-all duration-300"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <span className="text-2xl animate-pulse">NO_SIGNAL</span>
                    <div className="w-16 h-1 bg-gray-600 animate-pulse"></div>
                </div>
            )}

            {/* Overlay Grid (CRT Effect) */}
            <div className={`absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]`} />
        </div>
    );
}
