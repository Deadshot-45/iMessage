import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { soundManager } from "../lib/sound";
import { encryptOutgoingMessage, decryptIncomingMessage } from "../lib/e2eeSession";

interface ChatState {
  users: any[];
  friends: any[];
  friendRequests: any[];
  searchResults: any[];
  conversations: any[];
  messages: any[];
  selectUser: any;
  isUserLoading: boolean;
  isFriendsLoading: boolean;
  isRequestsLoading: boolean;
  isSearching: boolean;
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
  getFriends: () => Promise<void>;
  getFriendRequests: () => Promise<void>;
  addIncomingFriendRequest: (request: any) => void;
  searchUser: (query: string) => Promise<void>;
  sendFriendRequest: (targetUserId: string) => Promise<boolean>;
  respondToFriendRequest: (
    requestId: string,
    status: "accepted" | "declined",
  ) => Promise<void>;
  removeFriend: (userId: string) => Promise<void>;
  getConversations: () => Promise<void>;
  getMessages: (userId: string | number) => Promise<void>;
  markMessagesAsRead: (senderId: string | number) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  sendMessage: (
    userId: string | number,
    messageData: {
      message: string;
      chatMedia?: File;
      mediaType?: string;
      thumbnailUrl?: string;
    },
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
      friends: [],
      friendRequests: [],
      searchResults: [],
      conversations: [],
      messages: [],
      selectUser: null,
      isUserLoading: false,
      isFriendsLoading: false,
      isRequestsLoading: false,
      isSearching: false,
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
        return get().getFriends();
      },

      getFriends: async () => {
        set({ isFriendsLoading: true, isUserLoading: true });
        try {
          const res = await axiosInstance.get("/friends");
          const friendsList = res.data.friends || [];
          set({ friends: friendsList, users: friendsList });
        } catch (error) {
          console.error("Error fetching friends:", error);
        } finally {
          set({ isFriendsLoading: false, isUserLoading: false });
        }
      },

      getFriendRequests: async () => {
        set({ isRequestsLoading: true });
        try {
          const res = await axiosInstance.get("/friends/requests");
          set({ friendRequests: res.data.requests || [] });
        } catch (error) {
          console.error("Error fetching friend requests:", error);
        } finally {
          set({ isRequestsLoading: false });
        }
      },

      addIncomingFriendRequest: (newReq: any) => {
        if (!newReq || !newReq._id) return;
        const exists = get().friendRequests.some((r) => r._id === newReq._id);
        if (!exists) {
          set({ friendRequests: [newReq, ...get().friendRequests] });
        }
      },

      searchUser: async (query: string) => {
        console.log("second, ", query);
        if (!query.trim() || query.trim().length < 3) {
          set({ searchResults: [] });
          return;
        }
        set({ isSearching: true, isUserLoading: true });
        try {
          const res = await axiosInstance.get(
            `/users/search?q=${encodeURIComponent(query.trim())}`,
          );
          console.log("first, ", res.data);
          const results = res.data.users || [];
          set({ searchResults: results, users: results });
        } catch (error) {
          console.error("Error searching users:", error);
          set({ searchResults: [] });
        } finally {
          set({ isSearching: false, isUserLoading: false });
        }
      },

      sendFriendRequest: async (targetUserId: string) => {
        try {
          await axiosInstance.post(`/friends/request/${targetUserId}`);
          // Update search results or status locally
          set({
            searchResults: get().searchResults.map((u) =>
              u._id === targetUserId
                ? { ...u, relationship: "pending_sent" }
                : u,
            ),
            users: get().users.map((u) =>
              u._id === targetUserId
                ? { ...u, relationship: "pending_sent" }
                : u,
            ),
          });
          return true;
        } catch (error) {
          console.error("Error sending friend request:", error);
          return false;
        }
      },

      respondToFriendRequest: async (
        requestId: string,
        status: "accepted" | "declined",
      ) => {
        try {
          await axiosInstance.patch(`/friends/respond/${requestId}`, { status });
          // Remove request from pending list
          set({
            friendRequests: get().friendRequests.filter(
              (r) => r._id !== requestId,
            ),
          });
          // If accepted, refresh friends & conversations
          if (status === "accepted") {
            await get().getFriends();
            await get().getConversations();
          }
        } catch (error) {
          console.error("Error responding to friend request:", error);
        }
      },

      removeFriend: async (userId: string) => {
        try {
          await axiosInstance.delete(`/friends/${userId}`);
          await get().getFriends();
          await get().getConversations();
        } catch (error) {
          console.error("Error removing friend:", error);
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
          const rawList = res.data.conversations || [];
          const myId = useAuthStore.getState().authUser?._id || "";
          
          const decryptedList = await Promise.all(
            rawList.map(async (msg: any) => {
              if (msg.isEncrypted) {
                const otherPartyId = String(msg.senderId) === String(myId) ? String(msg.receiverId) : String(msg.senderId);
                const decryptedText = await decryptIncomingMessage(myId, otherPartyId, msg);
                return { ...msg, message: decryptedText };
              }
              return msg;
            })
          );

          set({ messages: decryptedList });
          // Mark received messages as read
          get().markMessagesAsRead(userId);
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      markMessagesAsRead: async (senderId) => {
        if (!senderId) return;
        try {
          await axiosInstance.patch(`/message/read/${senderId}`);
          // Update status in local message store and conversation list
          set({
            messages: get().messages.map((m) =>
              String(m.senderId) === String(senderId) && m.status !== "seen"
                ? { ...m, status: "seen" }
                : m,
            ),
            conversations: get().conversations.map((c) =>
              String(c._id) === String(senderId)
                ? { ...c, unreadCount: 0 }
                : c,
            ),
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      },

      deleteMessage: async (messageId) => {
        if (!messageId) return;
        try {
          await axiosInstance.delete(`/message/${messageId}`);
          set({
            messages: get().messages.map((m) =>
              m._id === messageId
                ? {
                    ...m,
                    isDeleted: true,
                    message: "This message was deleted",
                    mediaUrl: "",
                    thumbnailUrl: "",
                  }
                : m,
            ),
          });
        } catch (error) {
          console.error("Error deleting message:", error);
        }
      },

      sendMessage: async (userId, { message, chatMedia, mediaType: directMediaType, thumbnailUrl: directThumb }) => {
        const optimisticId = `optimistic-${Date.now()}`;
        const myId = useAuthStore.getState().authUser?._id || "";
        
        let determinedMediaType = directMediaType;
        if (!determinedMediaType && chatMedia) {
          if (chatMedia.type.startsWith("image/")) determinedMediaType = chatMedia.type.includes("gif") ? "gif" : "image";
          else if (chatMedia.type.startsWith("video/")) determinedMediaType = "video";
          else if (chatMedia.type.startsWith("audio/")) determinedMediaType = "audio";
        }

        const optimisticMsg = {
          _id: optimisticId,
          senderId: myId,
          receiverId: userId,
          message: message || "",
          mediaUrl: chatMedia ? URL.createObjectURL(chatMedia) : undefined,
          mediaType: determinedMediaType,
          thumbnailUrl: directThumb,
          mediaSize: chatMedia?.size,
          createdAt: new Date().toISOString(),
          status: "sending" as const,
        };

        // Append optimistically
        set({ messages: [...get().messages, optimisticMsg] });

        try {
          if (chatMedia) set({ sendingMedia: true });

          // Encrypt text message with E2EE
          let e2eeData: any = {};
          if (message && myId) {
            e2eeData = await encryptOutgoingMessage(myId, String(userId), message);
          }

          let uploadedMediaUrl = "";
          const uploadedMediaType = determinedMediaType || "";

          if (chatMedia) {
            let usedDirectUpload = false;

            try {
              const authRes = await axiosInstance.get("/message/upload-auth");
              const { token, expire, signature, publicKey } = authRes.data;

              if (publicKey) {
                const uploadForm = new FormData();
                uploadForm.append("file", chatMedia);
                uploadForm.append("fileName", `chat-${Date.now()}-${chatMedia.name}`);
                uploadForm.append("folder", "chat_media");
                uploadForm.append("token", token);
                uploadForm.append("expire", String(expire));
                uploadForm.append("signature", signature);
                uploadForm.append("publicKey", publicKey);

                const ikRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
                  method: "POST",
                  body: uploadForm,
                });

                if (ikRes.ok) {
                  const ikData = await ikRes.json();
                  uploadedMediaUrl = ikData.url;
                  usedDirectUpload = true;
                }
              }
            } catch (uploadErr) {
              console.warn("Direct upload fallback:", uploadErr);
            }

            if (!usedDirectUpload) {
              const formData = new FormData();
              formData.append("message", e2eeData.isEncrypted ? "" : message);
              if (e2eeData.isEncrypted) {
                formData.append("isEncrypted", "true");
                formData.append("ciphertext", e2eeData.ciphertext);
                formData.append("iv", e2eeData.iv);
                formData.append("authTag", e2eeData.authTag || "");
                if (e2eeData.x3dhHeader) formData.append("x3dhHeader", JSON.stringify(e2eeData.x3dhHeader));
                if (e2eeData.ratchetHeader) formData.append("ratchetHeader", JSON.stringify(e2eeData.ratchetHeader));
              }
              formData.append("chatMedia", chatMedia);
              if (determinedMediaType) formData.append("mediaType", determinedMediaType);
              
              const fallbackRes = await axiosInstance.post(
                `/message/send/${userId}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" }, timeout: 0 }
              );
              const newMsg = fallbackRes.data.newMessage;
              if (newMsg) {
                set({
                  messages: get().messages.map((msg) =>
                    msg._id === optimisticId ? { ...newMsg, message } : msg
                  ),
                });
              }
              return;
            }
          }

          // Step 3: Tell backend to save the message record with the CDN URL and E2EE fields
          const res = await axiosInstance.post(`/message/send/${userId}`, {
            message: e2eeData.isEncrypted ? "" : message,
            isEncrypted: e2eeData.isEncrypted || false,
            ciphertext: e2eeData.ciphertext || "",
            iv: e2eeData.iv || "",
            authTag: e2eeData.authTag || "",
            x3dhHeader: e2eeData.x3dhHeader,
            ratchetHeader: e2eeData.ratchetHeader,
            ...(uploadedMediaUrl && { mediaUrl: uploadedMediaUrl, mediaType: uploadedMediaType }),
            ...(directThumb && { thumbnailUrl: directThumb }),
            mediaSize: chatMedia?.size,
          });

          const newMsg = res.data.newMessage;
          if (newMsg) {
            set({
              messages: get().messages.map((msg) =>
                msg._id === optimisticId ? { ...newMsg, message } : msg
              ),
            });
          }
        } catch (error) {
          console.error("Error sending message:", error);
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
        socket.off("message:read");
        socket.off("message:deleted");

        socket.on(
          "new:message",
          async (newMessage: any) => {
            if (String(newMessage.senderId) !== String(userId)) return;

            if (get().isSoundEnabled) {
              soundManager.playNotificationSound();
            }

            const myId = useAuthStore.getState().authUser?._id || "";
            let displayMsg = newMessage;
            if (newMessage.isEncrypted) {
              const decrypted = await decryptIncomingMessage(myId, String(userId), newMessage);
              displayMsg = { ...newMessage, message: decrypted };
            }

            set({ messages: [...get().messages, displayMsg] });
            get().markMessagesAsRead(userId);
            get().getConversations();
          },
        );

        // When the other user views messages, upgrade all outbound messages to "seen" (Double Blue Tick)
        socket.on(
          "message:read",
          (_data: { conversationUserId: string; readAt: string }) => {
            set({
              messages: get().messages.map((m) =>
                m.status !== "seen" ? { ...m, status: "seen" } : m
              ),
            });
          }
        );

        // When a message is deleted for everyone
        socket.on(
          "message:deleted",
          (data: { messageId: string }) => {
            set({
              messages: get().messages.map((m) =>
                m._id === data.messageId
                  ? {
                      ...m,
                      isDeleted: true,
                      message: "This message was deleted",
                      mediaUrl: "",
                      thumbnailUrl: "",
                    }
                  : m
              ),
            });
          }
        );
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("new:message");
        socket?.off("message:read");
        socket?.off("message:deleted");
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
