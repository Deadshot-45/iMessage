import React, { createContext, useContext, useEffect, useState } from "react";

export interface Wallpaper {
  id: string;
  name: string;
  type: "gradient" | "image";
  value: string; // CSS background-image string
  thumbnail: string;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "system",
    name: "System Default",
    type: "gradient",
    value: "", // Falls back to default --app-bg
    thumbnail: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)", // visual preview
  },
  {
    id: "fluid-abstract",
    name: "iOS Fluid",
    type: "image",
    value: "url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "aurora",
    name: "Aurora Glow",
    type: "image",
    value: "url(https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80)",
    thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "cosmic",
    name: "Cosmic Dark",
    type: "image",
    value: "url(https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80)",
    thumbnail: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "sunset",
    name: "Sunset Waves",
    type: "image",
    value: "url(https://images.unsplash.com/photo-1618005198143-e52834643661?auto=format&fit=crop&w=1200&q=80)",
    thumbnail: "https://images.unsplash.com/photo-1618005198143-e52834643661?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "beach",
    name: "Golden Hour",
    type: "image",
    value: "url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80)",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=120&q=80",
  },
];

interface WallpaperProviderState {
  wallpaper: string;
  setWallpaper: (id: string) => void;
  currentWallpaper: Wallpaper;
}

const WallpaperProviderContext = createContext<WallpaperProviderState | undefined>(undefined);

export function WallpaperProvider({
  children,
  defaultWallpaper = "system",
  storageKey = "imessage-ui-wallpaper",
}: {
  children: React.ReactNode;
  defaultWallpaper?: string;
  storageKey?: string;
}) {
  const [wallpaperId, setWallpaperId] = useState<string>(
    () => localStorage.getItem(storageKey) || defaultWallpaper
  );

  const currentWallpaper = WALLPAPERS.find((w) => w.id === wallpaperId) || WALLPAPERS[0];

  useEffect(() => {
    const root = window.document.documentElement;
    if (currentWallpaper.id === "system") {
      // Remove inline style so it falls back to CSS defined var(--app-bg)
      root.style.removeProperty("--app-bg");
    } else {
      // Set the dynamic background image on root
      root.style.setProperty("--app-bg", currentWallpaper.value);
    }
  }, [currentWallpaper]);

  const value = {
    wallpaper: wallpaperId,
    setWallpaper: (id: string) => {
      localStorage.setItem(storageKey, id);
      setWallpaperId(id);
    },
    currentWallpaper,
  };

  return (
    <WallpaperProviderContext.Provider value={value}>
      {children}
    </WallpaperProviderContext.Provider>
  );
}

export const useWallpaper = () => {
  const context = useContext(WallpaperProviderContext);
  if (context === undefined) {
    throw new Error("useWallpaper must be used within a WallpaperProvider");
  }
  return context;
};
