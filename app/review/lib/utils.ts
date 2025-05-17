// app/projects/[projectId]/review/[trackId]/lib/media-utils.ts
export const isYoutubeLink = (url: string) => /youtu\.?be/.test(url);

export const isVideoFile = (url: string) =>
  /\.(mp4|webm|ogg|mov|avi|mkv|wmv)$/i.test(url);
export const isAudioFile = (url: string) =>
  /\.(mp3|wav|ogg|aac|flac)$/i.test(url);

export const getYouTubeEmbedUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    let videoId = urlObj.searchParams.get("v");
    if (!videoId && urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.substring(1);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (e) {
    console.error("Error parsing YouTube URL:", e);
    return null;
  }
};

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
export const isGoogleDriveLink = (url: string) =>
  /drive\.google\.com\/file\/d\/([^\/]+)/.test(url);

export const getGoogleDriveEmbedUrl = (url: string) => {
  const match = url.match(/drive\.google\.com\/file\/d\/([^\/]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
};

export const isDropboxLink = (url: string) =>
  /dropbox\.com\/(scl\/fi|s)\/[^\/]+\/[^\/?]+\.(mp4|mov|avi|mkv|webm)/i.test(
    url
  );

export const getDropboxDirectUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.searchParams.set("raw", "1"); // Adds or updates `raw`
    return parsedUrl.toString();
  } catch {
    return url; // Fallback in case the URL is malformed
  }
};
export const isVimeoLink = (url: string) =>
  /vimeo\.com\/(video\/)?(\d+)/i.test(url);

export const getVimeoEmbedUrl = (url: string) => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  return null;
};
