import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "./ui/dialog";
import {
  Search,
  Settings as GeneralIcon,
  Palette,
  Bell,
  MessageSquare,
  Shield,
  Volume2,
  Ban,
  Check,
  ChevronRight,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useTheme } from "./provider/theme-provider";
import { useAccent, ACCENTS } from "./provider/accent-provider";
import { useAuthStore } from "@/store/useAuthStore";
import { useClerk } from "@clerk/react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeNav, setActiveNav] = useState<"general" | "appearance" | "notifications" | "messages" | "privacy">("appearance");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"main" | "appearance">("main");
  const [textSize, setTextSize] = useState(15);
  const [sendReadReceipts, setSendReadReceipts] = useState(true);

  const { theme, setTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const authUser = useAuthStore((state) => state.authUser);
  const { signOut } = useClerk();

  const displayName = authUser?.fullName || authUser?.username || "Alex Carter";
  const displayEmail = authUser?.email || "sarah.j@example.com";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-185 sm:max-w-185 md:max-w-185 max-w-[95vw] p-0 overflow-hidden rounded-3xl border border-black/10 dark:border-white/12 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-2xl"
      >
        {/* Desktop View (Image 2) */}
        <div className="hidden md:flex h-130 w-full select-none">
          {/* Left Sidebar */}
          <div className="w-56 bg-black/4 dark:bg-white/4 border-r border-black/8 dark:border-white/8 p-4 flex flex-col gap-3 shrink-0">
            {/* Traffic Lights */}
            <div className="traffic-lights mb-1">
              <div
                className="traffic-light close cursor-pointer"
                onClick={() => onOpenChange(false)}
                title="Close"
              />
              <div className="traffic-light minimize" title="Minimize" />
              <div className="traffic-light maximize" title="Maximize" />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-1 mt-1">
              <button
                type="button"
                onClick={() => setActiveNav("general")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border-0 ${
                  activeNav === "general"
                    ? "bg-[#007aff] text-white font-semibold shadow-xs"
                    : "text-foreground hover:bg-black/5 dark:hover:bg-white/5 bg-transparent font-medium"
                }`}
              >
                <GeneralIcon size={15} />
                <span>General</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav("appearance")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border-0 ${
                  activeNav === "appearance"
                    ? "bg-[#007aff] text-white font-semibold shadow-xs"
                    : "text-foreground hover:bg-black/5 dark:hover:bg-white/5 bg-transparent font-medium"
                }`}
              >
                <Palette size={15} />
                <span>Appearance</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav("notifications")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border-0 ${
                  activeNav === "notifications"
                    ? "bg-[#007aff] text-white font-semibold shadow-xs"
                    : "text-foreground hover:bg-black/5 dark:hover:bg-white/5 bg-transparent font-medium"
                }`}
              >
                <Bell size={15} />
                <span>Notifications</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav("messages")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border-0 ${
                  activeNav === "messages"
                    ? "bg-[#007aff] text-white font-semibold shadow-xs"
                    : "text-foreground hover:bg-black/5 dark:hover:bg-white/5 bg-transparent font-medium"
                }`}
              >
                <MessageSquare size={15} />
                <span>Messages</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveNav("privacy")}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border-0 ${
                  activeNav === "privacy"
                    ? "bg-[#007aff] text-white font-semibold shadow-xs"
                    : "text-foreground hover:bg-black/5 dark:hover:bg-white/5 bg-transparent font-medium"
                }`}
              >
                <Shield size={15} />
                <span>Privacy & Security</span>
              </button>
            </div>
          </div>

          {/* Right Main Content Pane */}
          <div className="flex-1 flex flex-col justify-between p-7 overflow-y-auto bg-transparent">
            {activeNav === "appearance" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground!">
                    Appearance
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize how Messages looks on your screen.
                  </p>
                </div>

                {/* Accent Color Palette (6 Swatches) */}
                <div>
                  <h3 className="text-xs font-bold text-foreground mb-3">
                    Accent Color
                  </h3>
                  <div className="flex items-center gap-3">
                    {ACCENTS.slice(0, 6).map((ac) => {
                      const isSelected = ac.id === accent;
                      return (
                        <button
                          key={ac.id}
                          type="button"
                          onClick={() => setAccent(ac.id)}
                          title={ac.name}
                          className={`size-8 rounded-full border cursor-pointer transition-transform hover:scale-110 p-0 relative flex items-center justify-center ${
                            isSelected
                              ? "ring-2 ring-offset-2 ring-[#007aff] border-white"
                              : "border-black/10 dark:border-white/10"
                          }`}
                          style={{ backgroundColor: ac.colors[0] }}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              className="text-white drop-shadow"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mode (3 Window Mockup Cards: Light, Dark, Auto) */}
                <div>
                  <h3 className="text-xs font-bold text-foreground mb-3">
                    Mode
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Light Card */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setTheme("light")}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`w-full aspect-[4/2.6] rounded-xl border p-2 flex flex-col justify-between bg-zinc-100 transition-all ${
                          theme === "light"
                            ? "border-[#007aff] ring-2 ring-[#007aff]/20 shadow-md"
                            : "border-black/10 dark:border-white/10 hover:border-black/20"
                        }`}
                      >
                        <div className="flex gap-1">
                          <div className="size-1.5 rounded-full bg-zinc-300" />
                          <div className="size-1.5 rounded-full bg-zinc-300" />
                          <div className="size-1.5 rounded-full bg-zinc-300" />
                        </div>
                        <div className="w-12 h-2 rounded-md bg-zinc-200" />
                        <div className="self-end w-14 h-3 rounded-full bg-blue-600 shadow-2xs" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        Light
                      </span>
                    </div>

                    {/* Dark Card */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setTheme("dark")}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`w-full aspect-[4/2.6] rounded-xl border p-2 flex flex-col justify-between bg-zinc-900 transition-all ${
                          theme === "dark"
                            ? "border-[#007aff] ring-2 ring-[#007aff]/20 shadow-md"
                            : "border-black/10 dark:border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex gap-1">
                          <div className="size-1.5 rounded-full bg-zinc-700" />
                          <div className="size-1.5 rounded-full bg-zinc-700" />
                          <div className="size-1.5 rounded-full bg-zinc-700" />
                        </div>
                        <div className="w-12 h-2 rounded-md bg-zinc-800" />
                        <div className="self-end w-14 h-3 rounded-full bg-sky-400 shadow-2xs" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        Dark
                      </span>
                    </div>

                    {/* Auto Card */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setTheme("system")}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <div
                        className={`w-full aspect-[4/2.6] rounded-xl border overflow-hidden flex transition-all ${
                          theme === "system"
                            ? "border-[#007aff] ring-2 ring-[#007aff]/20 shadow-md"
                            : "border-black/10 dark:border-white/10 hover:border-black/20"
                        }`}
                      >
                        <div className="w-1/2 h-full bg-zinc-100 p-2 flex flex-col justify-between">
                          <div className="flex gap-0.5">
                            <div className="size-1.5 rounded-full bg-zinc-300" />
                            <div className="size-1.5 rounded-full bg-zinc-300" />
                          </div>
                          <div className="w-6 h-2 rounded-md bg-zinc-200" />
                        </div>
                        <div className="w-1/2 h-full bg-zinc-900 p-2 flex flex-col justify-end items-end">
                          <div className="w-7 h-3 rounded-full bg-blue-500" />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        Auto
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Text Size Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-card-foreground!">
                      Message Text Size
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {textSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="w-full accent-[#007aff] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeNav === "notifications" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground!">
                    Notifications
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage incoming banner and alert sounds.
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">
                      Show Message Previews
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-[#007aff]"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">
                      Play Message Sound
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-[#007aff]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeNav === "messages" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground!">
                    Messages
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Control message receipts and storage.
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">
                      Send Read Receipts
                    </span>
                    <input
                      type="checkbox"
                      checked={sendReadReceipts}
                      onChange={(e) => setSendReadReceipts(e.target.checked)}
                      className="accent-[#007aff]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeNav === "privacy" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground!">
                    Privacy & Security
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage blocked callers and encryption keys.
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-foreground">
                      Blocked Contacts
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      12
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeNav === "general" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground!">
                    General
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    System preferences and account information.
                  </p>
                </div>
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-semibold text-foreground shrink-0">
                      User Name
                    </span>
                    <span className="text-xs text-muted-foreground font-medium truncate max-w-[260px] text-right">
                      {displayName}
                    </span>
                  </div>
                  <div className="h-px bg-black/5 dark:bg-white/5 w-full" />
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-xs font-semibold text-foreground shrink-0">
                      Account Email
                    </span>
                    <span
                      className="text-xs text-muted-foreground font-medium truncate max-w-[260px] text-right"
                      title={displayEmail}
                    >
                      {displayEmail}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Done Action */}
            <div className="flex justify-end pt-4 border-t border-black/6 dark:border-white/8 mt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="bg-[#007aff] hover:bg-[#0070eb] text-white text-xs font-semibold px-6 py-2 rounded-full cursor-pointer transition-colors shadow-sm border-0"
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* Mobile View (Image 1) */}
        <div className="flex md:hidden flex-col h-140 w-full bg-zinc-50 dark:bg-zinc-900 text-foreground overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-black/6 dark:border-white/8">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-1 text-[#007aff] text-sm font-medium bg-transparent border-0 cursor-pointer"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>
            <h3 className="text-base font-bold text-card-foreground!">
              Settings
            </h3>
            <div className="w-12" />
          </div>

          {/* User Profile Card */}
          <div className="p-4">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-[#007aff]/20 text-[#007aff] font-bold flex items-center justify-center text-base ring-2 ring-[#007aff]/20">
                  {displayName[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground leading-tight">
                    {displayName}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Apple ID, iCloud, Media & Purchases
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </div>
          </div>

          {/* Squircle Settings Menu */}
          <div className="px-4 pb-6 flex flex-col gap-2">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl p-1.5 shadow-2xs divide-y divide-black/4 dark:divide-white/4">
              {/* Appearance */}
              <div
                className="flex items-center justify-between p-2.5 cursor-pointer"
                onClick={() =>
                  setMobileView(
                    mobileView === "appearance" ? "main" : "appearance",
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-[#007aff] text-white flex items-center justify-center shadow-2xs">
                    <Palette size={15} />
                  </div>
                  <span className="text-xs font-semibold text-card-foreground!">
                    Appearance
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <span className="capitalize">{accent}</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-2.5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-2xs">
                    <Bell size={15} />
                  </div>
                  <span className="text-xs font-semibold text-card-foreground!">
                    Notifications
                  </span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>

              {/* Sounds */}
              <div className="flex items-center justify-between p-2.5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-pink-500 text-white flex items-center justify-center shadow-2xs">
                    <Volume2 size={15} />
                  </div>
                  <span className="text-xs font-semibold text-card-foreground!">
                    Sounds
                  </span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>

              {/* Privacy & Security */}
              <div className="flex items-center justify-between p-2.5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                    <Shield size={15} />
                  </div>
                  <span className="text-xs font-semibold text-card-foreground!">
                    Privacy & Security
                  </span>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>

              {/* Blocked Contacts */}
              <div className="flex items-center justify-between p-2.5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-zinc-500 text-white flex items-center justify-center shadow-2xs">
                    <Ban size={15} />
                  </div>
                  <span className="text-xs font-semibold text-card-foreground!">
                    Blocked Contacts
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <span>12</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Send Read Receipts */}
              <div className="flex items-center justify-between p-2.5">
                <div className="flex items-center gap-3">
                  <div className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                    <Check size={15} />
                  </div>
                  <span className="text-xs font-semibold text-card-foreground!">
                    Send Read Receipts
                  </span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={sendReadReceipts}
                    onChange={() => setSendReadReceipts(!sendReadReceipts)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* Sign Out Action */}
            <div className="p-2">
              <button
                type="button"
                onClick={() => signOut()}
                className="text-red-500 hover:text-red-600 font-semibold text-xs py-2 w-full text-left bg-transparent border-0 cursor-pointer flex items-center gap-2"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
