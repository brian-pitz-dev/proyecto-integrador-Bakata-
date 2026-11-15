"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signup } from "@/app/signup/actions";
import {
  AuthCard,
  AuthField,
  AuthFooter,
  AuthSubmit,
  AuthTurnstile,
} from "@/components/auth/auth-card";
import { useTurnstile } from "@/components/auth/use-turnstile";

export function SignupForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const turnstile = useTurnstile("signup");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const result = await signup({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      turnstileToken: turnstile.token,
    });

    setPending(false);

    if (result.ok) {
      router.push("/onboarding");
      router.refresh();
    } else {
      toast.error(result.message ?? "No se pudo crear la cuenta.");
      turnstile.reset();
    }
  }

  return (
    <AuthCard title="Registrarse en Bakata">
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
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          required
        />
        <AuthTurnstile containerRef={turnstile.containerRef} />
        <AuthSubmit pending={pending} label="Registrarse" pendingLabel="Creando cuenta…" />
      </form>
      <AuthFooter question="¿Ya tenés cuenta?" href="/login" linkLabel="Iniciar sesión" />
    </AuthCard>
  );
}
