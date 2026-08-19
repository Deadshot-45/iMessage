import React, { useRef, useEffect, useState } from "react";
import {
  ChevronLeft,
  Info,
  Phone,
  Video,
  MessageSquare,
  Plus,
  Smile,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import type { Conversation, Message } from "../types";
import { Input } from "./ui/input";
import { useChatStore } from "@/store/useChatStore";
import { ProgressiveMedia } from "./media/ProgressiveMedia";
import { MediaViewerModal } from "./media/MediaViewerModal";

interface ChatPanelProps {
  activeChat: Conversation | null;
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  isTyping: boolean;
  onBack: () => void;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ChatPanel({
  activeChat,
  inputText,
  setInputText,
  onSendMessage,
  isTyping,
  onBack,
  showDetails,
  setShowDetails,
  selectedFile,
  setSelectedFile,
  isSidebarOpen = true,
  onToggleSidebar,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendingMedia = useChatStore((state) => state.sendingMedia);
  const deleteMessage = useChatStore((state) => state.deleteMessage);
  const markMessagesAsRead = useChatStore((state) => state.markMessagesAsRead);

  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Mark as read whenever active chat is focused or opened
  useEffect(() => {
    if (activeChat?.id) {
      markMessagesAsRead(activeChat.id);
    }
  }, [activeChat?.id, activeChat?.messages?.length, markMessagesAsRead]);

  // Auto scroll to bottom of thread with layout rendering buffer
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [activeChat?.messages?.length, isTyping]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSendMessage();
    }
  };

  if (!activeChat) {
    return (
      <div className="w-full h-full bg-white/75 dark:bg-[#1A1C20]/85 backdrop-blur-3xl rounded-[26px] border border-white/40 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden items-center justify-center p-8 select-none">
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

  const initials = activeChat.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="w-full h-full bg-white/75 dark:bg-[#1A1C20]/85 backdrop-blur-3xl rounded-[26px] border border-white/40 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden select-none relative">
      {/* Fullscreen Media Lightbox */}
      {lightboxMedia && (
        <MediaViewerModal
          mediaUrl={lightboxMedia.url}
          mediaType={lightboxMedia.type}
          onClose={() => setLightboxMedia(null)}
          senderName={activeChat.name}
        />
      )}

      {/* Chat Header (Sequoia Glass) */}
      <div className="px-5 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex justify-between items-center bg-transparent shrink-0">
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

          {/* Contact info clickable to open details */}
          <div
            role="button"
            tabIndex={0}
            className="flex flex-col items-start cursor-pointer select-none group"
            onClick={() => setShowDetails(!showDetails)}
          >
            <h2 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
              {activeChat.name}
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`size-1.5 rounded-full ${
                  activeChat.status === "Online"
                    ? "bg-emerald-500"
                    : "bg-zinc-400"
                }`}
              />
              <span
                className={`text-[11px] ${
                  activeChat.status === "Online"
                    ? "text-emerald-500 font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {activeChat.status}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Action Icons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-primary transition-colors border-0 bg-transparent cursor-pointer"
            onClick={() =>
              alert(`Starting FaceTime Video with ${activeChat.name}...`)
            }
            title="FaceTime Video"
          >
            <Video size={19} />
          </button>

          <button
            type="button"
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-primary transition-colors border-0 bg-transparent cursor-pointer"
            onClick={() => alert(`Calling ${activeChat.name}...`)}
            title="Audio Call"
          >
            <Phone size={17} />
          </button>

          {/* Info (i) button */}
          <button
            type="button"
            className={`size-7 rounded-full flex items-center justify-center transition-all cursor-pointer border-0 shadow-xs ${
              showDetails
                ? "bg-blue-600 text-white shadow-blue-500/30"
                : "bg-blue-600/15 hover:bg-blue-600 text-blue-600 hover:text-white dark:bg-blue-500/20 dark:text-blue-400"
            }`}
            onClick={() => setShowDetails(!showDetails)}
            title="Details"
          >
            <Info size={14} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Chat Messages Timeline */}
      <div
        className="chat-messages"
        onClick={() => markMessagesAsRead(activeChat.id)}
      >
        {activeChat.messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-logo">
              <MessageSquare size={36} />
            </div>
            <p className="empty-state-title">No messages yet</p>
            <p className="empty-state-desc">
              Send a message to start the conversation with {activeChat.name}.
            </p>
          </div>
        ) : (
          <>
            <div className="date-separator">iMessage</div>
            {activeChat.messages.map((msg: Message, index) => {
              const isSent = msg.sender === "me";
              const showStatus =
                isSent && index === activeChat.messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`message-row ${isSent ? "sent" : "received"} group flex items-end gap-2`}
                >
                  {/* Incoming Contact Avatar */}
                  {!isSent && (
                    <div
                      className="size-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0 mb-1 shadow-2xs select-none ring-1 ring-black/5 dark:ring-white/10"
                      style={{ backgroundColor: activeChat.avatarColor }}
                    >
                      {initials}
                    </div>
                  )}

                  <div className="bubble relative flex flex-col gap-1.5 max-w-[280px] sm:max-w-[340px]">
                    {/* Media Attachment (Progressive Engine) */}
                    {msg.mediaUrl && (
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

                    {/* Text Message or Deleted Tombstone */}
                    {msg.isDeleted ? (
                      <div className="text-xs italic opacity-60 flex items-center gap-1">
                        <span>🚫 This message was deleted</span>
                      </div>
                    ) : (
                      msg.text && (
                        <div className="leading-snug break-words pr-1 text-[14.5px]">
                          {msg.text}
                        </div>
                      )
                    )}

                    {/* Message Meta: Timestamp & Tick State Machine */}
                    <div className="flex items-center justify-end gap-1.5 text-[10px] opacity-80 self-end mt-0.5 select-none leading-none">
                      <span>{msg.timestamp}</span>
                      {isSent && !msg.isDeleted && (
                        <span className="flex items-center">
                          {msg.status === "sending" ? (
                            <Loader2
                              size={10}
                              className="animate-spin text-white/70"
                            />
                          ) : msg.status === "seen" ? (
                            /* Double Blue / Cyan High-Contrast Tick */
                            <span
                              className="text-sky-300 font-bold text-[12px]"
                              style={{ letterSpacing: "-1.5px" }}
                              title="Read"
                            >
                              ✓✓
                            </span>
                          ) : msg.status === "delivered" ? (
                            /* Double Gray Tick */
                            <span
                              className="text-white/75 font-semibold text-[12px]"
                              style={{ letterSpacing: "-1.5px" }}
                              title="Delivered"
                            >
                              ✓✓
                            </span>
                          ) : msg.status === "sent" ? (
                            /* Single Tick */
                            <span
                              className="text-white/75 font-semibold text-[12px]"
                              title="Sent"
                            >
                              ✓
                            </span>
                          ) : msg.status === "error" ? (
                            <span
                              className="text-red-300 font-bold"
                              title="Failed to send"
                            >
                              ⚠️
                            </span>
                          ) : (
                            /* Fallback Single Tick */
                            <span className="text-white/75 text-[12px]">✓</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Inline Delete Action Button for Text Messages */}
                    {isSent && !msg.isDeleted && !msg.mediaUrl && (
                      <button
                        type="button"
                        onClick={() => deleteMessage(String(msg.id))}
                        title="Delete Message"
                        className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-opacity p-1 bg-transparent border-0 cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {showStatus && msg.status === "seen" && (
                    <div className="self-end mr-2 text-[11px] text-muted-foreground font-medium select-none">
                      Read {msg.timestamp}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="typing-bubble">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Media Preview Drawer */}
      {selectedFile && (
        <div className="px-5 py-3.5 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="size-16 rounded-xl object-cover border border-black/10 dark:border-white/10"
              />
            ) : selectedFile.type.startsWith("audio/") ? (
              <div className="size-16 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider">
                Audio
              </div>
            ) : (
              <div className="size-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Video
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold max-w-[200px] truncate">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-xs font-bold text-red-500 hover:text-red-600 bg-transparent border-0 cursor-pointer transition-all duration-150"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="chat-input-area">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,video/*,audio/*"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="action-btn"
          style={{ padding: "8px" }}
          disabled={sendingMedia}
          title="Attach Image, Video, or Audio"
        >
          {sendingMedia ? (
            <Loader2 className="animate-spin text-muted-foreground" size={20} />
          ) : (
            <Plus size={20} style={{ color: "var(--text-secondary)" }} />
          )}
        </button>

        <div className="input-container">
          <Input
            type="text"
            className="chat-input border-none! bg-transparent! focus-visible:ring-0! h-auto!"
            placeholder={sendingMedia ? "Uploading attachment..." : "iMessage"}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={sendingMedia}
          />
          <div className="input-actions">
            <Smile
              size={18}
              style={{
                color: "var(--text-secondary)",
                cursor: "pointer",
                marginRight: "6px",
              }}
            />
          </div>
        </div>

        <button
          onClick={onSendMessage}
          className="send-btn"
          disabled={(!inputText.trim() && !selectedFile) || sendingMedia}
        >
          <Send
            size={13}
            style={{ transform: "rotate(-45deg) translate(1px, -1px)" }}
          />
        </button>
      </div>
    </div>
  );
}
