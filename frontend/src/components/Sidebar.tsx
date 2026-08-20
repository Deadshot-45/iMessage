import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Check,
  X,
  Clock,
  UserCheck,
  Loader2,
  Users,
  LogOut,
} from "lucide-react";
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
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";

// Lazy-load SettingsModal (code splitting)
const SettingsModal = lazy(() =>
  import("./SettingsModal").then((m) => ({ default: m.SettingsModal })),
);

const getDeterministicColor = (name: string) => {
  const colors = [
    "#ff2d55",
    "#5856d6",
    "#34c759",
    "#007aff",
    "#af52de",
    "#ff9500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface SidebarProps {
  mutedChats?: Record<string | number, boolean>;
  onSelectConversation?: (id: any) => void;
}

export function Sidebar({
  mutedChats = {},
  onSelectConversation,
}: SidebarProps) {
  const storeConversations = useChatStore((state) => state.conversations);
  const friends = useChatStore((state) => state.friends);
  const friendRequests = useChatStore((state) => state.friendRequests);
  const searchResults = useChatStore((state) => state.searchResults);
  const searchQuery = useChatStore((state) => state.searchQuery);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messages = useChatStore((state) => state.messages);
  const isSearching = useChatStore((state) => state.isSearching);

  const getFriends = useChatStore((state) => state.getFriends);
  const getFriendRequests = useChatStore((state) => state.getFriendRequests);
  const getConversations = useChatStore((state) => state.getConversations);
  const searchUser = useChatStore((state) => state.searchUser);
  const sendFriendRequest = useChatStore((state) => state.sendFriendRequest);
  const respondToFriendRequest = useChatStore(
    (state) => state.respondToFriendRequest,
  );
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);

  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const authUser = useAuthStore((state) => state.authUser);
  const logout = useAuthStore((state) => state.logout);

  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "chats" | "contacts" | "discover" | "requests"
  >("chats");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const debounceQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    getFriends();
    getFriendRequests();
    getConversations();
  }, [getFriends, getFriendRequests, getConversations]);

  // Trigger search on backend when debounceQuery changes and tab is discover
  useEffect(() => {
    if (activeTab === "discover" && debounceQuery.trim().length >= 3) {
      searchUser(debounceQuery);
    }
  }, [debounceQuery, activeTab, searchUser]);

  const handleSelect = (id: any) => {
    setActiveChatId(id);
    if (onSelectConversation) {
      onSelectConversation(id);
    }
  };

  const conversationsList = useMemo(() => {
    const list = activeTab === "chats" ? storeConversations : friends;

    const formatted = list.map((item: any) => {
      const isSelected = String(item._id) === String(activeChatId);
      const chatMessages = isSelected ? messages : [];

      const lastMsgText = item.lastMessage?.message || "";
      const lastMsgTime = item.lastMessage?.createdAt
        ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const lastMsgMediaType = item.lastMessage?.mediaType || undefined;
      const lastMsgMediaUrl = item.lastMessage?.mediaUrl || undefined;

      const fallbackLastMsg =
        lastMsgText || lastMsgMediaType
          ? [
              {
                id: "last",
                text: lastMsgText,
                sender: "them" as "me" | "them",
                timestamp: lastMsgTime,
                mediaType: lastMsgMediaType,
                mediaUrl: lastMsgMediaUrl,
              },
            ]
          : [];

      const unreadCount = isSelected ? 0 : item.unreadCount || 0;

      return {
        id: item._id,
        name: item.fullName || item.username || "User",
        avatarColor:
          item.avatarColor ||
          getDeterministicColor(item.fullName || item.username || "User"),
        status: onlineUsers.includes(item._id) ? "Online" : "Offline",
        unread: unreadCount > 0,
        unreadCount,
        messages: chatMessages.length > 0 ? chatMessages : fallbackLastMsg,
        replies: [],
      };
    });

    if (!searchQuery.trim()) return formatted;
    const q = searchQuery.toLowerCase();
    return formatted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.messages.some((m: any) => m.text?.toLowerCase().includes(q)),
    );
  }, [
    activeTab,
    storeConversations,
    friends,
    activeChatId,
    messages,
    onlineUsers,
    searchQuery,
  ]);

  const handleSendRequest = async (targetUserId: string) => {
    setLoadingActionId(targetUserId);
    try {
      const ok = await sendFriendRequest(targetUserId);
      if (ok) {
        toast.success("Friend request sent!");
      } else {
        toast.error("Failed to send request");
      }
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleRespond = async (
    requestId: string,
    status: "accepted" | "declined",
  ) => {
    setLoadingActionId(requestId);
    try {
      await respondToFriendRequest(requestId, status);
      toast.success(
        status === "accepted" ? "Friend request accepted!" : "Request declined",
      );
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none">
      {/* Code-split Lazy Settings Modal */}
      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />
        </Suspense>
      )}

      {/* Sidebar Header */}
      <div className="sidebar-header">
        {/* macOS Traffic Lights */}
        <div className="traffic-lights">
          <div className="traffic-light close" title="Close" />
          <div className="traffic-light minimize" title="Minimize" />
          <div className="traffic-light maximize" title="Maximize" />
        </div>

        <div className="sidebar-header-row">
          <h2 className="sidebar-title">Messages</h2>
          <div className="sidebar-actions flex items-center gap-1">
            <button
              type="button"
              className="size-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer border-0 text-foreground"
              title="New Message"
              onClick={() => setActiveTab("contacts")}
            >
              <span className="text-[14px] leading-none">✏️</span>
            </button>

            {/* Apple User Avatar & Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="size-7 rounded-full ml-2 text-white text-[11px] font-bold flex items-center justify-center cursor-pointer border-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20 select-none outline-none"
                style={{ backgroundColor: authUser?.avatarColor || "#007aff" }}
                title={authUser?.fullName || "Account"}
              >
                {(authUser?.fullName || authUser?.username || "U")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-2xl border border-black/8 dark:border-white/12 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl flex flex-col gap-1.5"
              >
                <div className="px-2.5 py-2 flex items-center gap-2.5">
                  <div
                    className="size-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs"
                    style={{
                      backgroundColor: authUser?.avatarColor || "#007aff",
                    }}
                  >
                    {(authUser?.fullName || authUser?.username || "U")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">
                      {authUser?.fullName || "User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      @{authUser?.username || authUser?.email}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-black/5 dark:bg-white/5 w-full" />
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-foreground cursor-pointer border-0 bg-transparent"
                >
                  <span>Settings...</span>
                  <span className="text-[10px] text-muted-foreground">⌘</span>
                </button>
                <div className="h-px bg-black/5 dark:bg-white/5 w-full" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  Quick Themes
                </div>
                <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl justify-between">
                  <WallpaperToggle />
                  <AccentToggle />
                  <ModeToggle />
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-red-500/10 text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer border-0 bg-transparent"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="search-wrapper">
        <div className="search-input-container">
          <Search size={14} className="search-icon" />
          <Input
            type="text"
            className="search-input"
            placeholder={
              activeTab === "chats"
                ? "Search"
                : activeTab === "contacts"
                  ? "Search contacts..."
                  : activeTab === "discover"
                    ? "Discover users..."
                    : "Search requests..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2
              size={14}
              className="animate-spin text-muted-foreground mr-2"
            />
          )}
        </div>
      </div>

      {/* 4 Segmented Tabs */}
      <div className="px-4 pb-2.5">
        <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl text-[11px] font-semibold gap-0.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("chats");
              setSidebarTab("chats");
              setSearchQuery("");
            }}
            className={`flex-1 py-1 px-1.5 rounded-lg transition-all duration-150 cursor-pointer text-center truncate ${
              activeTab === "chats"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Chats
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("contacts");
              setSidebarTab("users");
              setSearchQuery("");
            }}
            className={`flex-1 py-1 px-1.5 rounded-lg transition-all duration-150 cursor-pointer text-center truncate ${
              activeTab === "contacts"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Contacts
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("discover");
              setSidebarTab("users");
              setSearchQuery("");
            }}
            className={`flex-1 py-1 px-1.5 rounded-lg transition-all duration-150 cursor-pointer text-center truncate ${
              activeTab === "discover"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Discover
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("requests");
              setSidebarTab("users");
              setSearchQuery("");
            }}
            className={`flex-1 py-1 px-1.5 rounded-lg transition-all duration-150 cursor-pointer text-center truncate relative ${
              activeTab === "requests"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Requests
            {friendRequests.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="conversations-list overflow-y-auto">
        {activeTab === "chats" || activeTab === "contacts" ? (
          /* Chats / Contacts List */
          conversationsList.length === 0 ? (
            <div className="p-5 text-center text-xs text-muted-foreground">
              {activeTab === "chats"
                ? "No conversations found."
                : "No contacts found."}
            </div>
          ) : (
            conversationsList.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={String(activeChatId) === String(conv.id)}
                isTyping={false}
                isMuted={!!mutedChats[conv.id]}
                onClick={() => handleSelect(conv.id)}
                isMessageDisable={activeTab !== "contacts"}
              />
            ))
          )
        ) : (
          /* Friends & Discovery Tab */
          <div className="flex flex-col gap-2 p-2">
            {/* If user is actively searching */}
            {searchQuery.trim().length >= 3 ? (
              <div className="flex flex-col gap-1.5">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
                  Search Results
                </div>
                {searchResults.length === 0 && !isSearching ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No users matching "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map((user) => {
                    const isActing =
                      loadingActionId === user._id ||
                      loadingActionId === user.requestId;
                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-black/4 dark:border-white/4"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {user.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={user.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 font-bold flex items-center justify-center shrink-0 text-xs">
                              {user.fullName?.[0] || user.username?.[0] || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate leading-tight">
                              {user.fullName || user.username}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              @{user.username}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {user.relationship === "friends" ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium bg-emerald-500/10 px-2 py-1 rounded-lg">
                              <UserCheck size={12} />
                              {/*<span>Friends</span>*/}
                            </span>
                          ) : user.relationship === "pending_sent" ? (
                            <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium bg-amber-500/10 px-2 py-1 rounded-lg">
                              <Clock size={12} />
                              {/*<span>Requested</span>*/}
                            </span>
                          ) : user.relationship === "pending_received" ? (
                            <button
                              disabled={isActing}
                              onClick={() =>
                                handleRespond(user.requestId, "accepted")
                              }
                              className="flex items-center gap-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-medium px-2.5 py-1 rounded-lg cursor-pointer transition-colors shadow-xs"
                            >
                              {isActing ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              {/*<span>Accept</span>*/}
                            </button>
                          ) : (
                            <button
                              disabled={isActing}
                              onClick={() => handleSendRequest(user._id)}
                              className="flex items-center gap-1 text-[11px] border-2 border-black/5 dark:border-white/5 text-black dark:text-white font-medium px-2.5 py-1 rounded-lg cursor-pointer transition-colors shadow-xs"
                            >
                              {isActing ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <UserPlus size={12} />
                              )}
                              {/*<span>Add Friend</span>*/}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              /* No search active: show Pending Requests and Friends */
              <>
                {/* Pending Requests Section */}
                {friendRequests.length > 0 && (
                  <div className="flex flex-col gap-1.5 mb-2 bg-blue-500/5 dark:bg-blue-500/10 p-2.5 rounded-2xl border border-blue-500/20">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase px-1 tracking-wider">
                      <span>Friend Requests</span>
                      <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                        {friendRequests.length}
                      </span>
                    </div>

                    {friendRequests.map((req) => {
                      const requester = req.requester || {};
                      const isActing = loadingActionId === req._id;
                      return (
                        <div
                          key={req._id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-zinc-800/70 border border-black/4 dark:border-white/8 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-600 font-bold flex items-center justify-center shrink-0 text-xs">
                              {requester.fullName?.[0] ||
                                requester.username?.[0] ||
                                "U"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate leading-tight">
                                {requester.fullName || requester.username}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                @{requester.username}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              disabled={isActing}
                              onClick={() => handleRespond(req._id, "accepted")}
                              title="Accept"
                              className="size-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                            >
                              {isActing ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                            </button>
                            <button
                              disabled={isActing}
                              onClick={() => handleRespond(req._id, "declined")}
                              title="Decline"
                              className="size-6 rounded-md bg-zinc-200 dark:bg-zinc-700 hover:bg-red-600 hover:text-white text-muted-foreground flex items-center justify-center cursor-pointer transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Friends List */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
                    My Friends ({friends.length})
                  </div>

                  {friends.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                      <Users size={24} className="opacity-40" />
                      <p>You haven't added any friends yet.</p>
                      <p className="text-[11px] opacity-75">
                        Type a username or email in the search bar above to send
                        a request.
                      </p>
                    </div>
                  ) : (
                    conversationsList.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={String(activeChatId) === String(conv.id)}
                        isTyping={false}
                        isMuted={!!mutedChats[conv.id]}
                        isMessageDisable={false}
                        onClick={() => handleSelect(conv.id)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
