import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

export interface AccentColor {
  id: string;
  name: string;
  color: string;
  grad: string;
  activeLight: string;
  activeDark: string;
  colors: string[];
}

export const ACCENTS: AccentColor[] = [
  {
    id: "blue",
    name: "Classic Blue",
    color: "#007aff",
    grad: "linear-gradient(180deg, #3a9cff 0%, #007aff 100%)",
    activeLight: "rgba(0, 122, 255, 0.1)",
    activeDark: "rgba(0, 122, 255, 0.2)",
    colors: ["#ffffff", "#f2f2f7", "#5ac8fa", "#007aff"],
  },
  {
    id: "lavender",
    name: "Pastel Violet",
    color: "#8B5CF6",
    grad: "linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)",
    activeLight: "rgba(139, 92, 246, 0.1)",
    activeDark: "rgba(139, 92, 246, 0.2)",
    colors: ["#fff4bf", "#f3c5ff", "#e599ff", "#8b5cf6"],
  },
  {
    id: "plum",
    name: "Deep Plum",
    color: "#522a43",
    grad: "linear-gradient(180deg, #7D3E57 0%, #522a43 100%)",
    activeLight: "rgba(82, 42, 67, 0.1)",
    activeDark: "rgba(82, 42, 67, 0.2)",
    colors: ["#2d3238", "#7d3e57", "#522a43", "#f3f4f6"],
  },
  {
    id: "forest",
    name: "Forest Green",
    color: "#2D5D46",
    grad: "linear-gradient(180deg, #3E8262 0%, #2D5D46 100%)",
    activeLight: "rgba(45, 93, 70, 0.1)",
    activeDark: "rgba(45, 93, 70, 0.2)",
    colors: ["#1c2e24", "#2d5d46", "#f0e5b5", "#d97706"],
  },
  {
    id: "ocean",
    name: "Ocean & Sunset",
    color: "#1E40AF",
    grad: "linear-gradient(180deg, #3B82F6 0%, #1E40AF 100%)",
    activeLight: "rgba(30, 64, 175, 0.1)",
    activeDark: "rgba(30, 64, 175, 0.2)",
    colors: ["#f472b6", "#fcb34d", "#4ade80", "#1e40af"],
  },
  {
    id: "terracotta",
    name: "Terracotta Olive",
    color: "#EA580C",
    grad: "linear-gradient(180deg, #F97316 0%, #EA580C 100%)",
    activeLight: "rgba(234, 88, 12, 0.1)",
    activeDark: "rgba(234, 88, 12, 0.2)",
    colors: ["#991b1b", "#ea580c", "#eab308", "#1b5e20"],
  },
  {
    id: "emerald",
    name: "Emerald Gold",
    color: "#064E3B",
    grad: "linear-gradient(180deg, #059669 0%, #064E3B 100%)",
    activeLight: "rgba(6, 78, 59, 0.12)",
    activeDark: "rgba(6, 78, 59, 0.24)",
    colors: ["#064e3b", "#fef3c7", "#f59e0b", "#78350f"],
  },
  {
    id: "pink",
    name: "Vibrant Pink",
    color: "#ff2d55",
    grad: "linear-gradient(180deg, #ff6685 0%, #ff2d55 100%)",
    activeLight: "rgba(255, 45, 85, 0.1)",
    activeDark: "rgba(255, 45, 85, 0.2)",
    colors: ["#fff0f2", "#ffccd5", "#ff809b", "#ff2d55"],
  },
];

interface AccentProviderState {
  accent: string;
  setAccent: (id: string) => void;
  currentAccent: AccentColor;
}

const AccentProviderContext = createContext<AccentProviderState | undefined>(undefined);

export function AccentProvider({
  children,
  defaultAccent = "blue",
  storageKey = "imessage-ui-accent",
}: {
  children: React.ReactNode;
  defaultAccent?: string;
  storageKey?: string;
}) {
  const { theme } = useTheme();
  const [accentId, setAccentId] = useState<string>(
    () => localStorage.getItem(storageKey) || defaultAccent
  );

  const currentAccent = ACCENTS.find((a) => a.id === accentId) || ACCENTS[0];

  useEffect(() => {
    const root = window.document.documentElement;

    let isDark = false;
    if (theme === "dark") {
      isDark = true;
    } else if (theme === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    root.style.setProperty("--imessage-blue", currentAccent.color);
    root.style.setProperty("--imessage-blue-grad", currentAccent.grad);
    root.style.setProperty(
      "--active-list-bg",
      isDark ? currentAccent.activeDark : currentAccent.activeLight
    );
  }, [currentAccent, theme]);

  const value = {
    accent: accentId,
    setAccent: (id: string) => {
      localStorage.setItem(storageKey, id);
      setAccentId(id);
    },
    currentAccent,
  };

  return (
    <AccentProviderContext.Provider value={value}>
      {children}
    </AccentProviderContext.Provider>
  );
}

export const useAccent = () => {
  const context = useContext(AccentProviderContext);
  if (context === undefined) {
    throw new Error("useAccent must be used within an AccentProvider");
  }
  return context;
};
