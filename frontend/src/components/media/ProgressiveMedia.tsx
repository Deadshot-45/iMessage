import React, { useState } from "react";
import {
  Download,
  Maximize2,
  Trash2,
  Play,
  Loader2,
  Video as VideoIcon,
} from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";

interface ProgressiveMediaProps {
  mediaUrl: string;
  mediaType: "image" | "video" | "audio" | "gif" | string;
  thumbnailUrl?: string;
  mediaSize?: number;
  mediaDuration?: number;
  isSentByMe: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  isDeleted?: boolean;
  onOpenFullscreen: (url: string, type: string) => void;
  onDeleteMessage?: () => void;
}

export const ProgressiveMedia: React.FC<ProgressiveMediaProps> = ({
  mediaUrl,
  mediaType = "image",
  thumbnailUrl,
  mediaSize,
  mediaDuration,
  isSentByMe,
  isUploading = false,
  uploadProgress,
  isDeleted = false,
  onOpenFullscreen,
  onDeleteMessage,
}) => {
  // Senders immediately see full unblurred media; receivers start in undownloaded blurred state
  const [isDownloaded, setIsDownloaded] = useState<boolean>(isSentByMe);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  if (isDeleted) {
    return (
      <div className="flex items-center gap-1.5 py-1 px-2 text-xs italic opacity-60">
        <span>🚫 This message was deleted</span>
      </div>
    );
  }

  // Audio has its dedicated audio player
  if (mediaType === "audio") {
    return <AudioPlayer src={mediaUrl} isMe={isSentByMe} />;
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloaded || isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(25);

    try {
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 25;
        });
      }, 100);

      const response = await fetch(mediaUrl);
      await response.blob();
      clearInterval(interval);
      setDownloadProgress(100);
      setIsDownloaded(true);
    } catch {
      // Fallback
      setIsDownloaded(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return "176 kB";
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return "0:30";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const backgroundSrc = thumbnailUrl || mediaUrl;

  return (
    <div className="relative group rounded-xl overflow-hidden max-w-full bg-black/10 dark:bg-black/30 select-none">
      {/* Uploading State for Sender */}
      {isUploading ? (
        <div className="relative w-[240px] h-[200px] bg-black/40 flex flex-col items-center justify-center gap-2 backdrop-blur-md rounded-xl">
          <Loader2 size={26} className="animate-spin text-white" />
          <span className="text-xs text-white font-medium">
            Uploading {uploadProgress ? `${uploadProgress}%` : "..."}
          </span>
          {uploadProgress !== undefined && (
            <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      ) : isDownloaded ? (
        /* Downloaded Crisp Media */
        <div className="relative overflow-hidden rounded-xl">
          {mediaType === "video" ? (
            <video
              src={mediaUrl}
              controls
              className="max-w-full max-h-[260px] rounded-xl object-cover bg-black"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Media attachment"
              className="max-w-full max-h-[260px] rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => onOpenFullscreen(mediaUrl, mediaType)}
            />
          )}

          {/* Corner Actions Overlay (Fullscreen + Delete) */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1 rounded-lg z-10">
            <button
              type="button"
              title="Full Screen Preview"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFullscreen(mediaUrl, mediaType);
              }}
              className="p-1 rounded-md hover:bg-white/20 text-white cursor-pointer transition-colors border-0 outline-none"
            >
              <Maximize2 size={14} />
            </button>

            {isSentByMe && onDeleteMessage && (
              <button
                type="button"
                title="Delete Media"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMessage();
                }}
                className="p-1 rounded-md hover:bg-red-500/80 text-white cursor-pointer transition-colors border-0 outline-none"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Receiver Blurred Placeholder (Before Download - WhatsApp Style) */
        <div
          className="relative min-w-[220px] max-w-[280px] h-[240px] flex items-center justify-center overflow-hidden rounded-xl cursor-pointer"
          onClick={handleDownload}
        >
          {/* Blurred Background: Image or Video Frame Snapshot */}
          {mediaType === "video" ? (
            thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Video Thumbnail"
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl brightness-75"
              />
            ) : (
              <video
                src={`${mediaUrl}#t=0.1`}
                preload="metadata"
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl brightness-75 pointer-events-none"
              />
            )
          ) : (
            <img
              src={backgroundSrc}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl brightness-75"
            />
          )}

          {/* Semi-transparent dark overlay */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" />

          {/* Center Download Pill for Images/GIFs or Play Button for Videos */}
          {mediaType === "video" ? (
            <div className="relative z-10 flex flex-col items-center gap-2">
              <button
                type="button"
                disabled={isDownloading}
                className="size-12 rounded-full bg-black/60 hover:bg-black/75 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 size={20} className="animate-spin text-blue-400" />
                ) : (
                  <Play size={20} className="ml-0.5 text-white fill-white" />
                )}
              </button>
              <span className="text-[10px] text-white/80 font-medium bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {formatFileSize(mediaSize)}
              </span>
            </div>
          ) : (
            /* WhatsApp-style Center Pill for Image */
            <div className="relative z-10">
              <button
                type="button"
                disabled={isDownloading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/65 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white shadow-2xl transition-all active:scale-95 cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 size={16} className="animate-spin text-blue-400 shrink-0" />
                ) : (
                  <Download size={16} className="text-white shrink-0" />
                )}
                <span className="text-xs font-semibold tracking-wide">
                  {isDownloading ? `${downloadProgress}%` : formatFileSize(mediaSize)}
                </span>
              </button>
            </div>
          )}

          {/* Bottom Left Video Duration Badge if Video */}
          {mediaType === "video" && (
            <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[10px] text-white font-medium">
              <VideoIcon size={11} className="text-white/80" />
              <span>{formatDuration(mediaDuration)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

