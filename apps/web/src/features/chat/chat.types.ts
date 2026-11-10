
export interface ChatUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ConversationParticipant {
  user: Pick<ChatUser, "id" | "name" | "email">;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface Conversation {
  id: string;
  title: string | null;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: ChatMessage[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  users: ChatUser[];
  pagination: Pagination;
}

export interface CreateConversationInput {
  participantIds: string[];
  title?: string;
}

export interface ConversationCreated {
  id: string;
}

export interface SocketAck {
  success: boolean;
  message: string;
  data?: unknown;
}
