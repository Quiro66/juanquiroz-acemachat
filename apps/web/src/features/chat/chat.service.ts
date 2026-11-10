
import { api } from "@/lib/axios";
import type { AuthResponse } from "@/features/auth/auth.types";

import type {
  ChatMessage,
  Conversation,
  ConversationCreated,
  CreateConversationInput,
  UsersResponse,
} from "./chat.types";

interface AuthConfig {
  headers: {
    Authorization: string;
  };
}

function getAuthConfig(token: string): AuthConfig {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function getConversations(
  token: string,
): Promise<Conversation[]> {
  const response = await api.get<AuthResponse<Conversation[]>>(
    "/conversations",
    getAuthConfig(token),
  );

  return response.data.data;
}

export async function getUsers(
  token: string,
  params?: {
    q?: string;
    page?: number;
    limit?: number;
  },
): Promise<UsersResponse> {
  const response = await api.get<AuthResponse<UsersResponse>>(
    "/users",
    {
      ...getAuthConfig(token),
      params,
    },
  );

  return response.data.data;
}

export async function getMessages(
  token: string,
  conversationId: string,
): Promise<ChatMessage[]> {
  const response = await api.get<AuthResponse<ChatMessage[]>>(
    `/conversations/${conversationId}/messages`,
    getAuthConfig(token),
  );

  return response.data.data;
}

export async function createConversation(
  token: string,
  input: CreateConversationInput,
): Promise<ConversationCreated> {
  const response = await api.post<
    AuthResponse<ConversationCreated>
  >(
    "/conversations",
    input,
    getAuthConfig(token),
  );

  return response.data.data;
}
