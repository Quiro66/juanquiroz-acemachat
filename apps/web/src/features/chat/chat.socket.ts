
import { io, type Socket } from "socket.io-client";
import type { ChatMessage, SocketAck } from "./chat.types";

export type IncomingChatMessage = ChatMessage & {
  conversationId: string;
};

interface ServerToClientEvents {
  "message:new": (message: IncomingChatMessage) => void;

  "conversation:new": (payload: {
    conversationId: string;
  }) => void;
}

interface ClientToServerEvents {
  "conversation:join": (
    conversationId: string,
    callback?: (response: SocketAck) => void,
  ) => void;

  "conversation:leave": (conversationId: string) => void;

  "message:send": (
    payload: {
      conversationId: string;
      content: string;
    },
    callback?: (response: SocketAck) => void,
  ) => void;
}

export type ChatSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export function createChatSocket(token: string): ChatSocket {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

  if (!socketUrl) {
    throw new Error(
      "No está configurada la URL del servidor Socket.IO",
    );
  }

  const socket: ChatSocket = io(socketUrl, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: false,
  });

  return socket;
}
