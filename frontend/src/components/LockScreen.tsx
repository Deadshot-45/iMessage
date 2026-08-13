import { ModeToggle } from "./mode-toggle";
import { AuthHeroPanel } from "./auth/AuthHeroPanel";
import { AuthActionPanel } from "./auth/AuthActionPanel";
import { WallpaperToggle } from "./wallpaper-toggle";
import { AccentToggle } from "./accent-toggle";
import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "./SuspenseLoader";

export const APP_NAME = "iMessage";

const LockScreen = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen />;
  if (isSignedIn) return <Navigate to="/" replace />;
  return (
    <main className="imessage-window mx-auto flex w-full max-w-md md:max-w-[1180px] flex-1 flex-col overflow-hidden text-foreground">
      <nav className="w-full border-b border-border p-3">
        <section className="flex items-center justify-between gap-4">
          <article className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="size-8" />
            <div>
              <p className="text-foreground text-sm! mx-0! font-bold">{APP_NAME}</p>
              <p className="text-muted-foreground text-xs! mx-0! font-medium">
                Wednesday, 12 August
              </p>
            </div>
          </article>
          <div className="flex items-center gap-1.5">
            <WallpaperToggle />
            <AccentToggle />
            <ModeToggle />
          </div>
        </section>
      </nav>
      <main className="relative flex flex-1 flex-col bg-background overflow-y-auto md:overflow-hidden md:flex-row">
        <AuthHeroPanel />
        <AuthActionPanel />
      </main>
    </main>
  );
};

export default LockScreen;


