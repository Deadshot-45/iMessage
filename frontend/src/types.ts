export interface Message {
  id: string | number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
  mediaUrl?: string;
  mediaType?: string;
}

export interface Conversation {
  id: string | number;
  name: string;
  avatarColor: string;
  status: string;
  messages: Message[];
  unread: boolean;
  replies: string[];
}
