import React, { useRef, useEffect, useState, lazy, Suspense, useMemo } from "react";
import {
  ChevronLeft,
  Info,
  Phone,
  Video,
  MessageSquare,
  Plus,
  Smile,
  Mic,
  ArrowUp,
  Loader2,
  X,
  Trash2,
  Square,
} from "lucide-react";
import type { Conversation, Message } from "../types";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ProgressiveMedia } from "./media/ProgressiveMedia";
import { AudioPlayer } from "./media/AudioPlayer";
import { compressImage } from "@/lib/utils";

// Lazy-load MediaViewerModal (code splitting)
const MediaViewerModal = lazy(() =>
  import("./media/MediaViewerModal").then((m) => ({ default: m.MediaViewerModal })),
);

interface ChatPanelProps {
  activeChat?: Conversation | null;
  inputText?: string;
  setInputText?: (text: string) => void;
  onSendMessage?: () => void;
  isTyping?: boolean;
  onBack?: () => void;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  selectedFile?: File | null;
  setSelectedFile?: (file: File | null) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatPanel({
  activeChat: propActiveChat,
  inputText: propInputText,
  setInputText: propSetInputText,
  onSendMessage: propOnSendMessage,
  isTyping = false,
  onBack,
  showDetails,
  setShowDetails,
  selectedFile: propSelectedFile,
  setSelectedFile: propSetSelectedFile,
  isSidebarOpen = true,
  onToggleSidebar,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state fallbacks if not controlled by parent
  const [localInputText, setLocalInputText] = useState("");
  const [localSelectedFile, setLocalSelectedFile] = useState<File | null>(null);

  const inputText = propInputText !== undefined ? propInputText : localInputText;
  const setInputText = propSetInputText || setLocalInputText;
  const selectedFile = propSelectedFile !== undefined ? propSelectedFile : localSelectedFile;
  const setSelectedFile = propSetSelectedFile || setLocalSelectedFile;

  // Voice recording state & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeChatId = useChatStore((state) => state.activeChatId);
  const storeMessages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const getMessages = useChatStore((state) => state.getMessages);
  const subscribeToMessage = useChatStore((state) => state.subscribeToMessage);
  const unsubscribeFromMessages = useChatStore(
    (state) => state.unsubscribeFromMessages,
  );
  const storeConversations = useChatStore((state) => state.conversations);
  const friends = useChatStore((state) => state.friends);
  const sendingMedia = useChatStore((state) => state.sendingMedia);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const markMessagesAsRead = useChatStore((state) => state.markMessagesAsRead);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  // Derive active chat if not provided
  const activeChat = useMemo(() => {
    if (propActiveChat !== undefined) return propActiveChat;
    if (!activeChatId) return null;

    const all = [...storeConversations, ...friends];
    const found = all.find((c) => String(c._id || c.id) === String(activeChatId));
    if (!found) return null;

    const uiMessages = storeMessages.map((msg: any) => ({
      id: msg._id,
      text: msg.message || msg.text || "",
      sender: (String(msg.senderId) === String(authUser?._id)
        ? "me"
        : "them") as "me" | "them",
      timestamp: msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
      mediaUrl: msg.mediaUrl,
      mediaType: msg.mediaType,
      thumbnailUrl: msg.thumbnailUrl,
      mediaSize: msg.mediaSize,
      mediaDuration: msg.mediaDuration,
      status: msg.status || "sent",
      isDeleted: msg.isDeleted || false,
    }));

    return {
      id: found._id || found.id,
      name: found.fullName || found.username || found.name || "User",
      avatarColor: found.avatarColor || "#007aff",
      profilePic: found.profilePic,
      status: onlineUsers.includes(found._id || found.id) ? "Online" : "Offline",
      unread: false,
      messages: uiMessages,
      replies: [],
    };
  }, [
    propActiveChat,
    activeChatId,
    storeConversations,
    friends,
    storeMessages,
    authUser,
    onlineUsers,
  ]);

  // Lightbox Media state
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type?: string;
  } | null>(null);

  // Object URL for selected media preview
  const previewUrl = useMemo(() => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  }, [selectedFile]);

  // Message sync and socket subscription
  useEffect(() => {
    if (!activeChatId) return;

    getMessages(String(activeChatId));
    subscribeToMessage(String(activeChatId));

    return () => {
      unsubscribeFromMessages();
    };
  }, [activeChatId, getMessages, subscribeToMessage, unsubscribeFromMessages]);

  // Clean up recording timers and streams on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Audio recording is not supported in your browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let mimeType = "audio/webm";
      if (typeof MediaRecorder !== "undefined") {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Microphone permission denied or not available. Please allow microphone access.");
    }
  };

  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false);
      return;
    }

    recorder.onstop = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const mimeType = recorder.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const extension = mimeType.includes("mp4")
        ? "mp4"
        : mimeType.includes("ogg")
          ? "ogg"
          : "webm";
      const audioFile = new File(
        [audioBlob],
        `voice-note-${Date.now()}.${extension}`,
        {
          type: mimeType,
          lastModified: Date.now(),
        },
      );

      setIsRecording(false);
      setRecordingDuration(0);
      audioChunksRef.current = [];
      setSelectedFile(audioFile);
    };

    recorder.stop();
  };

  const stopAndSendRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false);
      return;
    }

    recorder.onstop = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const mimeType = recorder.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const extension = mimeType.includes("mp4")
        ? "mp4"
        : mimeType.includes("ogg")
          ? "ogg"
          : "webm";
      const audioFile = new File(
        [audioBlob],
        `voice-note-${Date.now()}.${extension}`,
        {
          type: mimeType,
          lastModified: Date.now(),
        },
      );

      setIsRecording(false);
      setRecordingDuration(0);
      audioChunksRef.current = [];

      if (activeChatId) {
        try {
          await sendMessage(String(activeChatId), {
            chatMedia: audioFile,
            message: "",
          });
        } catch {
          // Handled in store
        }
      }
    };

    recorder.stop();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedFile) || !activeChatId) return;

    if (propOnSendMessage) {
      propOnSendMessage();
      return;
    }

    try {
      const fileToSend = selectedFile;
      const textToSend = inputText.trim();

      // Clear input and preview immediately for smooth UI feedback
      setSelectedFile(null);
      setInputText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (fileToSend) {
        await sendMessage(String(activeChatId), {
          message: textToSend,
          chatMedia: fileToSend,
        });
      } else {
        await sendMessage(String(activeChatId), {
          message: textToSend,
        });
      }
    } catch {
      // Handled in chat store with optimistic error state
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith("image/");
      const isAudio = file.type.startsWith("audio/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isAudio && !isVideo) {
        alert("Please select an image, video, or audio file.");
        return;
      }

      if (file.size > 25 * 1024 * 1024) {
        alert("File size exceeds maximum 25MB limit.");
        return;
      }

      if (isImage) {
        try {
          const compressed = await compressImage(file);
          setSelectedFile(compressed);
        } catch {
          setSelectedFile(file);
        }
      } else {
        setSelectedFile(file);
      }
    }
  };

  // Auto scroll to bottom of thread with layout rendering buffer
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [activeChat?.messages?.length, isTyping]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeChat) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden items-center justify-center p-8 select-none">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <div className="size-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shadow-inner">
            <MessageSquare size={36} />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Select a Conversation
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Choose a friend from the list or search for contacts to begin messaging.
          </p>
        </div>
      </div>
    );
  }

  const initials = (activeChat.name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("");

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none relative">
      {/* TopAppBar (Fixed 52px Header) */}
      <div className="flex justify-between items-center h-13 px-2 md:px-6 w-full border-b border-black/8 dark:border-white/8 backdrop-blur-md bg-white/80 dark:bg-[#16171d]/80 absolute top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          {/* Mobile Back button */}
          <button
            type="button"
            className="md:hidden flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 bg-transparent border-0 cursor-pointer p-1"
            onClick={onBack}
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>

          {/* Desktop/Tablet Sidebar Toggle button */}
          {onToggleSidebar && (
            <button
              type="button"
              className="hidden md:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors border-0 bg-transparent cursor-pointer"
              onClick={onToggleSidebar}
              title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              <ChevronLeft
                size={18}
                className={`transition-transform duration-200 ${
                  isSidebarOpen ? "" : "rotate-180"
                }`}
              />
            </button>
          )}

          {/* Contact info */}
          <div
            role="button"
            tabIndex={0}
            className="flex flex-col items-start cursor-pointer select-none group"
            onClick={() => setShowDetails(!showDetails)}
          >
            <span className="text-[15px] font-semibold text-foreground leading-tight">
              {activeChat.name}
            </span>
            <span className="text-[11px] text-[#34c759] font-medium leading-tight">
              Online
            </span>
          </div>
        </div>

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors border-0 bg-transparent cursor-pointer p-1"
            onClick={() =>
              alert(`Starting FaceTime Video with ${activeChat.name}...`)
            }
            title="FaceTime Video"
          >
            <Video size={19} className="fill-current" />
          </button>

          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors border-0 bg-transparent cursor-pointer p-1"
            onClick={() => alert(`Calling ${activeChat.name}...`)}
            title="Audio Call"
          >
            <Phone size={18} className="fill-current" />
          </button>

          <button
            type="button"
            className="text-primary hover:text-primary/80 transition-colors border-0 bg-transparent cursor-pointer p-1"
            onClick={() => setShowDetails(!showDetails)}
            title="Details"
          >
            <Info size={19} className="" />
          </button>
        </div>
      </div>

      {/* Chat Messages Timeline */}
      <div
        className="flex-1 overflow-y-auto px-6 pt-18 pb-28 flex flex-col gap-3.5 no-scrollbar"
        onClick={() => markMessagesAsRead(activeChat.id)}
      >
        {activeChat.messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground my-auto">
            <MessageSquare size={32} className="opacity-40" />
            <p className="text-sm font-semibold">No messages yet</p>
            <p className="text-xs">Send a message to start the conversation.</p>
          </div>
        ) : (
          <>
            {/* Timestamp Badge */}
            <div className="text-center my-2">
              <span className="text-[11px] text-muted-foreground bg-accent px-2 py-1 rounded-md">
                Today 8:30 AM
              </span>
            </div>

            {activeChat.messages.map((msg: Message, index:number) => {
              const isSent = msg.sender === "me";
              const showStatus =
                isSent && index === activeChat.messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 max-w-[70%] ${
                    isSent ? "self-end flex-row-reverse" : "self-start"
                  }`}
                >
                  {/* Incoming Contact Avatar */}
                  {!isSent && (
                    <div className="self-end mb-1 shrink-0">
                      {activeChat.profilePic ? (
                        <img
                          src={activeChat.profilePic}
                          alt={activeChat.name}
                          className="w-8 h-8 rounded-full object-cover shadow-2xs"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow-2xs select-none"
                          style={{ backgroundColor: activeChat.avatarColor }}
                        >
                          {initials}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative flex flex-col gap-1">
                    {/* Media Attachment */}
                    {msg.mediaUrl && (
                      <div
                        className={`overflow-hidden rounded-xl shadow-xs ${
                          isSent
                            ? "bg-linear-to-br from-[#0070eb] to-[#0058bc] p-1 text-white"
                            : "bg-[#e9e9eb] dark:bg-[#262629] p-1 text-[#181c23] dark:text-white"
                        }`}
                      >
                        {msg.mediaType === "audio" ? (
                          <AudioPlayer src={msg.mediaUrl} isMe={isSent} />
                        ) : (
                          <ProgressiveMedia
                            mediaUrl={msg.mediaUrl}
                            mediaType={msg.mediaType || "image"}
                            thumbnailUrl={msg.thumbnailUrl}
                            mediaSize={msg.mediaSize}
                            isSentByMe={isSent}
                            isUploading={msg.status === "sending"}
                            uploadProgress={msg.uploadProgress}
                            isDeleted={msg.isDeleted}
                            onOpenFullscreen={(url, type) =>
                              setLightboxMedia({ url, type })
                            }
                            onDeleteMessage={() => deleteMessage(String(msg.id))}
                          />
                        )}
                        {msg.text && (
                          <p className="px-2 py-1 text-[14.5px] leading-snug">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Text Message Bubble */}
                    {!msg.mediaUrl && (
                      <div
                        className={`px-4 py-2 text-[15px] leading-relaxed wrap-break-word ${
                          isSent
                            ? "bg-linear-to-br from-[#0070eb] to-[#0058bc] text-white rounded-[18px] rounded-br-lg"
                            : "bg-[#e9e9eb] dark:bg-[#262629] text-[#181c23] dark:text-white rounded-[18px] rounded-bl-lg"
                        }`}
                      >
                        {msg.isDeleted ? (
                          <span className="italic opacity-70 text-xs">
                            🚫 This message was deleted
                          </span>
                        ) : (
                          msg.text
                        )}
                      </div>
                    )}

                    {/* Read Receipt Footer */}
                    {showStatus && (
                      <div className="self-end text-[11px] text-muted-foreground mr-1 mt-0.5">
                        Read {msg.timestamp || "9:42 AM"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2 items-center self-start bg-[#e9e9eb] dark:bg-[#262629] px-4 py-3 rounded-[18px] rounded-bl-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="absolute bottom-0 w-full p-4 bg-linear-to-t from-white via-white/90 to-transparent dark:from-[#16171d] dark:via-[#16171d]/90 dark:to-transparent z-10 flex flex-col gap-2">
        {/* Selected Media Attachment Preview Card */}
        {selectedFile && (
          <div className="bg-white/95 dark:bg-zinc-800/95 backdrop-blur-xl rounded-2xl p-2.5 border border-black/10 dark:border-white/10 shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-3 min-w-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="size-12 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0 shadow-2xs"
                />
              ) : selectedFile.type.startsWith("audio/") ? (
                <div className="size-12 rounded-xl bg-blue-500/15 text-[#0070eb] flex items-center justify-center shrink-0">
                  <Mic size={22} />
                </div>
              ) : (
                <div className="size-12 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                  <Video size={22} />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate max-w-55">
                  {selectedFile.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="size-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-red-500/15 hover:text-red-500 text-muted-foreground flex items-center justify-center transition-colors border-0 cursor-pointer shrink-0"
              title="Remove attachment"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input Capsule or Active Voice Recording Bar */}
        {isRecording ? (
          <div className="flex items-center justify-between gap-3 bg-red-500/10 dark:bg-red-500/15 backdrop-blur-xl rounded-2xl p-2 px-3 border border-red-500/30 shadow-xs animate-in fade-in duration-200">
            {/* Red Pulsing Dot & Recording Duration */}
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-500 animate-pulse shadow-xs" />
              <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                {formatDuration(recordingDuration)}
              </span>
            </div>

            {/* Pulsing Audio Waveform Visualizer */}
            <div className="flex items-center gap-0.75 h-5 px-2 flex-1 justify-center max-w-50">
              {[10, 18, 14, 24, 16, 22, 12, 20, 15, 10].map((h, i) => (
                <div
                  key={i}
                  className="w-0.75 bg-red-500/70 dark:bg-red-400/70 rounded-full animate-pulse"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${(i % 4) * 0.15}s`,
                  }}
                />
              ))}
            </div>

            {/* Cancel (Trash), Stop (Square), & Send (Up Arrow) Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelRecording}
                className="size-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-red-500/20 text-muted-foreground hover:text-red-600 flex items-center justify-center transition-colors border-0 cursor-pointer"
                title="Cancel recording"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="size-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors border-0 cursor-pointer"
                title="Stop recording"
              >
                <Square size={14} className="fill-current" />
              </button>
              <button
                type="button"
                onClick={stopAndSendRecording}
                className="size-8 rounded-full bg-[#0070eb] hover:bg-[#0058bc] text-white flex items-center justify-center transition-all border-0 cursor-pointer shadow-xs active:scale-95"
                title="Send voice note"
              >
                <ArrowUp size={17} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/8 backdrop-blur-xl rounded-2xl p-2 border border-black/5 dark:border-white/10 shadow-xs">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,video/*,audio/*"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 border-0 bg-transparent cursor-pointer"
              title="Attach file"
            >
              {sendingMedia ? (
                <Loader2 size={18} className="animate-spin text-primary" />
              ) : (
                <Plus size={20} />
              )}
            </button>

            <div className="flex-1 relative">
              <textarea
                className="w-full bg-transparent border-0 focus:outline-hidden resize-none max-h-32 text-[15px] text-foreground placeholder:text-muted-foreground p-0 m-0 leading-snug"
                placeholder={sendingMedia ? "Uploading attachment..." : "iMessage"}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={sendingMedia}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors border-0 bg-transparent cursor-pointer p-1"
              >
                <Smile size={20} />
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="text-muted-foreground hover:text-[#0070eb] transition-colors border-0 bg-transparent cursor-pointer p-1"
                title="Record voice note"
              >
                <Mic size={20} />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={(!inputText.trim() && !selectedFile) || sendingMedia}
                className={`w-8 h-8 rounded-full bg-[#0070eb] text-white flex items-center justify-center transition-opacity border-0 cursor-pointer shrink-0 ${
                  (!inputText.trim() && !selectedFile) || sendingMedia
                    ? "opacity-40 cursor-not-allowed"
                    : "opacity-100 hover:bg-[#0058bc]"
                }`}
              >
                <ArrowUp size={17} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Code-split Lazy Lightbox Modal */}
      {lightboxMedia && (
        <Suspense fallback={null}>
          <MediaViewerModal
            onClose={() => setLightboxMedia(null)}
            mediaUrl={lightboxMedia.url}
            mediaType={lightboxMedia.type || "image"}
            senderName={activeChat.name}
          />
        </Suspense>
      )}
    </div>
  );
}
