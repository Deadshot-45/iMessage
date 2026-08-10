import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/react";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#16171d",
        color: "#ffffff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "20px",
        textAlign: "center"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "480px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ margin: "0 0 12px", color: "#ff3b30", fontSize: "22px" }}>Clerk Key Missing</h2>
          <p style={{ margin: "0 0 20px", color: "#a1a1a6", fontSize: "14px", lineHeight: "1.6" }}>
            The application is showing a blank page because the <strong>Clerk Publishable Key</strong> is not configured.
          </p>
          <div style={{ textAlign: "left", background: "#1f2028", padding: "16px", borderRadius: "8px", fontSize: "13px", color: "#34c759", fontFamily: "monospace", margin: "16px 0" }}>
            # In /frontend/.env<br/>
            VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
          </div>
          <p style={{ margin: "0", color: "#86868b", fontSize: "12px" }}>
            Add the key to your <code>.env</code> file in the <code>frontend</code> folder, or define it in your Render environment variables, then restart the server.
          </p>
        </div>
      </div>
    </StrictMode>
  );
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ClerkProvider publishableKey={publishableKey}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
}
