
"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  Send,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useChat } from "../hooks/use-chat";
import { NewChatModal } from "./new-chat-modal";

type ChatState = ReturnType<typeof useChat>;

interface ChatLayoutProps {
  chat: ChatState;
}

function formatMessageTime(date: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getConversationName(
  conversation: ChatState["conversations"][number],
  currentUserId?: string,
): string {
  if (conversation.title) return conversation.title;

  const otherParticipant = conversation.participants.find(
    (participant) => participant.user.id !== currentUserId,
  );

  return otherParticipant?.user.name ?? "Conversación";
}

const connectionLabels = {
  connected: "Conectado",
  reconnecting: "Reconectando...",
  disconnected: "Desconectado",
} as const;

const connectionColors = {
  connected: "bg-emerald-500",
  reconnecting: "bg-amber-500",
  disconnected: "bg-red-500",
} as const;

export function ChatLayout({ chat }: ChatLayoutProps) {
  const { user, logout } = useAuth();

  const [search, setSearch] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMobileConversationOpen, setIsMobileConversationOpen] =
    useState(false);
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return chat.conversations;

    return chat.conversations.filter((conversation) =>
      getConversationName(conversation, user?.id)
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [chat.conversations, search, user?.id]);

  const handleSendMessage = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const content = message.trim();

    if (!content || chat.isSending || !chat.selectedConversationId) {
      return;
    }

    setSendError(null);

    try {
      await chat.sendMessage(content);
      setMessage("");
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el mensaje",
      );
    }
  };

  return (
    <main className="flex h-dvh min-h-0 overflow-hidden bg-slate-100">
      <aside
        className={`${
          isMobileConversationOpen ? "hidden lg:flex" : "flex"
        } w-full max-w-none shrink-0 flex-col border-r border-slate-200 bg-white sm:max-w-md lg:w-80`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <MessageCircle size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                ACEMA Chat
              </h1>
              <p className="text-xs text-slate-500">
                Mensajería en tiempo real
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
          >
            <LogOut size={19} />
          </button>
        </header>

        <div className="border-b border-slate-100 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">
              Conversaciones
            </h2>

            <button
              type="button"
              onClick={() => setIsNewChatOpen(true)}
              className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              <Plus size={15} />
              Nuevo chat
            </button>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-400">
            <Search size={17} className="text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar conversación..."
              className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chat.isLoadingConversations ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Cargando conversaciones...
            </p>
          ) : filteredConversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <MessageCircle
                size={30}
                className="mx-auto mb-3 text-slate-300"
              />
              <p className="text-sm font-medium text-slate-600">
                {search
                  ? "No se encontraron conversaciones"
                  : "Todavía no tienes conversaciones"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {search
                  ? "Prueba con otro nombre"
                  : "Crea un chat para comenzar"}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isSelected =
                conversation.id === chat.selectedConversationId;

              const lastMessage = conversation.messages[0];
              const unreadCount =
                chat.unreadCounts[conversation.id] ?? 0;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => {
                    chat.selectConversation(conversation.id);
                    setIsMobileConversationOpen(true);
                  }}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                    isSelected
                      ? "bg-indigo-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <UserRound size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {getConversationName(conversation, user?.id)}
                      </p>

                      {lastMessage && (
                        <span className="shrink-0 text-[10px] text-slate-400">
                          {formatMessageTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-slate-500">
                        {lastMessage?.content ?? "Inicia una conversación"}
                      </p>

                      {unreadCount > 0 && (
                        <span
                          aria-label={`${unreadCount} mensajes sin leer`}
                          className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white"
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <footer className="border-t border-slate-200 bg-white p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {user?.name.charAt(0).toUpperCase() ?? "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email}
              </p>
            </div>

            <span
              className="flex shrink-0 items-center gap-1.5"
              title={connectionLabels[chat.connectionStatus]}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  connectionColors[chat.connectionStatus]
                }`}
              />
              <span className="hidden text-[10px] text-slate-500 sm:inline">
                {connectionLabels[chat.connectionStatus]}
              </span>
            </span>
          </div>
        </footer>
      </aside>

      <section
        className={`${
          isMobileConversationOpen ? "flex" : "hidden lg:flex"
        } min-w-0 flex-1 flex-col`}
      >
        {chat.selectedConversation ? (
          <>
            <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={() => setIsMobileConversationOpen(false)}
                aria-label="Volver a conversaciones"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
              >
                <ArrowLeft size={21} />
              </button>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                <UserRound size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  {getConversationName(
                    chat.selectedConversation,
                    user?.id,
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  {chat.selectedConversation.isGroup
                    ? "Conversación grupal"
                    : "Conversación privada"}
                </p>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5 lg:p-6">
              {chat.isLoadingMessages && chat.messages.length === 0 ? (
                <p className="m-auto text-sm text-slate-500">
                  Cargando mensajes...
                </p>
              ) : chat.messages.length === 0 ? (
                <div className="m-auto text-center">
                  <MessageCircle
                    size={42}
                    className="mx-auto mb-3 text-slate-300"
                  />
                  <p className="font-medium text-slate-600">
                    ¡Comienza la conversación!
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Envía tu primer mensaje.
                  </p>
                </div>
              ) : (
                chat.messages.map((item) => {
                  const isMine = item.user.id === user?.id;

                  return (
                    <article
                      key={item.id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[80%] lg:max-w-[75%] ${
                          isMine
                            ? "rounded-br-sm bg-indigo-600 text-white"
                            : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        {!isMine && (
                          <p className="mb-1 text-xs font-semibold text-indigo-600">
                            {item.user.name}
                          </p>
                        )}

                        <p className="whitespace-pre-wrap break-words text-sm">
                          {item.content}
                        </p>

                        <p
                          className={`mt-1 text-right text-[10px] ${
                            isMine ? "text-indigo-100" : "text-slate-400"
                          }`}
                        >
                          {formatMessageTime(item.createdAt)}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-200 bg-white p-4">
              {(chat.error || sendError) && (
                <p role="alert" className="mb-2 text-sm text-red-600">
                  {sendError ?? chat.error}
                </p>
              )}

              <form
                onSubmit={handleSendMessage}
                className="flex items-end gap-3"
              >
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={1}
                  maxLength={5000}
                  placeholder="Escribe un mensaje..."
                  aria-label="Escribe un mensaje"
                  className="max-h-32 min-h-12 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white"
                />

                <button
                  type="submit"
                  disabled={
                    !message.trim() ||
                    chat.isSending ||
                    !chat.selectedConversationId
                  }
                  aria-label="Enviar mensaje"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>

              <p className="mt-2 text-right text-[11px] text-slate-400">
                Enter para enviar · Shift + Enter para nueva línea
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600">
              <MessageCircle size={36} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Bienvenido a ACEMA Chat
            </h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Selecciona una conversación para ver los mensajes o crea una
              nueva para comenzar a comunicarte.
            </p>
          </div>
        )}
      </section>

      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        chat={chat}
      />
    </main>
  );
}
