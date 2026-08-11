import { Phone, Video, Trash2, ImageIcon, Shield } from "lucide-react";
import type { Conversation } from "../types";

interface DetailsPanelProps {
  activeChat: Conversation;
  isMuted: boolean;
  onToggleMute: () => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export function DetailsPanel({
  activeChat,
  isMuted,
  onToggleMute,
  onClearHistory,
  onClose,
}: DetailsPanelProps) {
  const initials = activeChat.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="imessage-details-panel">
      {/* Header */}
      <div className="details-header">
        <h3 className="details-title">Details</h3>
        <button className="action-btn" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Content */}
      <div className="details-content">
        <div className="details-avatar-section">
          <div className="details-avatar" style={{ backgroundColor: activeChat.avatarColor }}>
            {initials}
          </div>
          <h4 className="details-name">{activeChat.name}</h4>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{activeChat.status}</span>
        </div>

        {/* Call Actions */}
        <div className="details-actions-grid">
          <button className="details-action-btn" onClick={() => alert("Calling...")}>
            <div className="details-action-circle">
              <Phone size={16} />
            </div>
            <span>call</span>
          </button>
          <button className="details-action-btn" onClick={() => alert("Starting video call...")}>
            <div className="details-action-circle">
              <Video size={18} />
            </div>
            <span>video</span>
          </button>
        </div>

        {/* Action Toggles */}
        <div className="details-section">
          <div className="details-section-row toggle">
            <span>Mute Notifications</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isMuted}
                onChange={onToggleMute}
              />
              <span className="slider"></span>
            </label>
          </div>
          <div className="details-section-row" onClick={onClearHistory}>
            <span>Clear Chat History</span>
            <Trash2 size={14} style={{ color: "var(--text-secondary)" }} />
          </div>
        </div>

        {/* Shared Media */}
        <div className="details-section">
          <div className="details-section-row header" style={{ cursor: "default", fontWeight: "600", fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Shared Media & Options
          </div>
          <div className="details-section-row">
            <span>Photos</span>
            <ImageIcon size={14} style={{ color: "var(--text-secondary)" }} />
          </div>
          <div className="details-section-row">
            <span>Links</span>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>0 links</span>
          </div>
        </div>

        {/* Danger Options */}
        <div className="details-section">
          <div className="details-section-row danger" style={{ justifyContent: "center", fontWeight: "600" }} onClick={() => alert("User Blocked")}>
            Block this Caller
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center", color: "var(--text-secondary)", fontSize: "11px", marginTop: "12px" }}>
          <Shield size={12} /> End-to-end Encrypted
        </div>
      </div>
    </div>
  );
}
