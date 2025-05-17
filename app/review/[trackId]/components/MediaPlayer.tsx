// app/projects/[projectId]/review/[trackId]/components/MediaPlayer.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";

// Global declarations for player APIs
declare global {
  interface Window {
    Vimeo: {
      Player: any;
    };
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Common props interface
interface BasePlayerProps {
  setCurrentTime: (time: number) => void;
}

// Vimeo specific props
interface VimeoPlayerProps extends BasePlayerProps {
  vimeoEmbedUrl: string;
}

export const VimeoPlayer: React.FC<VimeoPlayerProps> = ({
  vimeoEmbedUrl,
  setCurrentTime,
}) => {
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    // Load Vimeo Player API script
    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (iframeRef.current) {
        playerRef.current = new window.Vimeo.Player(iframeRef.current);

        playerRef.current.ready().then(() => {
          setPlayerReady(true);
        });

        playerRef.current.on("timeupdate", (data: any) => {
          setCurrentTime(data.seconds);
        });
      }
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      document.body.removeChild(script);
    };
  }, [setCurrentTime]);

  return (
    <div className="aspect-video">
      <iframe
        ref={iframeRef}
        src={`${vimeoEmbedUrl}?api=1`}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      ></iframe>
      {!playerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-white">Loading player...</span>
        </div>
      )}
    </div>
  );
};

// YouTube specific props
interface YouTubePlayerProps extends BasePlayerProps {
  youtubeEmbedUrl: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  youtubeEmbedUrl,
  setCurrentTime,
}) => {
  const playerRef = useRef<YT.Player | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Extract video ID from embed URL
  const videoId = youtubeEmbedUrl.split("/").pop()?.split("?")[0] || "";

  useEffect(() => {
    // Load YouTube IFrame API script if not already loaded
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  const initializePlayer = () => {
    playerRef.current = new window.YT.Player("youtube-player", {
      videoId: videoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
      playerVars: {
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0,
      },
    });
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    // Player is ready
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.PLAYING) {
      // Start tracking time when video plays
      intervalRef.current = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      }, 500); // Update every 500ms for better accuracy
    } else {
      // Clear interval when paused or ended
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  return (
    <div className="aspect-video">
      <div id="youtube-player" className="w-full h-full" />
    </div>
  );
};

// Google Drive specific props
interface GoogleDrivePlayerProps extends BasePlayerProps {
  googleDriveEmbedUrl: string;
}

export const GoogleDrivePlayer: React.FC<GoogleDrivePlayerProps> = ({
  googleDriveEmbedUrl,
  setCurrentTime,
}) => {
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === "https://drive.google.com" && event.data) {
        if (event.data.type === "timeupdate") {
          setCurrentTime(event.data.currentTime);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [setCurrentTime]);

  return (
    <div className="aspect-video">
      <iframe
        src={googleDriveEmbedUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay"
        onLoad={() => setPlayerReady(true)}
      ></iframe>
      {!playerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-white">Loading player...</span>
        </div>
      )}
    </div>
  );
};

// HTML5 Video player props
interface VideoPlayerProps extends BasePlayerProps {
  url: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  handleTimeUpdate: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  videoRef,
  handleTimeUpdate,
}) => {
  return (
    <div className="aspect-video">
      <video
        ref={videoRef}
        className="w-full h-full block"
        controls
        onTimeUpdate={handleTimeUpdate}
        src={url}
      >
        Your browser does not support video.
      </video>
    </div>
  );
};

// Image viewer component
interface ImageViewerProps {
  url: string;
  altText: string;
  openFullscreen: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  url,
  altText,
  openFullscreen,
}) => {
  return (
    <div
      className="p-2 flex justify-center items-center bg-black cursor-pointer"
      onClick={openFullscreen}
    >
      <img
        src={url}
        alt={altText}
        style={{
          maxWidth: "100%",
          height: "auto",
          display: "block",
        }}
      />
    </div>
  );
};

// Media fallback component
interface MediaFallbackProps {
  url: string;
}

export const MediaFallback: React.FC<MediaFallbackProps> = ({ url }) => {
  return (
    <div className="p-6 bg-secondary flex flex-col items-center text-center justify-center h-full aspect-video">
      <div className="w-10 h-10 text-muted-foreground mb-3">⚠️</div>
      <p className="font-medium mb-1">Cannot preview content.</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline font-medium text-sm inline-flex items-center gap-1"
      >
        View/Download
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M7 17L17 7M17 7H8M17 7V16" />
        </svg>
      </a>
    </div>
  );
};
