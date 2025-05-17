// app/projects/[projectId]/review/[trackId]/components/MediaContainer.tsx

"use client";

import React, { useRef, useState } from "react";
import { ExternalLink, Camera } from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  VimeoPlayer,
  YouTubePlayer,
  GoogleDrivePlayer,
  VideoPlayer,
  ImageViewer,
  MediaFallback,
} from "./MediaPlayer";
import {
  isVimeoLink,
  isYoutubeLink,
  isGoogleDriveLink,
  isDropboxLink,
  isVideoFile,
  isAudioFile,
  getVimeoEmbedUrl,
  getYouTubeEmbedUrl,
  getGoogleDriveEmbedUrl,
  getDropboxDirectUrl,
} from "../../lib/utils";
import { RevButtons } from "@/components/ui/RevButtons";
import { toast } from "@/hooks/use-toast";

interface MediaContainerProps {
  deliverableLink: string;
  deliverableMediaType?: "video" | "image" | null;
  projectTitle: string;
  roundNumber: number;
  setCurrentTime: (time: number) => void;
  onScreenshotCapture?: (file: File) => void;
}

export const MediaContainer: React.FC<MediaContainerProps> = ({
  deliverableLink,
  deliverableMediaType,
  projectTitle,
  roundNumber,
  setCurrentTime,
  onScreenshotCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const altText = `Deliverable for ${projectTitle} - Round ${roundNumber}`;

  const googleDriveEmbedUrl = isGoogleDriveLink(deliverableLink)
    ? getGoogleDriveEmbedUrl(deliverableLink)
    : null;
  const youtubeEmbedUrl = isYoutubeLink(deliverableLink)
    ? getYouTubeEmbedUrl(deliverableLink)
    : null;
  const vimeoEmbedUrl = isVimeoLink(deliverableLink)
    ? getVimeoEmbedUrl(deliverableLink)
    : null;
  const dropboxDirectUrl = isDropboxLink(deliverableLink)
    ? getDropboxDirectUrl(deliverableLink)
    : null;
  const isVideo = isVideoFile(deliverableLink);
  const isImage = deliverableMediaType === "image";

  const isVideoPlayerNeededByURL =
    isVideo ||
    !!youtubeEmbedUrl ||
    !!vimeoEmbedUrl ||
    !!googleDriveEmbedUrl ||
    !!dropboxDirectUrl;

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Function to capture screenshot
  const captureScreenshot = async () => {
    if (!containerRef.current || isCapturingScreenshot || !onScreenshotCapture)
      return;

    setIsCapturingScreenshot(true);

    try {
      // Pause video if playing
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture screenshot using html2canvas
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: window.devicePixelRatio || 1,
        logging: false,
      });

      // Convert to blob
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            // Check if file size is too large
            if (blob.size > 5 * 1024 * 1024) {
              toast({
                title: "Screenshot Too Large",
                description: "Reducing quality to fit size limit",
                variant: "warning",
              });

              // Reduce quality
              const reducedCanvas = document.createElement("canvas");
              const ctx = reducedCanvas.getContext("2d");
              reducedCanvas.width = canvas.width * 0.75;
              reducedCanvas.height = canvas.height * 0.75;
              ctx.drawImage(
                canvas,
                0,
                0,
                reducedCanvas.width,
                reducedCanvas.height
              );

              // Try again with reduced quality
              reducedCanvas.toBlob(
                (reducedBlob) => {
                  if (reducedBlob) {
                    const file = new File(
                      [reducedBlob],
                      `screenshot-${Date.now()}.png`,
                      { type: "image/png" }
                    );
                    onScreenshotCapture(file);

                    toast({
                      title: "Screenshot Captured",
                      description: "Added to your feedback",
                      variant: "success",
                    });
                  }
                },
                "image/png",
                0.7
              );
            } else {
              // Use the original quality
              const file = new File([blob], `screenshot-${Date.now()}.png`, {
                type: "image/png",
              });
              onScreenshotCapture(file);

              toast({
                title: "Screenshot Captured",
                description: "Added to your feedback",
                variant: "success",
              });
            }
          } else {
            throw new Error("Failed to create screenshot");
          }
        },
        "image/png",
        0.9
      );

      // Resume video if it was playing
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Screenshot error:", error);
      toast({
        title: "Screenshot Failed",
        description: "Could not capture content",
        variant: "destructive",
      });
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  // Render the appropriate media content
  const renderMedia = () => {
    if (deliverableMediaType === "image") {
      return (
        <ImageViewer
          url={deliverableLink}
          altText={altText}
          openFullscreen={() => setImageDialogOpen(true)}
        />
      );
    }

    if (deliverableMediaType === "video" || isVideoPlayerNeededByURL) {
      if (youtubeEmbedUrl) {
        return (
          <YouTubePlayer
            youtubeEmbedUrl={youtubeEmbedUrl}
            setCurrentTime={setCurrentTime}
          />
        );
      } else if (vimeoEmbedUrl) {
        return (
          <VimeoPlayer
            vimeoEmbedUrl={vimeoEmbedUrl}
            setCurrentTime={setCurrentTime}
          />
        );
      } else if (googleDriveEmbedUrl) {
        return (
          <GoogleDrivePlayer
            googleDriveEmbedUrl={googleDriveEmbedUrl}
            setCurrentTime={setCurrentTime}
          />
        );
      } else if (dropboxDirectUrl || isVideo) {
        const videoUrl = dropboxDirectUrl || deliverableLink;
        return (
          <VideoPlayer
            url={videoUrl}
            videoRef={videoRef}
            handleTimeUpdate={handleTimeUpdate}
            setCurrentTime={setCurrentTime}
          />
        );
      }
    }

    return <MediaFallback url={deliverableLink} />;
  };

  const getMediaLabel = () => {
    if (youtubeEmbedUrl) return "YouTube Video";
    if (vimeoEmbedUrl) return "Vimeo Video";
    if (googleDriveEmbedUrl) return "Google Drive";
    if (dropboxDirectUrl) return "Dropbox";
    if (isVideo) return "Video";
    if (isImage) return "Image";
    return "External Content";
  };

  return (
    <div
      className="rounded-lg overflow-hidden border bg-muted/10 relative"
      ref={containerRef}
      id="media-container"
    >
      {/* Header with media info */}
      <div className="p-2 bg-background flex justify-between items-center">
        <span className="text-xs">{getMediaLabel()}</span>

        <div className="flex items-center gap-2">
          {/* Screenshot button */}
          {onScreenshotCapture && (
            <RevButtons
              variant="outline"
              size="sm"
              onClick={captureScreenshot}
              disabled={isCapturingScreenshot}
            >
              {isCapturingScreenshot ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Camera className="w-4 h-4 mr-1" />
              )}
              <span className="text-xs">Screenshot</span>
            </RevButtons>
          )}

          {/* View original button */}
          <a
            href={deliverableLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <span className="text-xs">Original</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Media content */}
      {renderMedia()}

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-6xl w-[95vw] p-4 max-h-[95vh]">
          <DialogHeader className="flex flex-row justify-between items-center p-2"></DialogHeader>
          <div className="overflow-auto flex justify-center items-center bg-black border-2 border-dashed rounded-md max-h-[calc(95vh-100px)]">
            <img
              src={deliverableLink}
              alt={altText}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
              className="h-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};