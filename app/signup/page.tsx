import type { Metadata } from "next";
import Link from "next/link";
import { RegistroWizard } from "@/components/registro/registro-wizard";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Crear cuenta · Bakata",
  description: "Registrate para armar tu propio plan de entrenamiento y nutrición.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <AuthShell>
      <div className="grid w-full max-w-[640px] gap-5">
        <RegistroWizard mode="signup" />
        <p className="text-center text-base text-[#1f1f1f] dark:text-[#ddd0ea]">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-[#9f61d5] hover:underline dark:text-[#b98ae6]">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
