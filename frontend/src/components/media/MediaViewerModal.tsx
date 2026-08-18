import React, { useEffect, useState } from "react";
import { X, Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

interface MediaViewerModalProps {
  mediaUrl: string;
  mediaType: "image" | "video" | "gif" | string;
  onClose: () => void;
  senderName?: string;
  timestamp?: string;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  mediaUrl,
  mediaType,
  onClose,
  senderName,
  timestamp,
}) => {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === "0") setZoom(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `media-${Date.now()}.${mediaType === "video" ? "mp4" : "jpg"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      window.open(mediaUrl, "_blank");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col justify-between select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col text-white">
          <span className="text-sm font-semibold tracking-tight">
            {senderName ? `${senderName}'s Media` : "Media Viewer"}
          </span>
          {timestamp && (
            <span className="text-[11px] text-white/60">{timestamp}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mediaType !== "video" && (
            <>
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                title="Zoom In (+)"
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-0 outline-none"
              >
                <ZoomIn size={17} />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                title="Zoom Out (-)"
                className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-0 outline-none"
              >
                <ZoomOut size={17} />
              </button>
            </>
          )}

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-0 outline-none"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>

          <button
            onClick={handleDownload}
            title="Download Media"
            className="size-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-0 outline-none"
          >
            <Download size={17} />
          </button>

          <button
            onClick={onClose}
            title="Close (Esc)"
            className="size-9 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center transition-all cursor-pointer border-0 outline-none ml-2"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Media Center Viewport */}
      <div
        className="flex-1 flex items-center justify-center p-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {mediaType === "video" ? (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl outline-none"
          />
        ) : (
          <img
            src={mediaUrl}
            alt="Fullscreen preview"
            style={{ transform: `scale(${zoom})` }}
            className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-transform duration-150 cursor-grab active:cursor-grabbing"
            draggable={false}
          />
        )}
      </div>

      {/* Bottom Hint */}
      <div
        className="w-full text-center py-3 text-[11px] text-white/40 tracking-wider font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        Click outside or press <span className="font-mono bg-white/10 px-1 py-0.5 rounded text-white/70">ESC</span> to exit
      </div>
    </div>
  );
};
