import {
  Phone,
  Video,
  Shield,
  Sparkles,
  Image as PhotoIcon,
  Trash2,
  ChevronLeft,
  Play,
  Pause,
} from "lucide-react";
import type { Conversation } from "../types";
import { WallpaperToggle } from "./wallpaper-toggle";
import { AccentToggle } from "./accent-toggle";
import { ModeToggle } from "./mode-toggle";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useMemo, useState, useEffect, useRef } from "react";

interface DetailsPanelProps {
  activeChat?: Conversation | null;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onClearHistory?: () => void;
  onClose: () => void;
  isOpen?: boolean;
  isFullScreenModal?: boolean;
}

interface AudioThumbnailProps {
  src: string;
}

export function AudioThumbnail({ src }: AudioThumbnailProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
    };
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
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
    if (isNaN(secs) || secs === 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-between p-2 bg-linear-to-br from-blue-500/10 to-[#0070eb]/20 dark:from-[#0070eb]/20 dark:to-blue-600/10 text-primary transition-all hover:brightness-105 select-none relative"
      onClick={togglePlay}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex-1 flex items-center justify-center relative w-full">
        <button
          type="button"
          className="size-7.5 rounded-full bg-[#0070eb] dark:bg-blue-600 text-white flex items-center justify-center transition-all active:scale-90 border-0 cursor-pointer shadow-xs z-10"
        >
          {isPlaying ? (
            <Pause size={12} className="fill-white text-white" />
          ) : (
            <Play size={12} className="fill-white text-white ml-0.5" />
          )}
        </button>

        {isPlaying && (
          <span className="absolute size-9 rounded-full bg-[#0070eb]/30 dark:bg-blue-600/30 animate-ping" />
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 w-full shrink-0">
        <span className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase leading-none">
          Voice
        </span>
        <span className="text-[10px] font-bold text-foreground opacity-90 leading-none">
          {duration ? formatTime(duration) : "0:05"}
        </span>
      </div>
    </div>
  );
}

export function DetailsPanel({
  activeChat: propActiveChat,
  isMuted: propIsMuted = false,
  onToggleMute,
  onClearHistory,
  onClose,
  isFullScreenModal = false,
}: DetailsPanelProps) {
  const [shareFocus, setShareFocus] = useState(true);
  const [localMuted, setLocalMuted] = useState(false);

  const isMuted = propIsMuted !== undefined ? propIsMuted : localMuted;
  const toggleMute = onToggleMute || (() => setLocalMuted((prev) => !prev));

  const activeChatId = useChatStore((state) => state.activeChatId);
  const storeConversations = useChatStore((state) => state.conversations);
  const friends = useChatStore((state) => state.friends);
  const messages = useChatStore((state) => state.messages);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const activeChat = useMemo(() => {
    if (propActiveChat) return propActiveChat;
    if (!activeChatId) return null;

    const all = [...storeConversations, ...friends];
    const found = all.find((c) => String(c._id || c.id) === String(activeChatId));
    if (!found) return null;

    return {
      id: found._id || found.id,
      name: found.fullName || found.username || found.name || "User",
      avatarColor: found.avatarColor || "#007aff",
      profilePic: found.profilePic,
      status: onlineUsers.includes(found._id || found.id) ? "Online" : "Offline",
      unread: false,
      messages: messages,
      replies: [],
    };
  }, [propActiveChat, activeChatId, storeConversations, friends, messages, onlineUsers]);

  if (!activeChat) return null;

  const initials = (activeChat.name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  // Extract media items from current conversation messages or sample fallback
  const mediaMessages = activeChat.messages.filter(
    (m) => m.mediaUrl && !m.isDeleted && m.mediaUrl,
  );

  return (
    <div
      className={`${
        isFullScreenModal
          ? "fixed inset-0 z-50 w-full h-full bg-white/95 dark:bg-[#181A1E]/95 backdrop-blur-3xl  p-2 sm:p-6 overflow-y-auto flex flex-col animate-in fade-in duration-200 select-none"
          : "w-full h-full flex flex-col overflow-hidden select-none"
      }`}
    >
      {/* Top Header Navigation (Only shown in mobile modal mode) */}
      {isFullScreenModal && (
        <div className="p-4 flex items-center justify-between border-b border-black/6 dark:border-white/8 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:opacity-80 bg-transparent border-0 cursor-pointer p-0"
            onClick={onClose}
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
          <button
            type="button"
            className="text-xs font-bold text-primary hover:opacity-80 bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full border-0 cursor-pointer transition-colors"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      )}

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 no-scrollbar">
        {/* Profile Hero Card */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative mb-3">
            {activeChat.profilePic ? (
              <img
                src={activeChat.profilePic}
                alt={activeChat.name}
                className="size-24 rounded-full object-cover shadow-xl ring-4 ring-white/40 dark:ring-white/15"
              />
            ) : (
              <div
                className="size-24 rounded-full overflow-hidden shadow-xl ring-4 ring-white/40 dark:ring-white/15 flex items-center justify-center text-3xl font-bold text-white select-none"
                style={{ backgroundColor: activeChat.avatarColor }}
              >
                {initials}
              </div>
            )}
          </div>

          <h2 className="text-lg! font-bold text-foreground! mb-0.5 text-center">
            {activeChat.name}
          </h2>
          <p className="text-xs text-muted-foreground mb-2! text-center">
            {activeChat.name.toLowerCase().replace(/\s+/g, ".")}@example.com
          </p>

          {/* Quick Action Circles */}
          <div className="flex gap-8 w-full justify-center">
            <div
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
              onClick={() => alert(`Calling ${activeChat.name}...`)}
            >
              <div className="size-11 rounded-full bg-black/5 dark:bg-white/10 group-hover:bg-primary/20 flex items-center justify-center transition-all shadow-xs">
                <Phone size={18} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                Call
              </span>
            </div>

            <div
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
              onClick={() =>
                alert(`Starting FaceTime Video with ${activeChat.name}...`)
              }
            >
              <div className="size-11 rounded-full bg-black/5 dark:bg-white/10 group-hover:bg-primary/20 flex items-center justify-center transition-all shadow-xs">
                <Video size={19} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                Video
              </span>
            </div>
          </div>
        </div>

        {/* Photos Grid Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 px-1">
            Photos
          </h3>
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden">
            {mediaMessages.length > 0 ? (
              mediaMessages.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="aspect-square bg-black/10 dark:bg-white/5 rounded-xl overflow-hidden relative cursor-pointer group shadow-2xs"
                >
                  {m.mediaType === "video" ? (
                    <video
                      src={m.mediaUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    m.mediaType ===
                    "image" ? (
                      <img
                        src={m.mediaUrl}
                        alt="Photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <AudioThumbnail src={m.mediaUrl || ""} />
                    )
                  )}
                </div>
              ))
            ) : (
              <></>
            )}
            <div className="aspect-square bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <PhotoIcon size={18} className="text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Grouped macOS Settings Card */}
        <div className="bg-black/3 dark:bg-white/4 rounded-2xl p-4 border border-black/5 dark:border-white/5 flex flex-col gap-3.5 shadow-2xs">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">
              Mute Alerts
            </span>
            <label className="switch">
              <input type="checkbox" checked={isMuted} onChange={toggleMute} />
              <span className="slider"></span>
            </label>
          </div>

          <div className="h-px bg-black/6 dark:bg-white/8 w-full" />

          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-foreground">
              Share Focus Status
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={shareFocus}
                onChange={() => setShareFocus(!shareFocus)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Appearance & Themes Quick Switcher */}
        <div className="bg-black/3 dark:bg-white/4 rounded-2xl p-3.5 border border-black/5 dark:border-white/5 flex flex-col gap-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" /> Appearance
            </span>
            <div className="flex items-center gap-1">
              <WallpaperToggle />
              <AccentToggle />
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Clear History & Danger Block Option */}
        <div className="bg-black/3 dark:bg-white/4 rounded-2xl p-2 border border-black/5 dark:border-white/5 flex flex-col divide-y divide-black/5 dark:divide-white/5 shadow-2xs">
          <button
            type="button"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground bg-transparent border-0 cursor-pointer w-full py-2.5 flex items-center justify-center gap-1.5 transition-colors"
            onClick={onClearHistory}
          >
            <Trash2 size={13} />
            <span>Clear Chat History</span>
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-red-500 hover:text-red-600 bg-transparent border-0 cursor-pointer w-full py-2.5 transition-colors"
            onClick={() => alert(`Blocked ${activeChat.name}`)}
          >
            Block this Caller
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pb-2">
          <Shield size={12} /> End-to-end Encrypted
        </div>
      </div>
    </div>
  );
}
