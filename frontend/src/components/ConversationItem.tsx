import { memo } from "react";
import { Bell, ImageIcon, Video } from "lucide-react";
import type { Conversation } from "../types";

interface ConversationItemProps {
  conv: Conversation;
  isActive: boolean;
  isTyping: boolean;
  isMuted: boolean;
  isMessageDisable?: boolean;
  onClick: () => void;
}

export const ConversationItem = memo(function ConversationItem({
  conv,
  isActive,
  isTyping,
  isMuted,
  isMessageDisable = true,
  onClick,
}: ConversationItemProps) {
  const lastMessage = conv.messages[conv.messages.length - 1];
  const initials = conv.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const unreadCount = conv.unreadCount || 0;
  const showUnreadBadge = unreadCount > 0 && !isActive;

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
          <span className="conv-time">
            {lastMessage ? lastMessage.timestamp : ""}
          </span>
        </div>
        <div className="conv-last-msg-container">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {isMessageDisable && (
              <p className="conv-last-msg">
                {isTyping ? (
                  <span
                    style={{ color: "var(--imessage-blue)", fontWeight: "500" }}
                  >
                    typing...
                  </span>
                ) : lastMessage ? (
                  (() => {
                    const prefix = lastMessage.sender === "me" ? "You: " : "";
                    if (lastMessage.mediaType === "image") {
                      return (
                        <span className="flex items-center gap-1">
                          {prefix && <span>{prefix}</span>}
                          <ImageIcon
                            size={12}
                            className="inline shrink-0 opacity-70"
                          />
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
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {lastMessage?.sender === "me" && !isTyping && (
              <span className="text-[11px] opacity-70 leading-none select-none">
                {lastMessage.status === "seen" ? (
                  <span className="text-sky-500 font-bold" style={{ letterSpacing: "-1.5px" }}>
                    ✓✓
                  </span>
                ) : lastMessage.status === "delivered" ? (
                  <span className="text-muted-foreground font-semibold" style={{ letterSpacing: "-1.5px" }}>
                    ✓✓
                  </span>
                ) : (
                  <span className="text-muted-foreground">✓</span>
                )}
              </span>
            )}
            {isMuted && (
              <Bell
                size={12}
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
              />
            )}
            {showUnreadBadge ? (
              <span className="unread-count-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : conv.unread && !isActive ? (
              <div className="unread-dot" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
});

