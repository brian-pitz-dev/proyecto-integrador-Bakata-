"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/app/login/actions";
import {
  AuthCard,
  AuthField,
  AuthFooter,
  AuthSubmit,
  AuthTurnstile,
} from "@/components/auth/auth-card";
import { useTurnstile } from "@/components/auth/use-turnstile";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const turnstile = useTurnstile("login");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await login({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      turnstileToken: turnstile.token,
    });

    setPending(false);

    if (result.ok) {
      router.push("/calendario");
      router.refresh();
    } else {
      toast.error(result.message ?? "No se pudo iniciar sesión.");
      turnstile.reset();
    }
  }

  return (
    <AuthCard title="Inicia sesión en Bakata">
      <form className="mt-10 grid gap-8" onSubmit={handleSubmit}>
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="username"
          placeholder="tu@email.com"
          required
        />
        <AuthField
          id="password"
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••"
          required
        />
        <AuthTurnstile containerRef={turnstile.containerRef} />
        <AuthSubmit pending={pending} label="Iniciar sesión" pendingLabel="Ingresando…" />
      </form>
      <AuthFooter question="¿No tienes una cuenta?" href="/signup" linkLabel="Registrate" />
    </AuthCard>
  );
}
