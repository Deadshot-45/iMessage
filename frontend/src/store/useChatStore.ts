import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

interface ChatState {
  users: any[];
  conversations: any[];
  messages: any[];
  selectUser: any;
  isUserLoading: boolean;
  isConversationsLoading: boolean;
  isMessagesLoading: boolean;
  activeChatId: string | number | null;
  searchQuery: string;
  selectedUserId: string | null;
  sidebarTab: "chats" | "users";
  composerText: string;
  isSoundEnabled: boolean;
  sendingMedia: boolean;

  setSearchQuery: (query: string) => void;
  setSelectedUserId: (id: string | null) => void;
  setSidebarTab: (tab: "chats" | "users") => void;
  setComposerText: (text: string) => void;
  setIsSoundEnabled: (enabled: boolean) => void;
  setSendingMedia: (sending: boolean) => void;
  getUsers: () => Promise<void>;
  getConversations: () => Promise<void>;
  getMessages: (userId: string | number) => Promise<void>;
  sendMessage: (
    userId: string | number,
    messageData: { message: string; chatMedia?: File },
  ) => Promise<void>;
  setActiveChatId: (id: string | number | null) => void;
  addMessage: (message: any) => void;
  subscribeToMessage: (userId: string | number) => void;
  unsubscribeFromMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectUser: null,
      isUserLoading: false,
      isConversationsLoading: false,
      isMessagesLoading: false,
      activeChatId: null,
      searchQuery: "",
      selectedUserId: null,
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      sendingMedia: false,

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },
      setSelectedUserId: (id: string | null) => {
        set({ selectedUserId: id });
      },

      getUsers: async () => {
        set({ isUserLoading: true });
        try {
          const res = await axiosInstance.get("/users");
          console.log(res.data);
          set({ users: res.data.users || [] });
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          set({ isUserLoading: false });
        }
      },

      setSidebarTab: (tab) => {
        set({ sidebarTab: tab });
      },
      setComposerText: (text) => {
        set({ composerText: text });
      },
      setIsSoundEnabled: (enabled) => {
        set({ isSoundEnabled: enabled });
      },
      setSendingMedia: (sending) => {
        set({ sendingMedia: sending });
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/message/conversations");
          set({ conversations: res.data.conversations || [] });
        } catch (error) {
          console.error("Error fetching conversations:", error);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/message/${userId}`);
          set({ messages: res.data.conversations || [] });
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (userId, { message, chatMedia }) => {
        // Create a temporary optimistic message to show instantly
        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticMsg = {
          _id: optimisticId,
          senderId: useAuthStore.getState().authUser?._id || "",
          receiverId: userId,
          message: message || "",
          mediaUrl: chatMedia ? URL.createObjectURL(chatMedia) : undefined,
          mediaType: chatMedia ? (chatMedia.type.startsWith("video/") ? "video" : "image") : undefined,
          createdAt: new Date().toISOString(),
          status: "sending" as const,
        };

        // Append optimistically to show text/preview instantly
        set({
          messages: [...get().messages, optimisticMsg],
        });

        try {
          if (chatMedia) {
            set({ sendingMedia: true });
          }
          const formData = new FormData();
          formData.append("message", message);
          if (chatMedia) {
            formData.append("chatMedia", chatMedia);
          }

          const res = await axiosInstance.post(
            `/message/send/${userId}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              timeout: 0, // Disable timeout for large media uploads
            },
          );

          const newMsg = res.data.newMessage;
          if (newMsg) {
            // Replace optimistic message with the actual backend saved record
            set({
              messages: get().messages.map((msg) =>
                msg._id === optimisticId ? { ...newMsg, status: "sent" } : msg
              ),
            });
          }
        } catch (error) {
          console.error("Error sending message:", error);
          // Mark the optimistic message as failed
          set({
            messages: get().messages.map((msg) =>
              msg._id === optimisticId ? { ...msg, status: "error" } : msg
            ),
          });
          throw error;
        } finally {
          set({ sendingMedia: false });
        }
      },

      subscribeToMessage: (userId: any) => {
        if (!userId) return;
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("new:message");
        socket.on(
          "new:message",
          (newMessage: { senderId: string; message: string }) => {
            // if im not the receiver don't do anything just return
            if (String(newMessage.senderId) !== String(userId)) return;

            set({ messages: [...get().messages, newMessage] });

            get().getConversations();
          },
        );
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
      },

      setActiveChatId: (id) => {
        set({ activeChatId: id });
      },

      addMessage: (message) => {
        set({
          messages: [...get().messages, message],
        });
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        isSoundEnabled: state.isSoundEnabled,
        sidebarTab: state.sidebarTab,
      }),
    },
  ),
);
