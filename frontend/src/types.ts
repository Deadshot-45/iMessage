export type MessageStatus = "sending" | "sent" | "delivered" | "seen" | "error";
export type MediaType = "image" | "video" | "audio" | "gif";

export interface Message {
  id: string | number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
  mediaUrl?: string;
  mediaType?: MediaType | string;
  thumbnailUrl?: string;
  mediaSize?: number;
  mediaDuration?: number;
  status?: MessageStatus;
  isDeleted?: boolean;
  uploadProgress?: number;
  downloadProgress?: number;
  isDownloaded?: boolean;
}

export interface Conversation {
  id: string | number;
  name: string;
  avatarColor: string;
  profilePic?: string;
  status: string;
  messages: Message[];
  unread: boolean;
  unreadCount?: number;
  replies: string[];
}
