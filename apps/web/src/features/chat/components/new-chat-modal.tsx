"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Search, Users, X } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useChat } from "../hooks/use-chat";
import type { ChatUser } from "../chat.types";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: ReturnType<typeof useChat>;
}

export function NewChatModal({
  isOpen,
  onClose,
  chat,
}: NewChatModalProps) {
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<ChatUser[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = chat.searchUsers;

  useEffect(() => {
    if (isOpen) {
      void searchUsers("");
    }
  }, [isOpen, searchUsers]);

  if (!isOpen) return null;

  const availableUsers = chat.users.filter(
    (item) => item.id !== user?.id,
  );

  const isGroup = selectedUsers.length > 1;

  const toggleUser = (selectedUser: ChatUser) => {
    setError(null);

    setSelectedUsers((current) => {
      const exists = current.some((item) => item.id === selectedUser.id);

      if (exists) {
        return current.filter((item) => item.id !== selectedUser.id);
      }

      return [...current, selectedUser];
    });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void chat.searchUsers(query.trim());
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedUsers.length === 0) {
      setError("Selecciona al menos un usuario.");
      return;
    }

    if (isGroup && title.trim().length < 2) {
      setError("Escribe un nombre para el grupo.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await chat.startConversation({
        participantIds: selectedUsers.map((item) => item.id),
        ...(isGroup ? { title: title.trim() } : {}),
      });

      setSelectedUsers([]);
      setTitle("");
      setQuery("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la conversación.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isCreating) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-fade-in"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2
              id="new-chat-title"
              className="text-lg font-bold text-slate-900"
            >
              Nueva conversación
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Selecciona las personas con las que deseas conversar.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto p-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-400">
              <Search size={17} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={chat.isLoadingUsers}
              className="rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              Buscar
            </button>
          </form>

          {selectedUsers.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-slate-500">
                SELECCIONADOS ({selectedUsers.length})
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <button
                    key={selectedUser.id}
                    type="button"
                    onClick={() => toggleUser(selectedUser)}
                    className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                    title="Quitar usuario"
                  >
                    {selectedUser.name} ×
                  </button>
                ))}
              </div>
            </div>
          )}

          {isGroup && (
            <div className="mt-4">
              <label
                htmlFor="group-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nombre del grupo
              </label>

              <input
                id="group-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={100}
                placeholder="Ej. Equipo de desarrollo"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
              />
            </div>
          )}

          <div className="mb-2 mt-5 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              Usuarios disponibles
            </p>

            <span className="text-xs text-slate-400">
              {availableUsers.length} usuarios
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {chat.isLoadingUsers ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                <LoaderCircle size={18} className="animate-spin" />
                Buscando usuarios...
              </div>
            ) : availableUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No se encontraron usuarios.
              </p>
            ) : (
              <div className="space-y-1">
                {availableUsers.map((item) => {
                  const isSelected = selectedUsers.some(
                    (selected) => selected.id === item.id,
                  );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleUser(item)}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                        isSelected
                          ? "bg-indigo-50 ring-1 ring-indigo-200"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {item.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {item.email}
                        </p>
                      </div>

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300"
                        }`}
                      >
                        {isSelected ? "✓" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {chat.error && !error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {chat.error}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users size={16} />
            {isGroup ? "Grupo" : "Chat privado"}
          </div>

          <form onSubmit={handleCreate}>
            <button
              type="submit"
              disabled={isCreating || selectedUsers.length === 0}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              {isCreating ? "Creando..." : "Crear conversación"}
            </button>
          </form>
        </footer>
      </section>
    </div>
  );
}
