"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useTurnstile } from "@/components/turnstile";
import { pedirRecuperacion } from "@/app/recuperar/actions";
import { AuthCard, AuthField, AuthFooter, AuthSubmit } from "@/components/auth/auth-card";

export function RecuperarForm({ notice }: { notice?: ReactNode }) {
  const [pending, setPending] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null);
  const turnstile = useTurnstile("recuperar");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    const result = await pedirRecuperacion({ email, turnstileToken: turnstile.token });
    setPending(false);
    if (result.ok) {
      setEnviado(email);
      return;
    }
    toast.error(result.message ?? "No se pudo mandar el mail.");
    turnstile.reset();
  }

  if (enviado) {
    return (
      <AuthCard
        title="Revisá tu mail"
        description={
          <>
            Si hay una cuenta con <strong>{enviado}</strong>, te mandamos un link para elegir una
            contraseña nueva. Abrilo en este mismo navegador.
          </>
        }
      >
        <AuthFooter question="¿Ya la recordaste?" href="/login" linkLabel="Iniciar sesión" />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      description="Te mandamos un link para elegir una contraseña nueva."
    >
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
        {turnstile.widget}
        <AuthSubmit
          pending={pending || turnstile.verifying}
          label="Mandar link"
          pendingLabel={pending ? "Enviando…" : "Verificando…"}
        />
      </form>
      <AuthFooter question="¿Ya la recordaste?" href="/login" linkLabel="Iniciar sesión" />
    </AuthCard>
  );
}
