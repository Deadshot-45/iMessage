import React, { useRef, useEffect } from "react";
import { ChevronLeft, Info, Phone, Video, MessageSquare, Plus, Smile, Send } from "lucide-react";
import type { Conversation } from "../types";


interface ChatPaneProps {
  activeChat: Conversation | null;
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  isTyping: boolean;
  onBack: () => void;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
}

export function ChatPane({
  activeChat,
  inputText,
  setInputText,
  onSendMessage,
  isTyping,
  onBack,
  showDetails,
  setShowDetails,
}: ChatPaneProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

        <div className="chat-header-info" onClick={() => setShowDetails(!showDetails)}>
          <div className="chat-header-avatar" style={{ backgroundColor: activeChat.avatarColor }}>
            {initials}
          </div>
          <div className="chat-header-name-details">
            <span className="chat-header-name">{activeChat.name}</span>
            <span className="chat-header-status">
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
                  <div className="bubble">{msg.text}</div>
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

      {/* Chat Input Bar */}
      <div className="chat-input-area">
        <button className="action-btn" style={{ padding: "8px" }}>
          <Plus size={20} style={{ color: "var(--text-secondary)" }} />
        </button>

        <div className="input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="iMessage"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <div className="input-actions">
            <Smile size={18} style={{ color: "var(--text-secondary)", cursor: "pointer", marginRight: "6px" }} />
          </div>
        </div>

        <button
          onClick={onSendMessage}
          className="send-btn"
          disabled={!inputText.trim()}
        >
          <Send size={13} style={{ transform: "rotate(-45deg) translate(1px, -1px)" }} />
        </button>
      </div>
    </div>
  );
}
