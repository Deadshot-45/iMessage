import { UserButton } from "@clerk/react";
import {
  Search,
  MoreVertical,
  UserPlus,
  Check,
  X,
  Clock,
  UserCheck,
  Loader2,
  Users,
  MessageSquare,
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
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface SidebarProps {
  conversations: any[];
  activeChatId: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectConversation: (id: any) => void;
  isTypingId: any;
  mutedChats: Record<string | number, boolean>;
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
  const getFriends = useChatStore((state) => state.getFriends);
  const getFriendRequests = useChatStore((state) => state.getFriendRequests);
  const getConversations = useChatStore((state) => state.getConversations);
  const searchResults = useChatStore((state) => state.searchResults);
  const isSearching = useChatStore((state) => state.isSearching);
  const friendRequests = useChatStore((state) => state.friendRequests);
  const friends = useChatStore((state) => state.friends);
  const sendFriendRequest = useChatStore((state) => state.sendFriendRequest);
  const respondToFriendRequest = useChatStore(
    (state) => state.respondToFriendRequest,
  );
  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const setSidebarTab = useChatStore((state) => state.setSidebarTab);

  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  useEffect(() => {
    getFriends();
    getFriendRequests();
    getConversations();
  }, [getFriends, getFriendRequests, getConversations]);

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

      {/* Segmented Tab Switcher */}
      <div className="px-5 pb-3">
        <div className="flex bg-black/5 dark:bg-white/5 p-0.5 rounded-lg text-[11px] font-semibold relative">
          <button
            onClick={() => {
              setSidebarTab("chats");
              setSearchQuery("");
            }}
            className={`flex-1 py-1.5 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              sidebarTab === "chats"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare size={13} />
            <span>Chats</span>
          </button>
          <button
            onClick={() => {
              setSidebarTab("users");
              setSearchQuery("");
            }}
            className={`flex-1 py-1.5 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 relative ${
              sidebarTab === "users"
                ? "bg-white dark:bg-zinc-800 text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users size={13} />
            <span>Friends</span>
            {friendRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <div className="search-input-container">
          <Search size={14} className="search-icon" />
          <Input
            type="text"
            className="search-input"
            placeholder={
              sidebarTab === "chats"
                ? "Search conversations..."
                : "Search username or email..."
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

      {/* Main Content Area */}
      <div className="conversations-list overflow-y-auto">
        {sidebarTab === "chats" ? (
          /* Chats List */
          conversations.length === 0 ? (
            <div className="p-5 text-center text-xs text-muted-foreground">
              No conversations found.
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeChatId === conv.id}
                isTyping={isTypingId === conv.id}
                isMuted={!!mutedChats[conv.id]}
                //isMessageDisable={true}
                onClick={() => onSelectConversation(conv.id)}
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
                    conversations.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conv={conv}
                        isActive={activeChatId === conv.id}
                        isTyping={isTypingId === conv.id}
                        isMuted={!!mutedChats[conv.id]}
                        isMessageDisable={false}
                        onClick={() => onSelectConversation(conv.id)}
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

