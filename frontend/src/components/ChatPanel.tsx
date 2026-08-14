import React, { useRef, useEffect } from "react";
import { ChevronLeft, Info, Phone, Video, MessageSquare, Plus, Smile, Send, Loader2 } from "lucide-react";
import type { Conversation } from "../types";
import { Input } from "./ui/input";
import { useChatStore } from "@/store/useChatStore";


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
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendingMedia = useChatStore((state) => state.sendingMedia);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Auto scroll to bottom of thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isTyping]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSendMessage();
    }
  };

  if (!activeChat) {
    return (
      <div className="imessage-chat-pane">
        <div className="empty-state" style={{ height: "100%" }}>
          <div className="empty-state-logo">
            <MessageSquare size={44} />
          </div>
          <h3 className="empty-state-title">Select a Conversation</h3>
          <p className="empty-state-desc">Choose a friend from the list or search for contacts to begin messaging.</p>
        </div>
      </div>
    );
  }

  const initials = activeChat.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="imessage-chat-pane">
      {/* Chat Header */}
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
          <span style={{ fontSize: "15px", fontWeight: "500" }}>Back</span>
        </button>

        <div typeof="button" className="flex gap-2 items-center justify-center cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
          <div className="chat-header-avatar" style={{ backgroundColor: activeChat.avatarColor }}>
            {initials}
          </div>
          <div className="flex flex-col items-start pt-2">
            <span className="text-xs font-semibold">{activeChat.name}</span>
            <span className="flex items-center text-[12px] text-muted-foreground">
              {activeChat.status}
              <Info size={11} style={{ marginLeft: "2px" }} />
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", color: "var(--imessage-blue)" }}>
          <Phone size={18} style={{ cursor: "pointer" }} onClick={() => alert("Calling...")} />
          <Video size={20} style={{ cursor: "pointer" }} onClick={() => alert("Starting video call...")} />
        </div>
      </div>

      {/* Chat Messages Timeline */}
      <div className="chat-messages">
        {activeChat.messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-logo">
              <MessageSquare size={36} />
            </div>
            <p className="empty-state-title">No messages yet</p>
            <p className="empty-state-desc">Send a message to start the conversation with {activeChat.name}.</p>
          </div>
        ) : (
          <>
            <div className="date-separator">iMessage</div>
            {activeChat.messages.map((msg, index) => {
              const isSent = msg.sender === "me";
              const showStatus = isSent && index === activeChat.messages.length - 1;

              return (
                <div key={msg.id} className={`message-row ${isSent ? "sent" : "received"}`}>
                  <div className="bubble flex flex-col gap-2 max-w-[260px] sm:max-w-[320px]">
                    {msg.mediaUrl && (
                      <div className="rounded-lg overflow-hidden max-w-full">
                        {msg.mediaType === "video" ? (
                          <video
                            src={msg.mediaUrl}
                            controls
                            className="max-w-full max-h-[200px] rounded-lg"
                          />
                        ) : (
                          <img
                            src={msg.mediaUrl}
                            alt="Attached media"
                            className="max-w-full max-h-[200px] object-cover rounded-lg"
                          />
                        )}
                      </div>
                    )}
                    {msg.text && <div className="leading-snug break-words">{msg.text}</div>}
                  </div>
                  {showStatus && (
                    <span className="msg-status">
                      {isTyping ? "Delivered" : "Read"}
                    </span>
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

      {/* Selected Media Preview */}
      {selectedFile && (
        <div className="px-5 py-3.5 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="size-16 rounded-xl object-cover border border-black/10 dark:border-white/10"
              />
            ) : (
              <div className="size-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Video
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold max-w-[200px] truncate">{selectedFile.name}</span>
              <span className="text-[10px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
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
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="action-btn"
          style={{ padding: "8px" }}
          disabled={sendingMedia}
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
            <Smile size={18} style={{ color: "var(--text-secondary)", cursor: "pointer", marginRight: "6px" }} />
          </div>
        </div>

        <button
          onClick={onSendMessage}
          className="send-btn"
          disabled={(!inputText.trim() && !selectedFile) || sendingMedia}
        >
          <Send size={13} style={{ transform: "rotate(-45deg) translate(1px, -1px)" }} />
        </button>
      </div>
    </div>
  );
}
