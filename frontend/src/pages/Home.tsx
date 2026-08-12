import { ChatPanel } from "@/components/ChatPanel";
import { DetailsPanel } from "@/components/DetailsPanel";
import { Sidebar } from "@/components/Sidebar";
import { INITIAL_CONVERSATIONS } from "@/constants/conversations";
import type { Conversation, Message } from "@/types";
import { useMemo, useState } from "react";

const Home = () => {
  // App States
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS,
  );
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isTyping, setIsTyping] = useState<number | null>(null);
  const [mutedChats, setMutedChats] = useState<Record<number, boolean>>({});

  // Active chat object
  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === activeChatId) || null;
  }, [conversations, activeChatId]);

  // Filtered chats based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q)),
    );
  }, [conversations, searchQuery]);

  // Mark active chat as read
  const handleSelectConversation = (id: number) => {
    setActiveChatId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c)),
    );
  };

  // Handle message sending
  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Update conversation message list
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      }),
    );

    const sentText = inputText;
    setInputText("");

    // Simulate contact reply
    setIsTyping(activeChatId);

    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            const nextReply = c.replies[0] || "Got it!";
            // Rotate replies
            const updatedReplies = c.replies.slice(1);
            if (updatedReplies.length === 0) {
              updatedReplies.push(
                `Thanks for your message: "${sentText.substring(0, 15)}..."`,
              );
            }

            const replyMessage: Message = {
              id: Date.now() + 1,
              text: nextReply,
              sender: "them",
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            };

            return {
              ...c,
              messages: [...c.messages, replyMessage],
              replies: updatedReplies,
            };
          }
          return c;
        }),
      );
      setIsTyping(null);
    }, 2500); // 2.5s realistic delay
  };

  const toggleMuteChat = (id: number) => {
    setMutedChats((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const clearChatHistory = (id: number) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, messages: [] } : c)),
    );
  };

  return (
      <div className={`imessage-window ${activeChatId ? "chat-active" : ""}`}>
        {/* Sidebar (Left) */}
        <Sidebar
          conversations={filteredConversations}
          activeChatId={activeChatId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectConversation={handleSelectConversation}
          isTypingId={isTyping}
          mutedChats={mutedChats}
        />

        {/* Chat Area (Center) */}
        <ChatPanel
          activeChat={activeChat}
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleSendMessage}
          isTyping={isTyping === activeChatId}
          onBack={() => setActiveChatId(null)}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
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
