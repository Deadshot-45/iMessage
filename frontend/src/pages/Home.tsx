import { ChatPanel } from "@/components/ChatPanel";
import { DetailsPanel } from "@/components/DetailsPanel";
import { Sidebar } from "@/components/Sidebar";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useMemo, useState } from "react";

const getDeterministicColor = (name: string) => {
  const colors = ["#ff2d55", "#5856d6", "#34c759", "#007aff", "#af52de", "#ff9500"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Home = () => {
  const users = useChatStore((state) => state.users);
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
  const unsubscribeFromMessages = useChatStore((state) => state.unsubscribeFromMessages);
  const getUsers = useChatStore((state) => state.getUsers);
  const getConversations = useChatStore((state) => state.getConversations);

  const authUser = useAuthStore((state) => state.authUser);
  const onlineUsers = useAuthStore((state) => state.onlineUsers);

  const [inputText, setInputText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [mutedChats, setMutedChats] = useState<Record<string | number, boolean>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    getUsers();
    getConversations();
  }, [getUsers, getConversations]);

  const handleSelectConversation = (id: any) => {
    setActiveChatId(id);
  };

  const handleSendMessage = () => {
    if ((!inputText.trim() && !selectedFile) || !activeChatId) return;
    sendMessage(activeChatId, { message: inputText, chatMedia: selectedFile || undefined });
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
    const list = sidebarTab === "chats" ? storeConversations : users;

    return list.map((item: any) => {
      const isSelected = String(item._id) === String(activeChatId);
      const chatMessages = isSelected ? messages : [];

      const uiMessages = chatMessages.map((msg: any) => ({
        id: msg._id,
        text: msg.message || msg.text || "",
        sender: (String(msg.senderId) === String(authUser?._id) ? "me" : "them") as "me" | "them",
        timestamp: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        mediaUrl: msg.mediaUrl,
        mediaType: msg.mediaType,
      }));

      // Find last message details
      const lastMsgText = item.lastMessage?.message || "";
      const lastMsgTime = item.lastMessage?.createdAt
        ? new Date(item.lastMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      return {
        id: item._id,
        name: item.fullName || item.username || "User",
        avatarColor: item.avatarColor || getDeterministicColor(item.fullName || item.username || "User"),
        status: onlineUsers.includes(item._id) ? "Online" : "Offline",
        unread: false,
        messages: uiMessages.length > 0 ? uiMessages : (lastMsgText ? [{ id: "last", text: lastMsgText, sender: "them" as "me" | "them", timestamp: lastMsgTime }] : []),
        replies: [],
      };
    });
  }, [sidebarTab, storeConversations, users, activeChatId, messages, authUser, onlineUsers]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return uiConversations;
    const q = searchQuery.toLowerCase();
    return uiConversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.messages.some((m: any) => m.text.toLowerCase().includes(q)),
    );
  }, [uiConversations, searchQuery]);

  const activeChat = useMemo(() => {
    return uiConversations.find((c) => String(c.id) === String(activeChatId)) || null;
  }, [uiConversations, activeChatId]);

  return (
    <div className={`imessage-window ${activeChatId ? "chat-active" : ""}`}>
      {/* Sidebar (Left) */}
      <Sidebar
        conversations={filteredConversations}
        activeChatId={activeChatId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectConversation={handleSelectConversation}
        isTypingId={null}
        mutedChats={mutedChats}
      />

      {/* Chat Area (Center) */}
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
      />

      {/* Details Panel (Right) */}
      {activeChat && showDetails && (
        <DetailsPanel
          activeChat={activeChat}
          isMuted={!!mutedChats[activeChat.id]}
          onToggleMute={() => toggleMuteChat(activeChat.id)}
          onClearHistory={() => clearChatHistory(activeChat.id)}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default Home;
