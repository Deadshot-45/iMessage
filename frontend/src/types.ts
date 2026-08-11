export interface Message {
  id: number;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

export interface Conversation {
  id: number;
  name: string;
  avatarColor: string;
  status: string;
  messages: Message[];
  unread: boolean;
  replies: string[];
}
