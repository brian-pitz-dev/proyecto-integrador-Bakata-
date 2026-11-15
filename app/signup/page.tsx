import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  title: "Crear cuenta · Bakata",
  description: "Registrate para armar tu propio plan de entrenamiento y nutrición.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
