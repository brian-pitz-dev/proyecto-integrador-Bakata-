import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthNotice } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · Bakata",
  description: "Iniciá sesión en Bakata.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; confirmada?: string; borrada?: string; email?: string }>;
}) {
  const { error, confirmada, borrada, email } = await searchParams;

  const notice =
    error === "confirmacion" ? (
      <AuthNotice tone="error">
        El link de confirmación venció o ya se usó. Si ya confirmaste tu cuenta, iniciá sesión
        normalmente.
      </AuthNotice>
    ) : confirmada ? (
      <AuthNotice>Tu email quedó confirmado. Iniciá sesión para entrar a tu plan.</AuthNotice>
    ) : email === "ok" ? (
      <AuthNotice>Listo, tu email cambió. Iniciá sesión con el email nuevo.</AuthNotice>
    ) : email === "falta-otro" ? (
      <AuthNotice>
        Falta un paso: abrí también el link que te mandamos al otro email. Hasta entonces, seguís
        entrando con el de antes.
      </AuthNotice>
    ) : borrada ? (
      <AuthNotice>Tu cuenta y todos tus datos se borraron.</AuthNotice>
    ) : null;

  return (
    <AuthShell>
      <LoginForm notice={notice} />
    </AuthShell>
  );
}
