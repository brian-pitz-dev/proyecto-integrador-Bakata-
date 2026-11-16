import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanContext } from "@/lib/user-plan";
import { addDays, fromISO, toISO, todayNormalized } from "@/lib/date";
import { resumenSemanal } from "@/lib/stats-summary";
import type { Registro } from "@/lib/types";
import { AI_DAILY_LIMIT } from "@/lib/coach";
import { CoachClient } from "@/components/coach/coach-client";
import { leerEstadoPlanIa, usosVisiblesHoy } from "@/lib/preferencias";
import { estadoMes, inicioDelMes } from "@/lib/plan-ia";

export const metadata: Metadata = {
  title: "Coach · Bakata",
  description: "Coach con IA: consultas sobre tu plan y planes de comidas y gym a tu medida.",
  alternates: { canonical: "/coach" },
};

export default async function CoachPage() {
  const planContext = await getUserPlanContext();
  if (!planContext) return null; // proxy.ts ya redirige a /onboarding antes de esto

  const supabase = await createClient();
  const { preferencias } = await leerEstadoPlanIa(supabase);
  const hoy = todayNormalized();
  const [
    usosHoy,
    { data: perfil },
    { data: ultimoEvento },
    { data: registros },
    { data: ultimoPeso },
  ] = await Promise.all([
    usosVisiblesHoy(supabase),
    supabase.from("perfil").select("updated_at").maybeSingle(),
    supabase
      .from("evento")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // dos semanas: cubre desde el lunes y el peso de hace 7 días
    supabase
      .from("registro")
      .select("*")
      .gte("fecha", toISO(addDays(hoy, -14)))
      .order("fecha", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("registro")
      .select("valor")
      .eq("categoria", "peso")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // shortcut: borrar un evento no deja rastro y no marca el plan de la IA como viejo;
  // si hace falta, guardar la fecha del último cambio en perfil y comparar contra eso.
  const lastChange = [perfil?.updated_at, ultimoEvento?.updated_at]
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);
  const isStale = (updatedAt?: string) => !!updatedAt && !!lastChange && updatedAt < lastChange;
  const { planIa, profile, events, weeks } = planContext;
  const regs = (registros as Registro[] | null) ?? [];
  const corre = !preferencias.objetivo || preferencias.objetivo === "evento" || events.length > 0;
  const resumen = resumenSemanal({
    weeks,
    events,
    planStart: fromISO(profile.planStart),
    completedDates: new Set(regs.filter((r) => r.categoria === "completado").map((r) => r.fecha)),
    registros: regs,
    pesoActual: ultimoPeso ? Number(ultimoPeso.valor) : null,
    metaPesoKg: profile.metaPesoKg ?? null,
    hoy,
    // sin carrera ni caminata (objetivo músculo / bajar), el resumen no reclama kilómetros
    corre: corre,
  });

  return (
    <CoachClient
      resumen={resumen}
      usosHoy={usosHoy}
      limite={AI_DAILY_LIMIT}
      tieneRutinas={!!planIa.ejercicios}
      rutinasDesactualizadas={isStale(planIa.ejerciciosUpdatedAt)}
      preferencias={{ equipo: preferencias.equipo, zonas: preferencias.zonas }}
      corre={corre}
      mes={
        preferencias.objetivo === "musculo" || preferencias.objetivo === "bajar"
          ? estadoMes(
              inicioDelMes(preferencias.cicloInicio, planIa.ejerciciosUpdatedAt, profile.planStart),
              toISO(hoy),
            )
          : null
      }
    />
  );
}
