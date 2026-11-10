
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  MessageCircle,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/contexts/auth-context";
import type { ApiErrorResponse } from "@/features/auth/auth.types";

export default function HomePage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      router.push("/chat");
    } catch (err) {
      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        setError(
          err.response?.data?.message ??
            "No fue posible iniciar sesión. Inténtalo nuevamente.",
        );
      } else {
        setError("Ocurrió un error inesperado. Inténtalo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-white">
      <section className="auth-gradient relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-20 h-96 w-96 rounded-full border border-white/10" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur">
            <MessageCircle size={28} />
          </div>

          <span className="text-2xl font-bold tracking-tight">
            ACEMA<span className="text-indigo-300">Chat</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <span className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium tracking-wider">
            COMUNICACIÓN EN TIEMPO REAL
          </span>

          <h1 className="text-5xl font-bold leading-tight">
            Conecta con tu equipo.
            <span className="mt-2 block text-indigo-300">
              Comunícate sin límites.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-indigo-100/80">
            Una plataforma diseñada para mantener a tu equipo conectado,
            compartir ideas y colaborar en tiempo real.
          </p>

          <div className="mt-12 space-y-5">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/10 p-3">
                <MessageCircle size={20} />
              </div>
              <span className="text-sm text-indigo-100">
                Mensajería instantánea
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/10 p-3">
                <LockKeyhole size={20} />
              </div>
              <span className="text-sm text-indigo-100">
                Conversaciones seguras
              </span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-indigo-200/60">
          ACEMA INGENIERÍA · CHAT EN TIEMPO REAL
        </p>
      </section>

      <section className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="animate-fade-in w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 text-primary">
              <MessageCircle size={30} />
              <span className="text-xl font-bold">ACEMA CHAT</span>
            </div>
          </div>

          <div className="mb-8">
            <span className="text-sm font-semibold text-primary">
              BIENVENIDO DE NUEVO
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Iniciar sesión
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="nombre@correo.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="relative">
              <InputField
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-10 text-gray-400 transition hover:text-gray-700"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" loading={loading}>
              Iniciar sesión
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            ¿Todavía no tienes una cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-gray-400">
            ACEMA Chat · Comunicación segura y en tiempo real.
          </p>
        </div>
      </section>
    </main>
  );
}
