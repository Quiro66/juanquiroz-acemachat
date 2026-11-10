"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, MessageCircle } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/features/chat/hooks/use-chat";
import { ChatLayout } from "@/features/chat/components/chat-layout";

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const chat = useChat();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <MessageCircle size={27} />
          </div>

          <LoaderCircle
            size={25}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Verificando tu sesión...
          </p>
        </div>
      </main>
    );
  }

  return <ChatLayout chat={chat} />;
}
