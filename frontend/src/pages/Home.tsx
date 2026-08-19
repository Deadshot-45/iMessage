import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { DetailsPanel } from "@/components/DetailsPanel";
import { Sidebar } from "@/components/Sidebar";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { soundManager } from "@/lib/sound";
import { toast } from "react-hot-toast";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const Home = () => {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChatId = useChatStore((state) => state.setActiveChatId);
  const getFriends = useChatStore((state) => state.getFriends);
  const getFriendRequests = useChatStore((state) => state.getFriendRequests);
  const getConversations = useChatStore((state) => state.getConversations);
  const addIncomingFriendRequest = useChatStore(
    (state) => state.addIncomingFriendRequest,
  );
  const isSoundEnabled = useChatStore((state) => state.isSoundEnabled);

  const socket = useAuthStore((state) => state.socket);

  const isLgScreen = useMediaQuery("(min-width: 1024px)");
  const isMdScreen = useMediaQuery("(min-width: 768px)");

  const [showDetails, setShowDetails] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mutedChats, setMutedChats] = useState<
    Record<string | number, boolean>
  >({});

  // Initial data sync
  useEffect(() => {
    getFriends();
    getFriendRequests();
    getConversations();
  }, [getFriends, getFriendRequests, getConversations]);

  // Request browser notification permission once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Global socket notifications
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

  const toggleMuteChat = (id: string | number) => {
    setMutedChats((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <main className="imessage-container flex items-center justify-center p-3 lg:p-6 w-full h-screen overflow-hidden">
      <div className="flex w-full h-full max-w-[1560px] gap-3.5 lg:gap-4.5 relative items-stretch">
        {/* Left Panel: Sidebar */}
        <aside
          className={`h-full transition-all duration-300 ${
            !isMdScreen
              ? !activeChatId
                ? "w-full flex"
                : "hidden"
              : isSidebarOpen
                ? "w-[310px] lg:w-[340px] shrink-0 flex"
                : "hidden"
          }`}
        >
          <Sidebar mutedChats={mutedChats} />
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
            onBack={() => setActiveChatId(null)}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </section>

        {/* Right Panel: Details Page (Floating 3rd card on lg: screens) */}
        {activeChatId && showDetails && isLgScreen && (
          <aside className="w-[300px] lg:w-[330px] shrink-0 h-full animate-in fade-in zoom-in-95 duration-200">
            <DetailsPanel
              isMuted={!!mutedChats[activeChatId]}
              onToggleMute={() => toggleMuteChat(activeChatId)}
              onClose={() => setShowDetails(false)}
              isFullScreenModal={false}
            />
          </aside>
        )}

        {/* Fullscreen Details Modal for small/medium screens (< lg) */}
        {activeChatId && showDetails && !isLgScreen && (
          <DetailsPanel
            isMuted={!!mutedChats[activeChatId]}
            onToggleMute={() => toggleMuteChat(activeChatId)}
            onClose={() => setShowDetails(false)}
            isFullScreenModal={true}
          />
        )}
      </div>
    </main>
  );
};

export default Home;
