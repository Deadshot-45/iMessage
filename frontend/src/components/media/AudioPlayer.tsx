import React, { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  isMe: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, isMe }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "0:12";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  // Waveform bars with pseudo-realistic heights
  const bars = [8, 14, 22, 16, 26, 32, 28, 18, 24, 30, 20, 14, 22, 28, 16, 10];

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-[22px] shadow-sm select-none cursor-pointer transition-all ${
        isMe
          ? "bg-[#007AFF] text-white"
          : "bg-[#2A2B30] text-white dark:bg-[#2A2B30] dark:text-white"
      }`}
      onClick={togglePlay}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause Circular Icon */}
      <button
        type="button"
        onClick={togglePlay}
        className="size-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 border-0 cursor-pointer shadow-xs"
      >
        {isPlaying ? (
          <Pause size={14} className="fill-white" />
        ) : (
          <Play size={14} className="fill-white ml-0.5" />
        )}
      </button>

      {/* Apple Voice Note Waveform Bars */}
      <div className="flex items-center gap-[2.5px] h-6 px-1">
        {bars.map((height, i) => {
          const barProgress = i / bars.length;
          const isPassed = barProgress <= progress;
          return (
            <div
              key={i}
              className={`w-[2.5px] rounded-full transition-all duration-150 ${
                isPassed ? "bg-white opacity-100" : "bg-white/40"
              }`}
              style={{
                height: `${height}px`,
              }}
            />
          );
        })}
      </div>

      {/* Time Duration Badge */}
      <span className="text-[11px] font-medium opacity-90 pr-1 tracking-tight">
        {formatTime(isPlaying ? currentTime : duration || 12)}
      </span>
    </div>
  );
};
