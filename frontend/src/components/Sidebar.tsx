import { UserButton } from "@clerk/react";
import { Search, MoreVertical } from "lucide-react";
import type { Conversation } from "../types";
import { ConversationItem } from "./ConversationItem";
import { ModeToggle } from "./mode-toggle";
import { WallpaperToggle } from "./wallpaper-toggle";
import { AccentToggle } from "./accent-toggle";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface SidebarProps {
  conversations: Conversation[];
  activeChatId: number | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectConversation: (id: number) => void;
  isTypingId: number | null;
  mutedChats: Record<number, boolean>;
}

export function Sidebar({
  conversations,
  activeChatId,
  searchQuery,
  setSearchQuery,
  onSelectConversation,
  isTypingId,
  mutedChats,
}: SidebarProps) {

  return (
    <div className="imessage-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">Messages</h2>
        <div className="sidebar-actions">
          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 size-8 rounded-full cursor-pointer flex items-center justify-center transition-all duration-150 outline-none border-0 bg-transparent">
              <MoreVertical size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 p-2.5 rounded-2xl border border-black/8 dark:border-white/12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl flex flex-col gap-2"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                Preferences
              </div>
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl justify-between">
                <WallpaperToggle />
                <AccentToggle />
                <ModeToggle />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="size-8 flex items-center justify-center">
            <UserButton />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <div className="search-input-container">
          <Search size={14} className="search-icon" />
          <Input
            type="text"
            className="search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          >
            No conversations found
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              isActive={activeChatId === conv.id}
              isTyping={isTypingId === conv.id}
              isMuted={!!mutedChats[conv.id]}
              onClick={() => onSelectConversation(conv.id)}
            />
          ))
        )}
      </div>

      {/* Sidebar Footer */}
      {/*<div className="sidebar-footer">
        <div className="sidebar-user">
          <div
            className="avatar"
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "var(--search-bg)",
            }}
          >
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            ) : (
              user?.firstName?.[0] || "U"
            )}
          </div>
          <div className="user-name-wrapper">
            <span className="user-full-name">{user?.fullName || "User"}</span>
            <span className="user-email">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </span>
          </div>
        </div>
      </div>*/}
    </div>
  );
}
