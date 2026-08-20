import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { initializeUserE2EE } from "../lib/e2eeSession";

interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  profilePic?: string;
  avatarColor?: string;
  createdAt?: string;
}

interface AuthState {
  authUser: UserProfile | null;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  onlineUsers: string[];
  socket: any;

  checkAuth: () => Promise<void>;
  signin: (identifier: string, password: string) => Promise<boolean>;
  signup: (data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuth: () => void;
  setOnlineUsers: (users: string[]) => void;
  setSocket: (socket: any) => void;
  connectSocket: (user: UserProfile) => void;
  disconnectSocket: () => void;
}

const getSocketBaseURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.DEV) {
    const hostname =
      typeof window !== "undefined" && window.location.hostname
        ? window.location.hostname
        : "localhost";
    return `http://${hostname}:3000`;
  }
  return typeof window !== "undefined" ? window.location.origin : "/";
};

const baseURL = getSocketBaseURL();

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  onlineUsers: [] as string[],
  socket: null,

  setOnlineUsers: (users: string[]) => set({ onlineUsers: users }),
  setSocket: (socket: any) => set({ socket }),

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      if (res.data && (res.data.success || res.data._id)) {
        const user = res.data;
        if (user.token) {
          Cookies.set("jwt_token", user.token, {
            expires: 7,
            secure: window.location.protocol === "https:",
            sameSite: "lax",
          });
        }
        set({ authUser: user });
        get().connectSocket(user);
        initializeUserE2EE(user._id).catch((e) => console.error("E2EE Init:", e));
      } else {
        set({ authUser: null });
      }
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signin: async (identifier: string, password: string): Promise<boolean> => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/signin", {
        identifier,
        password,
      });

      if (res.data && (res.data.success || res.data._id)) {
        const user = res.data;
        if (user.token) {
          Cookies.set("jwt_token", user.token, { expires: 7, secure: window.location.protocol === "https:", sameSite: "lax" });
        }
        set({ authUser: user });
        get().connectSocket(user);
        initializeUserE2EE(user._id).catch((e) => console.error("E2EE Init:", e));
        toast.success(`Welcome back, ${user.fullName || user.username}!`);
        return true;
      }
      toast.error(res.data?.message || "Sign in failed");
      return false;
    } catch (error: any) {
      const msg = error.payload?.message || error.message || "Failed to sign in";
      toast.error(msg);
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  signup: async (data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      if (res.data && (res.data.success || res.data._id)) {
        const user = res.data;
        if (user.token) {
          Cookies.set("jwt_token", user.token, { expires: 7, secure: window.location.protocol === "https:", sameSite: "lax" });
        }
        set({ authUser: user });
        get().connectSocket(user);
        initializeUserE2EE(user._id).catch((e) => console.error("E2EE Init:", e));
        toast.success(`Welcome to iMessage, ${user.fullName}!`);
        return true;
      }
      toast.error(res.data?.message || "Sign up failed");
      return false;
    } catch (error: any) {
      const msg = error.payload?.message || error.message || "Failed to sign up";
      toast.error(msg);
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      toast.success("Signed out successfully");
    } catch {
      // ignore
    } finally {
      get().clearAuth();
    }
  },

  clearAuth: () => {
    Cookies.remove("jwt_token");
    get().disconnectSocket();
    set({
      authUser: null,
      isCheckingAuth: false,
      onlineUsers: [],
      socket: null,
    });
  },

  connectSocket: (user: UserProfile) => {
    if (!user || get().socket?.connected) return;

    const socket = io(baseURL, {
      query: { userId: user._id },
      transports: ["websocket"],
    });

    set({ socket: socket });

    socket.on("online", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    socket.on("disconnect", () => {
      const s = get().socket;
      if (s?.connected) s.disconnect();
      set({ onlineUsers: [], socket: null });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
  },
}));
