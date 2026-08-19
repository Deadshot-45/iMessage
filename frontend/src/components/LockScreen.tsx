
import { AuthHeroPanel } from "./auth/AuthHeroPanel";
import { AuthActionPanel } from "./auth/AuthActionPanel";
import { useAuthStore } from "@/store/useAuthStore";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "./SuspenseLoader";

export const APP_NAME = "iMessage";

const LockScreen = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  if (isCheckingAuth) return <LoadingScreen />;
  if (authUser) return <Navigate to="/" replace />;

  return (
    <main className="imessage-container relative flex w-full min-h-screen md:h-screen flex-1 flex-col md:flex-row overflow-y-auto md:overflow-hidden text-foreground bg-[#FAFAFC] dark:bg-[#121214]">
      <div className="imessage-window">
        {/* Top Left Traffic Lights */}
        <div className="absolute top-6 left-6 z-30 flex items-center gap-2">
          <div
            className="size-3 rounded-full bg-[#FF5F56] border border-black/10 shadow-xs cursor-pointer hover:brightness-90 transition-all"
            title="Close"
          />
          <div
            className="size-3 rounded-full bg-[#FFBD2E] border border-black/10 shadow-xs cursor-pointer hover:brightness-90 transition-all"
            title="Minimize"
          />
          <div
            className="size-3 rounded-full bg-[#27C93F] border border-black/10 shadow-xs cursor-pointer hover:brightness-90 transition-all"
            title="Maximize"
          />
        </div>

        {/* Left Column: Sign In Form Card */}
        <AuthActionPanel />

        {/* Right Column: Sequoia Glass Preview Message Thread */}
        <AuthHeroPanel />
      </div>
    </main>
  );
};

export default LockScreen;
