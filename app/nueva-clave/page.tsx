import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/supabase/auth";
import { NuevaClaveForm } from "@/components/nueva-clave-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Contraseña nueva · Bakata",
  description: "Elegí una contraseña nueva para tu cuenta de Bakata.",
  robots: { index: false, follow: false },
};

/** Destino del link de recuperación: /auth/confirm ya dejó la sesión iniciada. */
export default async function NuevaClavePage() {
  const user = await getAuthedUser();
  if (!user) redirect("/recuperar?error=link");

  return (
    <AuthShell>
      <NuevaClaveForm email={user.email ?? ""} />
    </AuthShell>
  );
}
