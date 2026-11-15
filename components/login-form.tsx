"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useTurnstile } from "@/components/turnstile";
import { login } from "@/app/login/actions";
import { AuthCard, AuthField, AuthFooter, AuthLink, AuthSubmit } from "@/components/auth/auth-card";

export function LoginForm({ notice }: { notice?: ReactNode }) {
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

    // Si salió bien, la acción ya redirigió (sin resultado): solo se maneja el error.
    if (result && !result.ok) {
      setPending(false);
      toast.error(result.message ?? "No se pudo iniciar sesión.");
      turnstile.reset();
    }
  }

  return (
    <AuthCard title="Inicia sesión en Bakata">
      {notice}
      <form className="mt-10 grid gap-8" onSubmit={handleSubmit}>
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="username"
          placeholder="tu@email.com"
          required
        />
        <div className="grid gap-2">
          <AuthField
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            placeholder="••••••"
            required
          />
          <div className="text-right">
            <AuthLink href="/recuperar">¿Olvidaste tu contraseña?</AuthLink>
          </div>
        </div>
        {turnstile.widget}
        <AuthSubmit
          pending={pending || turnstile.verifying}
          label="Iniciar sesión"
          pendingLabel={pending ? "Ingresando…" : "Verificando…"}
        />
      </form>
      <AuthFooter question="¿No tienes una cuenta?" href="/signup" linkLabel="Registrate" />
    </AuthCard>
  );
}
