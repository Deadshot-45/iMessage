import { SignInButton, SignUpButton } from "@clerk/react";
import { MessageSquare, Lock, ArrowRight } from "lucide-react";

export function LockScreen() {
  return (
    <div className="imessage-container" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
      <div className="imessage-window" style={{ maxWidth: "420px", height: "640px", flexDirection: "column", padding: "32px", justifyContent: "space-between", alignItems: "center", background: "rgba(30, 30, 45, 0.65)" }}>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "40px" }}>
          <div className="empty-state-logo" style={{ animation: "pulse 2s infinite" }}>
            <MessageSquare size={44} />
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#ffffff", margin: "16px 0 8px", letterSpacing: "-1px" }}>iMessage</h1>
          <p style={{ fontSize: "14px", color: "#a1a1a6", textAlign: "center", maxWidth: "260px", lineHeight: "1.5" }}>
            Sign in to start messaging with friends, family, and AI assistant models.
          </p>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
          <SignInButton mode="modal">
            <button style={{ width: "100%", background: "#007aff", border: "none", color: "#ffffff", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "transform 0.15s" }}>
              Sign In <ArrowRight size={16} />
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button style={{ width: "100%", background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s" }}>
              Create Account
            </button>
          </SignUpButton>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#636366", fontSize: "11px" }}>
          <Lock size={12} /> End-to-end encrypted
        </div>
      </div>
    </div>
  );
}
