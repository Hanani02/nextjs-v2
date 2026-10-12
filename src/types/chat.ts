export interface ChatMessage {
  id: string;
  senderId: string;
  username: string;
  message: string;
  timestamp: number;
  color?: string;
  isSelf?: boolean;
}

export interface ActiveChatBubble {
  message: string;
  timestamp: number;
  expiresAt: number;
}
