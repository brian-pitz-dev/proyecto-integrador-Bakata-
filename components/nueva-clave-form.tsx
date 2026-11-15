"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AuthCard, AuthField, AuthSubmit } from "@/components/auth/auth-card";
import { cambiarClave } from "@/app/nueva-clave/actions";

export function NuevaClaveForm({ email }: { email: string }) {
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const result = await cambiarClave({
      password: String(formData.get("password") ?? ""),
      passwordConfirm: String(formData.get("passwordConfirm") ?? ""),
    });
    // Si salió bien, la acción ya redirigió: solo se maneja el error.
    if (result && !result.ok) {
      setPending(false);
      toast.error(result.message ?? "No se pudo cambiar la contraseña.");
    }
  }

  return (
    <AuthCard
      title="Contraseña nueva"
      description={`Para ${email}. Al menos 8 caracteres, con una letra y un número.`}
    >
      <form className="mt-10 grid gap-8" onSubmit={handleSubmit}>
        {/* el gestor de contraseñas asocia la nueva a esta cuenta */}
        <input type="hidden" name="username" autoComplete="username" value={email} />
        <AuthField
          id="password"
          label="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          required
        />
        <AuthField
          id="passwordConfirm"
          label="Repetila"
          type="password"
          autoComplete="new-password"
          required
        />
        <AuthSubmit pending={pending} label="Guardar y entrar" pendingLabel="Guardando…" />
      </form>
    </AuthCard>
  );
}
