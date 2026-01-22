/**
 * MediaPlayer.jsx - Spotify/YouTube/Apple Music Embed
 */

import { useState, useEffect } from 'react';

export function MediaPlayer({ service, onClose, initialUrl, onBroadcast }) {
    const [url, setUrl] = useState(initialUrl || '');
    const [embedHtml, setEmbedHtml] = useState('');

    // Sync effect: When initialUrl (from props/peers) changes, update local state and embed
    useEffect(() => {
        if (initialUrl && initialUrl !== url) {
            setUrl(initialUrl);
            generateEmbed(initialUrl);
        }
    }, [initialUrl]); // Only run when PROP changes

    const generateEmbed = (inputUrl) => {
        if (!inputUrl || !inputUrl.trim()) return;

        let html = '';
        // Spotify
        if (inputUrl.includes('open.spotify.com')) {
            const embedUrl = inputUrl.replace('open.spotify.com', 'open.spotify.com/embed');
            html = `<iframe src="${embedUrl}" width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
        }
        // YouTube
        else if (inputUrl.includes('youtube.com/watch') || inputUrl.includes('youtu.be')) {
            let videoId = '';
            if (inputUrl.includes('youtube.com/watch')) {
                videoId = new URL(inputUrl).searchParams.get('v');
            } else {
                videoId = inputUrl.split('youtu.be/')[1]?.split('?')[0];
            }
            if (videoId) {
                html = `<iframe width="100%" height="300" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }
        }
        // Apple Music
        else if (inputUrl.includes('music.apple.com')) {
            const embedUrl = inputUrl.replace('music.apple.com', 'embed.music.apple.com');
            html = `<iframe allow="autoplay *; encrypted-media *; fullscreen *" frameborder="0" height="175" style="width:100%;overflow:hidden;background:transparent;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="${embedUrl}"></iframe>`;
        }

        setEmbedHtml(html);
    };

    // Safe access to service name with extreme paranoia
    let serviceName = 'PLAYER';
    try {
        if (service && typeof service === 'string') {
            serviceName = service.toUpperCase();
        }
    } catch (e) {
        console.warn("Error processing service name:", e);
    }

    // Handlers
    const handleLoad = () => {
        try {
            if (!url.trim()) {
                alert('Please paste a URL');
                return;
            }
            generateEmbed(url);
            if (onBroadcast) {
                onBroadcast(url);
            }
        } catch (e) {
            console.error("Error in handleLoad:", e);
        }
    };

    // Icon Helper
    const getIconClass = () => {
        if (!service) return 'fa-brands fa-apple text-gray-500';
        const s = service.toLowerCase();
        if (s === 'spotify') return 'fa-brands fa-spotify text-green-500';
        if (s === 'youtube') return 'fa-brands fa-youtube text-red-500';
        return 'fa-brands fa-apple text-pink-500';
    };

    return (
        <div className="bg-white border-2 border-black brutal-shadow w-[90vw] max-w-[950px] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
                <span className="font-bold font-mono text-sm">{serviceName}</span>
                <button onClick={onClose} className="hover:text-red-500 font-bold">X</button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 px-3 py-2 border-2 border-black font-mono text-sm bg-white text-black focus:outline-none focus:bg-yellow-50"
                        placeholder="Paste Spotify/YouTube/Apple Music URL"
                        autoFocus
                    />
                    <button
                        onClick={handleLoad}
                        className="px-4 py-2 bg-black text-white font-bold uppercase text-xs hover:bg-gray-800 border-2 border-black border-l-0"
                    >
                        Load
                    </button>
                </div>

                <div className="bg-gray-100 border-2 border-black overflow-hidden min-h-[300px]">
                    {embedHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: embedHtml }} />
                    ) : (
                        <div className="flex items-center justify-center min-h-[300px] bg-white">
                            <div className="text-center">
                                <i className={`text-4xl mb-2 ${getIconClass()}`} />
                                <p className="text-xs font-mono text-gray-500">PASTE_LINK_TO_PLAY</p>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-[9px] font-mono text-gray-500 text-center">
                    Supports: open.spotify.com • youtube.com/watch • music.apple.com
                </p>
            </div>
        </div>
    );
}
