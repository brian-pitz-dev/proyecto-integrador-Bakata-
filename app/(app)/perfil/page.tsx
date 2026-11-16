import type { Metadata } from "next";
import { getUserPlanContext } from "@/lib/user-plan";
import { getAuthedUser } from "@/lib/supabase/auth";
import { PerfilClient } from "@/components/perfil/perfil-client";
import { ObjetivoCard } from "@/components/perfil/objetivo-card";
import { leerEstadoPlanIa } from "@/lib/preferencias";

export const metadata: Metadata = {
  title: "Mi perfil · Bakata",
  description: "Tus datos, tus días de entrenamiento y tus eventos.",
  alternates: { canonical: "/perfil" },
};

export default async function PerfilPage() {
  const [ctx, user, { preferencias }] = await Promise.all([
    getUserPlanContext(),
    getAuthedUser(),
    leerEstadoPlanIa(),
  ]);
  if (!ctx || !user) return null; // proxy.ts ya redirige a /login u /onboarding antes de esto

  return (
    <PerfilClient
      nombre={user.nombre ?? ""}
      email={user.email ?? ""}
      perfil={ctx.profile}
      events={ctx.events}
      objetivo={
        <ObjetivoCard
          objetivo={preferencias.objetivo}
          zonas={preferencias.zonas}
          nivel={{
            nivelCardio: preferencias.nivelCardio,
            kmSemana: preferencias.kmSemana,
            nivelGym: preferencias.nivelGym,
          }}
        />
      }
    />
  );
}
