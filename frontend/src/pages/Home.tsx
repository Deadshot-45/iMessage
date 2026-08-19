import { ChatPanel } from "@/components/ChatPanel";
import { DetailsPanel } from "@/components/DetailsPanel";
import { Sidebar } from "@/components/Sidebar";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useMemo, useState } from "react";
import { compressImage } from "@/lib/utils";
import { soundManager } from "@/lib/sound";
import { toast } from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";
import { useMediaQuery } from "@/hooks/useMediaQuery";

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

const Home = () => {
  const storeConversations = useChatStore((state) => state.conversations);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const getMessages = useChatStore((state) => state.getMessages);
  const messages = useChatStore((state) => state.messages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sidebarTab = useChatStore((state) => state.sidebarTab);
  const searchQuery = useChatStore((state) => state.searchQuery);
  const setSearchQuery = useChatStore((state) => state.setSearchQuery);
  const subscribeToMessage = useChatStore((state) => state.subscribeToMessage);
  const unsubscribeFromMessages = useChatStore(
    (state) => state.unsubscribeFromMessages,
  );
  const getConversations = useChatStore((state) => state.getConversations);
  const searchUser = useChatStore((state) => state.searchUser);

  const debounceQuery = useDebounce(searchQuery, 500);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);
  const socket = useAuthStore((state) => state.socket);

  const isLgScreen = useMediaQuery("(min-width: 1024px)");
  const isMdScreen = useMediaQuery("(min-width: 768px)");

  const [inputText, setInputText] = useState("");
  const [showDetails, setShowDetails] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mutedChats, setMutedChats] = useState<
    Record<string | number, boolean>
  >({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const friends = useChatStore((state) => state.friends);
  const getFriends = useChatStore((state) => state.getFriends);
  const getFriendRequests = useChatStore((state) => state.getFriendRequests);

  // Sync with store on activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      getMessages(activeChatId);
      subscribeToMessage(activeChatId);
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [activeChatId, getMessages, subscribeToMessage, unsubscribeFromMessages]);

  useEffect(() => {
    getFriends();
    getFriendRequests();
    getConversations();
  }, [getFriends, getFriendRequests, getConversations]);

  // Trigger search on backend when debounceQuery changes and tab is "users"
  useEffect(() => {
    if (sidebarTab === "users") {
      if (debounceQuery.trim().length >= 3) {
        searchUser(debounceQuery);
      }
    }
  }, [debounceQuery, sidebarTab, searchUser]);

  const addIncomingFriendRequest = useChatStore(
    (state) => state.addIncomingFriendRequest,
  );
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);

  // Request browser notification permission once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleFriendAccepted = (data: { friend: any }) => {
      const name = data?.friend?.fullName || data?.friend?.username || "A user";

      if (isSoundEnabled) {
        soundManager.playFriendRequestSound();
      }

      toast.success(`🎉 ${name} accepted your friend request!`, {
        duration: 5000,
        icon: "🤝",
      });

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        document.hidden
      ) {
        new Notification("Friend Request Accepted", {
          body: `${name} is now in your contacts!`,
        });
      }

      getFriends();
      getConversations();
    };

    const handleFriendRequestReceived = (data: any) => {
      const requester = data?.requester;
      const name = requester?.fullName || requester?.username || "Someone";

      if (isSoundEnabled) {
        soundManager.playFriendRequestSound();
      }

      toast.success(`✨ ${name} sent you a friend request!`, {
        duration: 5000,
        icon: "👋",
      });

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        document.hidden
      ) {
        new Notification("New Friend Request", {
          body: `${name} sent you a friend request.`,
        });
      }

      // Immediately append to local store state for instant 0ms UI update
      if (data) {
        addIncomingFriendRequest(data);
      }

      getFriendRequests();
    };

    socket.on("friend:accepted", handleFriendAccepted);
    socket.on("friend:request_received", handleFriendRequestReceived);

    return () => {
      socket.off("friend:accepted", handleFriendAccepted);
      socket.off("friend:request_received", handleFriendRequestReceived);
    };
  }, [
    socket,
    isSoundEnabled,
    addIncomingFriendRequest,
    getFriends,
    getFriendRequests,
    getConversations,
  ]);

  const handleSelectConversation = (id: any) => {
    setActiveChatId(id);
  };

  const handleSendMessage = async () => {
    if ((!inputText.trim() && !selectedFile) || !activeChatId) return;

    let mediaToSend = selectedFile || undefined;

    // Compress images before upload (skips videos automatically)
    if (mediaToSend) {
      mediaToSend = await compressImage(mediaToSend);
    }

    sendMessage(activeChatId, { message: inputText, chatMedia: mediaToSend });
    setInputText("");
    setSelectedFile(null);
  };

  const toggleMuteChat = (id: string | number) => {
    setMutedChats((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const clearChatHistory = (_id: string | number) => {
    // Local clear or store clear logic if supported
  };

  const uiConversations = useMemo(() => {
    const list = sidebarTab === "chats" ? storeConversations : friends;

    return list.map((item: any) => {
      const isSelected = String(item._id) === String(activeChatId);
      const chatMessages = isSelected ? messages : [];

      const uiMessages = chatMessages.map((msg: any) => ({
        id: msg._id,
        text: msg.message || msg.text || "",
        sender: (String(msg.senderId) === String(authUser?._id)
          ? "me"
          : "them") as "me" | "them",
        timestamp: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        mediaUrl: msg.mediaUrl,
        mediaType: msg.mediaType,
        thumbnailUrl: msg.thumbnailUrl,
        mediaSize: msg.mediaSize,
        mediaDuration: msg.mediaDuration,
        status: msg.status || "sent",
        isDeleted: msg.isDeleted || false,
      }));

      // Find last message details
      const lastMsgText = item.lastMessage?.message || "";
      const lastMsgTime = item.lastMessage?.createdAt
        ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const lastMsgMediaType = item.lastMessage?.mediaType || undefined;
      const lastMsgMediaUrl = item.lastMessage?.mediaUrl || undefined;

      // Build the last message fallback for conversations not currently open
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
        messages: uiMessages.length > 0 ? uiMessages : fallbackLastMsg,
        replies: [],
      };
    });
  }, [
    sidebarTab,
    storeConversations,
    friends,
    activeChatId,
    messages,
    authUser,
    onlineUsers,
  ]);

  const filteredConversations = useMemo(() => {
    if (!debounceQuery.trim()) return uiConversations;
    const q = debounceQuery.toLowerCase();
    return uiConversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.messages.some((m: any) => m.text.toLowerCase().includes(q)),
    );
  }, [uiConversations, debounceQuery]);

  const activeChat = useMemo(() => {
    return (
      uiConversations.find((c) => String(c.id) === String(activeChatId)) || null
    );
  }, [uiConversations, activeChatId]);

  return (
    <main className="imessage-container flex items-center justify-center p-3 lg:p-6 w-full h-screen overflow-hidden">
      <div className="flex w-full h-full max-w-[1560px] gap-3.5 lg:gap-4.5 relative items-stretch">
        {/* Left Panel: Sidebar */}
        <aside
          className={`h-full transition-all duration-300 ${
            /* Mobile rules: if no active chat, show sidebar full width; if active chat, hide on mobile unless toggled */
            !isMdScreen
              ? !activeChatId
                ? "w-full flex"
                : "hidden"
              : isSidebarOpen
                ? "w-[310px] lg:w-[340px] shrink-0 flex"
                : "hidden"
          }`}
        >
          <Sidebar
            conversations={filteredConversations}
            activeChatId={activeChatId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectConversation={handleSelectConversation}
            isTypingId={null}
            mutedChats={mutedChats}
          />
        </aside>

        {/* Center Panel: Chat Screen */}
        <section
          className={`h-full transition-all duration-300 ${
            !isMdScreen
              ? activeChatId
                ? "w-full flex"
                : "hidden"
              : "flex-1 min-w-0 flex"
          }`}
        >
          <ChatPanel
            activeChat={activeChat}
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleSendMessage}
            isTyping={false}
            onBack={() => setActiveChatId(null)}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </section>

        {/* Right Panel: Details Page (Floating 3rd card on lg: screens) */}
        {activeChat && showDetails && isLgScreen && (
          <aside className="w-[300px] lg:w-[330px] shrink-0 h-full animate-in fade-in zoom-in-95 duration-200">
            <DetailsPanel
              activeChat={activeChat}
              isMuted={!!mutedChats[activeChat.id]}
              onToggleMute={() => toggleMuteChat(activeChat.id)}
              onClearHistory={() => clearChatHistory(activeChat.id)}
              onClose={() => setShowDetails(false)}
              isFullScreenModal={false}
            />
          </aside>
        )}

        {/* Fullscreen Details Modal for small/medium screens (< lg) */}
        {activeChat && showDetails && !isLgScreen && (
          <DetailsPanel
            activeChat={activeChat}
            isMuted={!!mutedChats[activeChat.id]}
            onToggleMute={() => toggleMuteChat(activeChat.id)}
            onClearHistory={() => clearChatHistory(activeChat.id)}
            onClose={() => setShowDetails(false)}
            isFullScreenModal={true}
          />
        )}
      </div>
    </main>
  );
};

export default Home;
