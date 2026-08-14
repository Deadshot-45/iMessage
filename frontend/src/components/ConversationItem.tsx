import { Bell, ImageIcon, Video } from "lucide-react";
import type { Conversation } from "../types";

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  isTyping: boolean;
  isMuted: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conv,
  isActive,
  isTyping,
  isMuted,
  onClick,
}: ConversationItemProps) {
  const lastMessage = conv.messages[conv.messages.length - 1];
  const initials = conv.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      onClick={onClick}
      className={`conversation-item ${isActive ? "active" : ""}`}
    >
      <div className="avatar-wrapper">
        <div className="avatar" style={{ backgroundColor: conv.avatarColor }}>
          {initials}
        </div>
        {conv.status === "Online" && <div className="status-badge" />}
      </div>

      <div className="conv-details">
        <div className="conv-meta">
          <h3 className="conv-name">{conv.name}</h3>
          <span className="conv-time">{lastMessage ? lastMessage.timestamp : ""}</span>
        </div>
        <div className="conv-last-msg-container">
          <p className="conv-last-msg">
            {isTyping ? (
              <span style={{ color: "var(--imessage-blue)", fontWeight: "500" }}>typing...</span>
            ) : lastMessage ? (
              (() => {
                const prefix = lastMessage.sender === "me" ? "You: " : "";
                if (lastMessage.mediaType === "image") {
                  return (
                    <span className="flex items-center gap-1">
                      {prefix && <span>{prefix}</span>}
                      <ImageIcon size={12} className="inline shrink-0 opacity-70" />
                      <span>Photo</span>
                    </span>
                  );
                }
                if (lastMessage.mediaType === "video") {
                  return (
                    <span className="flex items-center gap-1">
                      {prefix && <span>{prefix}</span>}
                      <Video size={12} className="inline shrink-0 opacity-70" />
                      <span>Video</span>
                    </span>
                  );
                }
                return `${prefix}${lastMessage.text}`;
              })()
            ) : (
              "No messages yet"
            )}
          </p>
          {isMuted && <Bell size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
          {conv.unread && <div className="unread-dot" />}
        </div>
      </div>
    </div>
  );
}
