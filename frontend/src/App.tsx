import { useState, useEffect, useRef, useMemo } from "react";
import { Show, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/react";
import { 
  Search, 
  ChevronLeft, 
  Info, 
  Send, 
  Plus, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Smile, 
  MessageSquare,
  Shield,
  Bell,
  Trash2,
  Lock,
  ArrowRight
} from "lucide-react";
import "./App.css";

interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

interface Conversation {
  id: number;
  name: string;
  avatarColor: string;
  status: string;
  messages: Message[];
  unread: boolean;
  replies: string[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: "Taylor Swift",
    avatarColor: "#ff2d55",
    status: "Online",
    unread: true,
    messages: [
      { id: 1, text: "Hey! Are we still on for the studio recording session tomorrow?", sender: "them", timestamp: "5:23 PM" },
      { id: 2, text: "Yeah absolutely! I've been refining the lyrics for the chorus.", sender: "me", timestamp: "5:25 PM" },
      { id: 3, text: "Amazing, can't wait to hear it! Bring the acoustic guitar too.", sender: "them", timestamp: "5:26 PM" }
    ],
    replies: [
      "That sounds perfect! Let's aim for 2 PM.",
      "Awesome. I'll ask the team to pre-configure the mics.",
      "Let's write another hit! 🎶"
    ]
  },
  {
    id: 2,
    name: "Elon Musk",
    avatarColor: "#5856d6",
    status: "Active 1h ago",
    unread: false,
    messages: [
      { id: 1, text: "The Starship flight test telemetry looks incredibly clean.", sender: "them", timestamp: "Yesterday" },
      { id: 2, text: "That is huge! When is the next orbital launch attempt?", sender: "me", timestamp: "Yesterday" },
      { id: 3, text: "Aiming for late next month. Multi-planetary species is the goal.", sender: "them", timestamp: "Yesterday" }
    ],
    replies: [
      "Exactly. Raptor engine thrust profile is optimized now.",
      "Mars is the target. Let's make life multiplanetary!",
      "Also, Tesla FSD v13 release is going to blow minds."
    ]
  },
  {
    id: 3,
    name: "Steve Jobs (Legacy AI)",
    avatarColor: "#34c759",
    status: "Active 5m ago",
    unread: false,
    messages: [
      { id: 1, text: "Details matter, it's worth waiting to get it right.", sender: "them", timestamp: "Wednesday" },
      { id: 2, text: "We are polishing the UI animations right now.", sender: "me", timestamp: "Wednesday" },
      { id: 3, text: "Design is not just what it looks like and feels like. Design is how it works.", sender: "them", timestamp: "Wednesday" }
    ],
    replies: [
      "Stay hungry, stay foolish.",
      "Simplify, simplify, simplify. That's the secret.",
      "Make it so beautiful that people want to lick it."
    ]
  },
  {
    id: 4,
    name: "Clever Assistant",
    avatarColor: "#007aff",
    status: "Online",
    unread: false,
    messages: [
      { id: 1, text: "Hi there! I am your assistant. How can I help you today?", sender: "them", timestamp: "Monday" }
    ],
    replies: [
      "I can help you design layouts, write clean code, or solve issues!",
      "Tell me more about your project goals.",
      "I am always ready to help you pair program."
    ]
  },
  {
    id: 5,
    name: "Sam Altman",
    avatarColor: "#af52de",
    status: "Active 12m ago",
    unread: false,
    messages: [
      { id: 1, text: "We just deployed the new reasoning reasoning model.", sender: "them", timestamp: "Aug 8" },
      { id: 2, text: "Oh nice, how is the latency profile?", sender: "me", timestamp: "Aug 8" },
      { id: 3, text: "A bit higher but the planning depth is outstanding.", sender: "them", timestamp: "Aug 8" }
    ],
    replies: [
      "AGI is coming faster than people think.",
      "The next cluster is going to be insane.",
      "Thanks for building with our API!"
    ]
  }
];

function App() {
  const { user } = useUser();
  
  // App States
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [isTyping, setIsTyping] = useState<number | null>(null);
  const [mutedChats, setMutedChats] = useState<Record<number, boolean>>({});

  // DOM Refs for auto scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        c.messages.some((m) => m.text.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isTyping]);

  // Mark active chat as read
  const handleSelectConversation = (id: number) => {
    setActiveChatId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c))
    );
  };

  // Handle message sending
  const handleSendMessage = () => {
    if (!inputText.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update conversation message list
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
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
              updatedReplies.push(`Thanks for your message: "${sentText.substring(0, 15)}..."`);
            }

            const replyMessage: Message = {
              id: Date.now() + 1,
              text: nextReply,
              sender: "them",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            return {
              ...c,
              messages: [...c.messages, replyMessage],
              replies: updatedReplies
            };
          }
          return c;
        })
      );
      setIsTyping(null);
    }, 2500); // 2.5s realistic delay
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleMuteChat = (id: number) => {
    setMutedChats((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const clearChatHistory = (id: number) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, messages: [] } : c))
    );
  };

  return (
    <>
      {/* Signed Out Screen (Premium iOS Style Lockscreen) */}
      <Show when="signed-out">
        <div className="imessage-container" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
          <div className="imessage-window" style={{ maxWidth: "420px", height: "640px", flexDirection: "column", padding: "32px", justifyContent: "space-between", alignItems: "center", background: "rgba(30, 30, 45, 0.65)" }}>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "40px" }}>
              <div className="empty-state-logo" style={{ animation: "pulse 2s infinite" }}>
                <MessageSquare size={44} />
              </div>
              <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#ffffff", margin: "16px 0 8px", letterSpacing: "-1px" }}>iMessage</h1>
              <p style={{ fontSize: "14px", color: "#a1a1a6", textAlign: "center", maxWidth: "260px", lineHeight: "1.5" }}>
                Sign in to start messaging with friends, family, and AI assistant models.
              </p>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
              <SignInButton mode="modal">
                <button style={{ width: "100%", background: "#007aff", border: "none", color: "#ffffff", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "transform 0.15s" }}>
                  Sign In <ArrowRight size={16} />
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button style={{ width: "100%", background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", padding: "14px", borderRadius: "12px", fontSize: "15px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.2s" }}>
                  Create Account
                </button>
              </SignUpButton>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#636366", fontSize: "11px" }}>
              <Lock size={12} /> End-to-end encrypted
            </div>
          </div>
        </div>
      </Show>

      {/* Signed In Dashboard View */}
      <Show when="signed-in">
        <div className="imessage-container">
          <div className={`imessage-window ${activeChatId ? "chat-active" : ""}`}>
            
            {/* Sidebar (Left) */}
            <div className="imessage-sidebar">
              
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
                {filteredConversations.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "13px" }}>
                    No conversations found
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const lastMessage = conv.messages[conv.messages.length - 1];
                    const initials = conv.name.split(" ").map(n => n[0]).join("");
                    const isMuted = mutedChats[conv.id];

                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleSelectConversation(conv.id)}
                        className={`conversation-item ${activeChatId === conv.id ? "active" : ""}`}
                      >
                        <div className="avatar-wrapper">
                          <div className="avatar" style={{ backgroundColor: conv.avatarColor }}>
                            {initials}
                          </div>
                          {conv.status === "Online" && <div className="status-badge" />}
                        </div>

                        <div className="conv-details">
                          <div className="conv-meta">
                            <h3 className="conv-name">{conv.name}</h3>
                            <span className="conv-time">{lastMessage ? lastMessage.timestamp : ""}</span>
                          </div>
                          <div className="conv-last-msg-container">
                            <p className="conv-last-msg">
                              {isTyping === conv.id ? (
                                <span style={{ color: "var(--imessage-blue)", fontWeight: "500" }}>typing...</span>
                              ) : lastMessage ? (
                                `${lastMessage.sender === "me" ? "You: " : ""}${lastMessage.text}`
                              ) : (
                                "No messages yet"
                              )}
                            </p>
                            {isMuted && <Bell size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />}
                            {conv.unread && <div className="unread-dot" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer (Signed-in User Info) */}
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

            {/* Chat Area (Center) */}
            <div className="imessage-chat-pane">
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <button className="back-btn" onClick={() => setActiveChatId(null)}>
                      <ChevronLeft size={24} />
                      <span style={{ fontSize: "15px", fontWeight: "500" }}>Back</span>
                    </button>
                    
                    <div className="chat-header-info" onClick={() => setShowDetails(!showDetails)}>
                      <div className="chat-header-avatar" style={{ backgroundColor: activeChat.avatarColor }}>
                        {activeChat.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="chat-header-name-details">
                        <span className="chat-header-name">{activeChat.name}</span>
                        <span className="chat-header-status">
                          {activeChat.status}
                          <Info size={11} style={{ marginLeft: "2px" }} />
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "14px", color: "var(--imessage-blue)" }}>
                      <Phone size={18} style={{ cursor: "pointer" }} />
                      <Video size={20} style={{ cursor: "pointer" }} />
                    </div>
                  </div>

                  {/* Chat Messages scroll area */}
                  <div className="chat-messages">
                    {activeChat.messages.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-logo">
                          <MessageSquare size={36} />
                        </div>
                        <p className="empty-state-title">No messages yet</p>
                        <p className="empty-state-desc">Send a message to start the conversation with {activeChat.name}.</p>
                      </div>
                    ) : (
                      <>
                        <div className="date-separator">iMessage</div>
                        {activeChat.messages.map((msg, index) => {
                          const isSent = msg.sender === "me";
                          const showStatus = isSent && index === activeChat.messages.length - 1;

                          return (
                            <div key={msg.id} className={`message-row ${isSent ? "sent" : "received"}`}>
                              <div className="bubble">{msg.text}</div>
                              {showStatus && (
                                <span className="msg-status">
                                  {isTyping === activeChat.id ? "Delivered" : "Read"}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Typing Indicator */}
                    {isTyping === activeChat.id && (
                      <div className="typing-bubble">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input Bar */}
                  <div className="chat-input-area">
                    <button className="action-btn" style={{ padding: "8px" }}>
                      <Plus size={20} style={{ color: "var(--text-secondary)" }} />
                    </button>
                    
                    <div className="input-container">
                      <input
                        type="text"
                        className="chat-input"
                        placeholder="iMessage"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                      />
                      <div className="input-actions">
                        <Smile size={18} style={{ color: "var(--text-secondary)", cursor: "pointer", marginRight: "6px" }} />
                      </div>
                    </div>

                    <button 
                      onClick={handleSendMessage} 
                      className="send-btn" 
                      disabled={!inputText.trim()}
                    >
                      <Send size={13} style={{ transform: "rotate(-45deg) translate(1px, -1px)" }} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ height: "100%" }}>
                  <div className="empty-state-logo">
                    <MessageSquare size={44} />
                  </div>
                  <h3 className="empty-state-title">Select a Conversation</h3>
                  <p className="empty-state-desc">Choose a friend from the list or search for contacts to begin messaging.</p>
                </div>
              )}
            </div>

            {/* Details Panel (Right) */}
            {activeChat && showDetails && (
              <div className="imessage-details-panel">
                <div className="details-header">
                  <h3 className="details-title">Details</h3>
                  <button className="action-btn" onClick={() => setShowDetails(false)}>
                    Close
                  </button>
                </div>

                <div className="details-content">
                  <div className="details-avatar-section">
                    <div className="details-avatar" style={{ backgroundColor: activeChat.avatarColor }}>
                      {activeChat.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <h4 className="details-name">{activeChat.name}</h4>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{activeChat.status}</span>
                  </div>

                  <div className="details-actions-grid">
                    <button className="details-action-btn" onClick={() => alert("Calling...")}>
                      <div className="details-action-circle">
                        <Phone size={16} />
                      </div>
                      <span>call</span>
                    </button>
                    <button className="details-action-btn" onClick={() => alert("Starting video call...")}>
                      <div className="details-action-circle">
                        <Video size={18} />
                      </div>
                      <span>video</span>
                    </button>
                  </div>

                  {/* Actions List */}
                  <div className="details-section">
                    <div className="details-section-row toggle">
                      <span>Mute Notifications</span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={!!mutedChats[activeChat.id]}
                          onChange={() => toggleMuteChat(activeChat.id)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="details-section-row" onClick={() => clearChatHistory(activeChat.id)}>
                      <span>Clear Chat History</span>
                      <Trash2 size={14} style={{ color: "var(--text-secondary)" }} />
                    </div>
                  </div>

                  <div className="details-section">
                    <div className="details-section-row header" style={{ cursor: "default", fontWeight: "600", fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Shared Media & Options
                    </div>
                    <div className="details-section-row">
                      <span>Photos</span>
                      <ImageIcon size={14} style={{ color: "var(--text-secondary)" }} />
                    </div>
                    <div className="details-section-row">
                      <span>Links</span>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>0 links</span>
                    </div>
                  </div>

                  <div className="details-section">
                    <div className="details-section-row danger" style={{ justifyContent: "center", fontWeight: "600" }} onClick={() => alert("User Blocked")}>
                      Block this Caller
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center", color: "var(--text-secondary)", fontSize: "11px", marginTop: "12px" }}>
                    <Shield size={12} /> End-to-end Encrypted
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </Show>
    </>
  );
}

export default App;
