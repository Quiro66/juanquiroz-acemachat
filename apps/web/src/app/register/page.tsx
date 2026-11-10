"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import {
  Eye,
  EyeOff,
  MessageCircle,
  ShieldCheck,
  Users,
  Zap,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useAuth } from "@/contexts/auth-context";

import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/features/auth/auth.schemas";

import type { ApiErrorResponse } from "@/features/auth/auth.types";

const initialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();

  const [values, setValues] = useState(initialValues);

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/chat");
    }
  }, [isAuthenticated, isLoading, router]);

  function handleChange(
    field: keyof RegisterFormValues,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setApiError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError("");

    const validation = registerFormSchema.safeParse(values);

    if (!validation.success) {
      const fieldErrors: typeof errors = {};

      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof RegisterFormValues;

        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await register({
        name: validation.data.name,
        email: validation.data.email,
        password: validation.data.password,
      });

      router.push("/?registered=true");
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const response = error.response?.data;

        if (response?.errors?.length) {
          const fieldErrors: typeof errors = {};

          for (const issue of response.errors) {
            const field = issue.field as keyof RegisterFormValues;

            if (field in initialValues && !fieldErrors[field]) {
              fieldErrors[field] = issue.message;
            }
          }

          setErrors(fieldErrors);
        }

        setApiError(
          response?.message ??
            "No fue posible crear la cuenta. Inténtalo nuevamente.",
        );
      } else {
        setApiError("Ocurrió un error inesperado. Inténtalo nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen">
      <section className="auth-gradient relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="absolute -right-24 top-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <MessageCircle size={24} />
          </div>

          <span className="text-xl font-bold tracking-wide">
            ACEMA CHAT
          </span>
        </div>

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
            Crea tu cuenta y comienza a compartir ideas y mensajes en un
            espacio diseñado para trabajar mejor juntos.
          </p>

          <div className="mt-12 space-y-5">
            {[
              { icon: Zap, text: "Mensajería instantánea" },
              { icon: Users, text: "Conversaciones individuales y grupales" },
              { icon: ShieldCheck, text: "Acceso seguro a tus conversaciones" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Icon size={19} />
                </div>

                <span className="text-sm text-indigo-100">{text}</span>
              </div>
            ))}
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
              COMIENZA AHORA
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Crear una cuenta
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Completa tus datos para comenzar a utilizar ACEMA Chat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <InputField
              label="Nombre completo"
              name="name"
              placeholder="Ej. Juan Quiroz"
              autoComplete="name"
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              error={errors.name}
            />

            <InputField
              label="Correo electrónico"
              name="email"
              type="email"
              placeholder="nombre@correo.com"
              autoComplete="email"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              error={errors.email}
            />

            <div className="relative">
              <InputField
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Crea una contraseña segura"
                autoComplete="new-password"
                value={values.password}
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
                error={errors.password}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-10 text-gray-400 hover:text-gray-700"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <div className="relative">
              <InputField
                label="Confirmar contraseña"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(event) =>
                  handleChange("confirmPassword", event.target.value)
                }
                error={errors.confirmPassword}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                className="absolute right-4 top-10 text-gray-400 hover:text-gray-700"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmación"
                    : "Mostrar confirmación"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {apiError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <Button type="submit" loading={isSubmitting}>
              Crear mi cuenta
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/"
              className="font-semibold text-primary hover:underline"
            >
              Inicia sesión
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-gray-400">
            Al crear una cuenta, tus datos serán gestionados de forma segura.
          </p>
        </div>
      </section>
    </main>
  );
}
