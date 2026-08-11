import { UserButton, useUser } from "@clerk/react";
import { Search } from "lucide-react";
import type { Conversation } from "../types";
import { ConversationItem } from "./ConversationItem";

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
  const { user } = useUser();

  return (
    <div className="imessage-sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">Messages</h2>
        <div className="sidebar-actions">
          <UserButton />
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <div className="search-input-container">
          <Search size={14} className="search-icon" />
          <input
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
          <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "13px" }}>
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
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar" style={{ width: "36px", height: "36px", backgroundColor: "var(--search-bg)" }}>
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
            ) : (
              user?.firstName?.[0] || "U"
            )}
          </div>
          <div className="user-name-wrapper">
            <span className="user-full-name">{user?.fullName || "User"}</span>
            <span className="user-email">{user?.primaryEmailAddress?.emailAddress || ""}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
