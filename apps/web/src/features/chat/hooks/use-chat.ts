
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { useAuth } from "@/contexts/auth-context";

import {
  createConversation as createConversationRequest,
  getConversations,
  getMessages,
  getUsers,
} from "../chat.service";

import {
  createChatSocket,
  type ChatSocket,
  type IncomingChatMessage,
} from "../chat.socket";

import type {
  ChatMessage,
  ChatUser,
  Conversation,
  CreateConversationInput,
} from "../chat.types";

type ConnectionStatus =
  | "connected"
  | "reconnecting"
  | "disconnected";

interface UseChatReturn {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  selectedConversationId: string | null;
  messages: ChatMessage[];
  users: ChatUser[];
  unreadCounts: Record<string, number>;
  connectionStatus: ConnectionStatus;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingUsers: boolean;
  isSending: boolean;
  error: string | null;
  selectConversation: (id: string) => void;
  refreshConversations: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  startConversation: (input: CreateConversationInput) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      "No se pudo conectar con el servidor"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ha ocurrido un error inesperado";
}

function addMessageIfMissing(
  currentMessages: ChatMessage[],
  message: ChatMessage,
): ChatMessage[] {
  if (currentMessages.some((item) => item.id === message.id)) {
    return currentMessages;
  }

  return [...currentMessages, message].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime(),
  );
}

export function useChat(): UseChatReturn {
  const { token } = useAuth();

  const socketRef = useRef<ChatSocket | null>(null);
  const selectedIdRef = useRef<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(
    {},
  );

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const [isLoadingConversations, setIsLoadingConversations] =
    useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const selectedConversation =
    conversations.find(
      (conversation) => conversation.id === selectedConversationId,
    ) ?? null;

  const refreshConversations = useCallback(async () => {
    if (!token) return;

    setError(null);

    try {
      const result = await getConversations(token);

      setConversations(result);

      const currentId = selectedIdRef.current;
      const nextId =
        currentId && result.some((item) => item.id === currentId)
          ? currentId
          : (result[0]?.id ?? null);

      if (currentId !== nextId) {
        selectedIdRef.current = nextId;
        setMessages([]);
      }

      setSelectedConversationId(nextId);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoadingConversations(false);
    }
  }, [token]);

  // Carga inicial de conversaciones.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function loadInitialConversations() {
      try {
        const result = await getConversations(token!);

        if (cancelled) return;

        setConversations(result);

        const nextId = result[0]?.id ?? null;

        selectedIdRef.current = nextId;
        setSelectedConversationId(nextId);
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingConversations(false);
        }
      }
    }

    void loadInitialConversations();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Conexión y eventos de Socket.IO.
  useEffect(() => {
    if (!token) {
      setConnectionStatus("disconnected");
      return;
    }

    const socket = createChatSocket(token);
    socketRef.current = socket;

    const handleConnect = () => {
      setConnectionStatus("connected");

      const conversationId = selectedIdRef.current;

      if (conversationId) {
        socket.emit("conversation:join", conversationId);
      }
    };

    const handleDisconnect = () => {
      setConnectionStatus("disconnected");
    };

    const handleConnectError = () => {
      setConnectionStatus("reconnecting");
    };

    const handleReconnectAttempt = () => {
      setConnectionStatus("reconnecting");
    };

    const handleReconnect = () => {
      setConnectionStatus("connected");
    };

    const handleReconnectFailed = () => {
      setConnectionStatus("disconnected");
    };

    const handleNewMessage = (message: IncomingChatMessage) => {
      const isSelected =
        selectedIdRef.current === message.conversationId;

      // Actualizar la última actividad de la conversación.
      setConversations((current) => {
        const updated = current.map((conversation) => {
          if (conversation.id !== message.conversationId) {
            return conversation;
          }

          return {
            ...conversation,
            updatedAt: message.createdAt,
            messages: [message],
          };
        });

        return updated.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime(),
        );
      });

      // Solo agregar el mensaje si pertenece al chat abierto.
      if (isSelected) {
        setMessages((current) =>
          addMessageIfMissing(current, message),
        );
        return;
      }

      // Incrementar contador de mensajes no leídos.
      setUnreadCounts((current) => ({
        ...current,
        [message.conversationId]:
          (current[message.conversationId] ?? 0) + 1,
      }));
    };

    const handleNewConversation = () => {
      void refreshConversations();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);
    socket.io.on("reconnect", handleReconnect);
    socket.io.on("reconnect_failed", handleReconnectFailed);

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:new", handleNewConversation);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
      socket.io.off("reconnect", handleReconnect);
      socket.io.off("reconnect_failed", handleReconnectFailed);

      socket.off("message:new", handleNewMessage);
      socket.off("conversation:new", handleNewConversation);

      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, refreshConversations]);

  // Entrar y salir de la sala de la conversación activa.
  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !selectedConversationId) return;

    if (socket.connected) {
      socket.emit("conversation:join", selectedConversationId);
    }

    return () => {
      if (socket.connected) {
        socket.emit("conversation:leave", selectedConversationId);
      }
    };
  }, [selectedConversationId]);

  // Cargar historial de mensajes.
  useEffect(() => {
    if (!token || !selectedConversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadMessages() {
      setIsLoadingMessages(true);
      setError(null);

      try {
        const result = await getMessages(token!, selectedConversationId!);

        if (!cancelled) {
          setMessages((currentMessages) => {
            const merged = new Map<string, ChatMessage>();

            for (const message of result) {
              merged.set(message.id, message);
            }

            for (const message of currentMessages) {
              merged.set(message.id, message);
            }

            return [...merged.values()].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
          });
        }
      } catch (error) {
        if (!cancelled) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMessages(false);
        }
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [token, selectedConversationId]);

  const selectConversation = useCallback((id: string) => {
    if (selectedIdRef.current === id) return;

    selectedIdRef.current = id;
    setMessages([]);
    setSelectedConversationId(id);

    // Marcar los mensajes de esta conversación como leídos localmente.
    setUnreadCounts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const searchUsers = useCallback(
    async (query: string) => {
      if (!token) return;

      setIsLoadingUsers(true);
      setError(null);

      try {
        const result = await getUsers(token, {
          q: query,
          page: 1,
          limit: 20,
        });

        setUsers(result.users);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setIsLoadingUsers(false);
      }
    },
    [token],
  );

  const startConversation = useCallback(
    async (input: CreateConversationInput) => {
      if (!token) return;

      setError(null);

      try {
        const conversation = await createConversationRequest(token, input);

        await refreshConversations();

        selectedIdRef.current = conversation.id;
        setMessages([]);
        setSelectedConversationId(conversation.id);

        setUnreadCounts((current) => {
          const next = { ...current };
          delete next[conversation.id];
          return next;
        });
      } catch (error) {
        setError(getErrorMessage(error));
        throw error;
      }
    },
    [token, refreshConversations],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const socket = socketRef.current;

      if (!socket?.connected) {
        throw new Error("No hay conexión con el servidor de chat");
      }

      if (!selectedConversationId) {
        throw new Error("Selecciona una conversación");
      }

      const normalizedContent = content.trim();

      if (!normalizedContent) {
        throw new Error("El mensaje no puede estar vacío");
      }

      if (normalizedContent.length > 5000) {
        throw new Error("El mensaje no puede superar los 5000 caracteres");
      }

      setIsSending(true);
      setError(null);

      try {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "message:send",
            {
              conversationId: selectedConversationId,
              content: normalizedContent,
            },
            (response) => {
              if (!response.success) {
                reject(new Error(response.message));
                return;
              }

              resolve();
            },
          );
        });
      } catch (error) {
        setError(getErrorMessage(error));
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [selectedConversationId],
  );

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    users,
    unreadCounts,
    connectionStatus,
    isLoadingConversations,
    isLoadingMessages,
    isLoadingUsers,
    isSending,
    error,
    selectConversation,
    refreshConversations,
    searchUsers,
    startConversation,
    sendMessage,
  };
}
