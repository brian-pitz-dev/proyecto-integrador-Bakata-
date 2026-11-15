import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthNotice } from "@/components/auth/auth-card";
import { RecuperarForm } from "@/components/recuperar-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña · Bakata",
  description: "Elegí una contraseña nueva para tu cuenta de Bakata.",
  robots: { index: false, follow: false },
};

export default async function RecuperarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <RecuperarForm
        notice={
          error === "link" ? (
            <AuthNotice tone="error">
              El link venció, ya se usó o se abrió en otro navegador. Pedí uno nuevo.
            </AuthNotice>
          ) : null
        }
      />
    </AuthShell>
  );
}
