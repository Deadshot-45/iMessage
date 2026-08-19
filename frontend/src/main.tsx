import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./components/provider/theme-provider.tsx";
import { WallpaperProvider } from "./components/provider/wallpaper-provider.tsx";
import { AccentProvider } from "./components/provider/accent-provider.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";
import { PersistGate } from "./components/PersistGate.tsx";
import { useChatStore } from "./store/useChatStore.ts";
import { LoadingScreen } from "./components/SuspenseLoader.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <WallpaperProvider>
          <AccentProvider>
            <PersistGate store={useChatStore} loading={<LoadingScreen />}>
              <App />
            </PersistGate>
          </AccentProvider>
        </WallpaperProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
