import React, { useEffect, useState } from "react";
import { X, Download, Share2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface MediaViewerModalProps {
  mediaUrl: string;
  mediaType: "image" | "video" | "gif" | string;
  onClose: () => void;
  senderName?: string;
  timestamp?: string;
  galleryItems?: { url: string; type: string }[];
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  mediaUrl,
  mediaType,
  onClose,
  senderName = "Sarah Jenkins",
  timestamp = "Today 10:42 AM",
  galleryItems,
}) => {
  const items = galleryItems && galleryItems.length > 0 ? galleryItems : [
    { url: mediaUrl, type: mediaType },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIndex((i) => (i > 0 ? i - 1 : items.length - 1));
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i < items.length - 1 ? i + 1 : 0));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, items.length]);

  const activeItem = items[currentIndex] || { url: mediaUrl, type: mediaType };

  const handleDownload = async () => {
    try {
      const response = await fetch(activeItem.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `media-${Date.now()}.${activeItem.type === "video" ? "mp4" : "jpg"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(activeItem.url, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#161618]/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Bar with Traffic Lights (Image 4) */}
      <div
        className="w-full flex items-center justify-between px-6 py-4 bg-linear-to-b from-black/80 to-transparent z-10 border-b border-white/8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:opacity-80 transition-opacity"
            title="Close"
            onClick={onClose}
          />
          <div
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer hover:opacity-80 transition-opacity"
            title="Minimize"
          />
          <div
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer hover:opacity-80 transition-opacity"
            title="Maximize"
          />
        </div>

        {/* Sender Info */}
        <div className="flex flex-col items-center text-white">
          <span className="text-sm font-semibold tracking-tight text-white">
            {senderName}
          </span>
          <span className="text-[11px] text-white/50">{timestamp}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 text-white/80">
          <button
            onClick={() => navigator.clipboard?.writeText?.(activeItem.url)}
            title="Share / Copy Link"
            className="p-1.5 hover:text-white bg-transparent border-0 cursor-pointer transition-colors"
          >
            <Share2 size={17} />
          </button>
          <button
            onClick={handleDownload}
            title="Download"
            className="p-1.5 hover:text-white bg-transparent border-0 cursor-pointer transition-colors"
          >
            <Download size={17} />
          </button>
          <button
            onClick={() => alert("Message deleted")}
            title="Delete"
            className="p-1.5 hover:text-red-400 bg-transparent border-0 cursor-pointer transition-colors"
          >
            <Trash2 size={17} />
          </button>
          <div className="h-4 w-px bg-white/20 mx-0.5" />
          <button
            onClick={onClose}
            title="Close (Esc)"
            className="p-1.5 hover:text-white bg-transparent border-0 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Center Stage with Navigation Arrows */}
      <div
        className="flex-1 flex items-center justify-between sm:px-6 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow */}
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setCurrentIndex((i) => (i > 0 ? i - 1 : items.length - 1))
          }
          className="size-11 rounded-full text-white flex items-center justify-center cursor-pointer transition-all border-0 absolute lft-0 z-10"
          title="Previous"
        >
          <ChevronLeft size={22} />
        </Button>

        {/* Center Media View */}
        <div className="flex-1 flex items-center justify-center p-4 max-h-[70vh]">
          {activeItem.type === "video" ? (
            <video
              src={activeItem.url}
              controls
              autoPlay
              className="max-w-[80vw] max-h-[68vh] rounded-xl shadow-2xl outline-none"
            />
          ) : (
            <img
              src={activeItem.url}
              alt="Preview"
              className="max-w-[80vw] max-h-[68vh] rounded-xl object-contain shadow-2xl transition-all"
            />
          )}
        </div>

        {/* Right Arrow */}
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setCurrentIndex((i) => (i < items.length - 1 ? i + 1 : 0))
          }
          className="size-11 rounded-full text-primary hover:text-primary hover:bg-primary/10 flex items-center justify-center cursor-pointer transition-all border-0 absolute right-0 z-10"
          title="Next"
        >
          <ChevronRight size={22} />
        </Button>
      </div>

      {/* Bottom Thumbnail Filmstrip Carousel */}
      <div
        className="w-full py-4 px-6 bg-black/40 border-t border-white/8 flex items-center justify-center gap-2.5 overflow-x-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`size-14 rounded-lg overflow-hidden shrink-0 cursor-pointer transition-all ${
                isSelected
                  ? "ring-2 ring-primary border-2 border-primary scale-105"
                  : "opacity-50 hover:opacity-100 border border-white/10"
              }`}
            >
              <img
                src={item.url}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
