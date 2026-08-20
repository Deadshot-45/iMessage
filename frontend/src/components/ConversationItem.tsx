import { memo } from "react";
import { Bell, ImageIcon, Video, Mic } from "lucide-react";
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
  const lastMessage =
    conv.messages && conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1]
      : null;

  const initials = (conv.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("");

  const unreadCount = conv.unreadCount || 0;
  const showUnreadBadge = unreadCount > 0 && !isActive;

  const lastMsgText =
    lastMessage?.text || (lastMessage as any)?.message || "";
  const lastMsgMediaType = lastMessage?.mediaType;
  const isSentByMe = lastMessage?.sender === "me";
  const prefix = isSentByMe ? "You: " : "";

  const timestamp =
    lastMessage?.timestamp ||
    ((lastMessage as any)?.createdAt
      ? new Date((lastMessage as any)?.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "");

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
          <span className="conv-time">{timestamp}</span>
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
                    if (
                      lastMsgMediaType === "image" ||
                      lastMsgMediaType === "gif"
                    ) {
                      return (
                        <span className="flex items-center gap-1">
                          {prefix && <span>{prefix}</span>}
                          <ImageIcon
                            size={12}
                            className="inline shrink-0 opacity-70"
                          />
                          <span>{lastMsgText ? lastMsgText : "Photo"}</span>
                        </span>
                      );
                    }
                    if (lastMsgMediaType === "video") {
                      return (
                        <span className="flex items-center gap-1">
                          {prefix && <span>{prefix}</span>}
                          <Video
                            size={12}
                            className="inline shrink-0 opacity-70"
                          />
                          <span>{lastMsgText ? lastMsgText : "Video"}</span>
                        </span>
                      );
                    }
                    if (lastMsgMediaType === "audio") {
                      return (
                        <span className="flex items-center gap-1">
                          {prefix && <span>{prefix}</span>}
                          <Mic size={12} className="inline shrink-0 opacity-70" />
                          <span>
                            {lastMsgText ? lastMsgText : "Voice message"}
                          </span>
                        </span>
                      );
                    }
                    return lastMsgText
                      ? `${prefix}${lastMsgText}`
                      : "No messages yet";
                  })()
                ) : (
                  "No messages yet"
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-1">
            {isSentByMe && !isTyping && (
              <span className="text-[11px] opacity-70 leading-none select-none">
                {lastMessage?.status === "seen" ? (
                  <span
                    className="text-sky-500 font-bold"
                    style={{ letterSpacing: "-1.5px" }}
                  >
                    ✓✓
                  </span>
                ) : lastMessage?.status === "delivered" ? (
                  <span
                    className="text-muted-foreground font-semibold"
                    style={{ letterSpacing: "-1.5px" }}
                  >
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
