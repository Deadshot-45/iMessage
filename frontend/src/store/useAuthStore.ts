import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

interface AuthState {
  authUser: any;
  isCheckingAuth: boolean;
  onlineUsers: any[];
  socket: any;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
  setOnlineUsers: (users: any[]) => void;
  setSocket: (socket: any) => void;
  connectSocket: (user: any) => void;
  disconnectSocket: () => void;
}

const baseURL = import.meta.env.DEV
  ? "http://localhost:3000"
  : typeof window !== "undefined" ? window.location.origin : "/";

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [] as any[],
  socket: null,

  setOnlineUsers: (users: any[]) => set({ onlineUsers: users }),
  setSocket: (socket: any) => set({ socket }),

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      if (res.data.success) {
        set({ authUser: res.data });
        get().connectSocket(res.data);
      } else {
        set({ authUser: null });
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  clearAuth: () => {
    get().disconnectSocket();
    set({
      authUser: null,
      isCheckingAuth: false,
      onlineUsers: [],
      socket: null,
    });
  },

  connectSocket: (user: any) => {
    if (!user || get().socket?.connected) return;

    const socket = io(baseURL, {
      query: { userId: user?._id || user?.userId || user?.clerkId },
      transports: ["websocket"],
    });

    set({ socket: socket });

    socket.on("online", (userIds: any[]) => {
      set({ onlineUsers: userIds });
    });

    socket.on("disconnect", () => {
      const socket = get().socket;
      if (socket?.connected) socket.disconnect();
      set({ onlineUsers: [], socket: null });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
  },
}));
