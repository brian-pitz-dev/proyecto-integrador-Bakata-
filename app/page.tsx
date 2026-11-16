import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, TrendingUp, UtensilsCrossed } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Bakata",
  description: "Registro de ejercicio, dieta y calendario de entrenamiento.",
  alternates: { canonical: "/" },
  robots: { index: false, follow: false },
};

const PILARES = [
  {
    icon: CalendarDays,
    title: "Plan de gimnasio",
    text: "Calendario semanal que rota de fase sola, según tus propios eventos.",
  },
  {
    icon: UtensilsCrossed,
    title: "Nutrición",
    text: "Menú rotativo con objetivo de proteína diario, ajustado a cada fase.",
  },
  {
    icon: TrendingUp,
    title: "Progreso",
    text: "Seguimiento de tiradas, ritmo, peso y resultados de tus eventos.",
  },
];

const buttonBase =
  "grid w-full place-items-center rounded-[20px] border border-[#8d3fbd] p-3 text-base leading-none font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-[#8d3fbd]/40 focus-visible:outline-none";

// Misma pantalla que /login y /signup (AuthShell + AuthCard), con la bienvenida en la tarjeta.
export default function HomePage() {
  return (
    <AuthShell>
      <AuthCard title="Bienvenido a Bakata">
        <p className="mt-3 text-center text-base text-[#757575] dark:text-[#b3a3c7]">
          Tu plan de entrenamiento, nutrición y progreso hacia tus propios eventos.
        </p>

        <ul className="mt-9 grid gap-5">
          {PILARES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-[#f7e8fa] text-[#8d3fbd] dark:bg-[#24183a] dark:text-[#b98ae6]">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-base font-semibold text-[#1f1f1f] dark:text-[#f7e8fa]">
                  {title}
                </p>
                <p className="text-sm leading-snug text-[#757575] dark:text-[#b3a3c7]">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 grid gap-3">
          <Link
            href="/login"
            className={`${buttonBase} bg-[#8d3fbd] text-[#f7e8fa] hover:bg-[#7a33a6]`}
          >
            Ingresar
          </Link>
          <Link
            href="/signup"
            className={`${buttonBase} bg-transparent text-[#8d3fbd] hover:bg-[#f7e8fa] dark:border-[#b98ae6] dark:text-[#b98ae6] dark:hover:bg-[#24183a]`}
          >
            Crear cuenta
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
