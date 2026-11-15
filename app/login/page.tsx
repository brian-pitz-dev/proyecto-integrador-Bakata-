import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión · Bakata",
  description: "Acceso privado para el dueño de la app.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
