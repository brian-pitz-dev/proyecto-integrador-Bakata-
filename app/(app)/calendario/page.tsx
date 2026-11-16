import type { Metadata } from "next";
import { CalendarGrid } from "@/components/calendar-grid/calendar-grid";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanContext } from "@/lib/user-plan";
import { getAuthedUser } from "@/lib/supabase/auth";
import { leerEstadoPlanIa } from "@/lib/preferencias";
import { estadoMes, finDelMes, inicioDelMes } from "@/lib/plan-ia";
import { NuevoMes } from "@/components/nuevo-mes";
import { guiaEvento, reglasPara } from "@/lib/plan-content";
import { EventosResumen } from "@/components/eventos-resumen";
import { addDays, fromISO, toISO, todayNormalized } from "@/lib/date";
import { CATEGORIA_CARGA, type Carga } from "@/lib/validation/carga";
import { HeartPulse } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Calendario · Bakata",
  description: "Plan de entrenamiento semana a semana: sesiones, fases y eventos.",
  alternates: { canonical: "/calendario" },
};

/** Pesos anotados por ejercicio en el último año (sobrecarga progresiva). */
async function fetchCargas(): Promise<Carga[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("registro")
    .select("fecha, valor, nota")
    .eq("categoria", CATEGORIA_CARGA)
    .gte("fecha", toISO(addDays(todayNormalized(), -365)))
    .order("fecha", { ascending: false })
    // si quedaron dos del mismo día (saveCarga no pudo borrar la vieja), gana la última cargada
    .order("created_at", { ascending: false })
    .limit(1000);
  return (data ?? [])
    .filter((r) => r.nota)
    .map((r) => ({ fecha: r.fecha as string, ejercicio: r.nota as string, kg: Number(r.valor) }));
}

/** Equivalente a getCompletedDates() de plan_vida_2026.html. */
async function fetchCompletedDates(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("registro").select("fecha").eq("categoria", "completado");
  return (data ?? []).map((r) => r.fecha as string);
}

export default async function CalendarioPage() {
  const [completedDates, cargas, planContext, user, { preferencias }] = await Promise.all([
    fetchCompletedDates(),
    fetchCargas(),
    getUserPlanContext(),
    getAuthedUser(),
    leerEstadoPlanIa(),
  ]);

  if (!planContext) return null; // proxy.ts ya redirige a /onboarding antes de esto

  // La guía es del próximo evento del usuario (los eventos ya vienen ordenados por fecha).
  const hoy = toISO(todayNormalized());
  const proximo = planContext.events.find((e) => e.fecha >= hoy);
  const guia = proximo ? guiaEvento(proximo) : null;
  // objetivo músculo / bajar: rutinas por meses de 4 semanas
  const porMeses = preferencias.objetivo === "musculo" || preferencias.objetivo === "bajar";
  const inicioMes = porMeses
    ? inicioDelMes(
        preferencias.cicloInicio,
        planContext.planIa.ejerciciosUpdatedAt,
        planContext.profile.planStart,
      )
    : undefined;
  const mesTerminado = !!estadoMes(inicioMes, hoy)?.terminado;
  const reglas = reglasPara({
    objetivo: preferencias.objetivo,
    nivelCardio: preferencias.nivelCardio,
    diasAlEvento: proximo
      ? Math.round((fromISO(proximo.fecha).getTime() - todayNormalized().getTime()) / 86_400_000)
      : null,
    tipoEvento: proximo?.tipo,
  });

  return (
    <div className="grid gap-14">
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader
          title="Calendario"
          description={
            user?.nombre
              ? `Hola, ${user.nombre}. Tu plan de la semana, día por día.`
              : "Tu plan de la semana, día por día."
          }
        />
      </div>
      {mesTerminado &&
        (preferencias.objetivo === "musculo" || preferencias.objetivo === "bajar") && (
          <NuevoMes
            objetivo={preferencias.objetivo}
            zonas={preferencias.zonas}
            metaPesoKg={planContext.profile.metaPesoKg}
          />
        )}
      {(planContext.events.length > 0 ||
        preferencias.objetivo === "evento" ||
        !preferencias.objetivo) && <EventosResumen events={planContext.events} />}
      {planContext.retome && (
        <p
          role="status"
          className="mx-auto flex w-full max-w-4xl items-start gap-2 rounded-[20px] bg-accent/10 p-5 text-sm ring-1 ring-accent/40"
        >
          <HeartPulse className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
          <span>
            <strong>Semana de retome.</strong> La semana pasada entrenaste{" "}
            {planContext.retome.hechos} de {planContext.retome.entrenables} días, así que esta
            semana las sesiones son más cortas para volver de a poco. La que viene vuelve a la
            normalidad si cumplís al menos la mitad.
          </span>
        </p>
      )}
      <CalendarGrid
        completedDates={completedDates}
        weeks={planContext.weeks}
        events={planContext.events}
        routines={planContext.planIa.ejercicios}
        cargas={cargas}
        nivelGym={preferencias.nivelGym}
        movimientos={planContext.movimientos}
        finMes={inicioMes ? finDelMes(inicioMes) : undefined}
      />

      <div className="mx-auto grid w-full max-w-4xl gap-4">
        {guia && (
          <details className={cn(SURFACE, "p-6")}>
            <summary className="cursor-pointer font-heading text-lg font-semibold">
              Guía para el día: {guia.title}
            </summary>
            <p className="mt-1 text-sm text-muted-foreground">{guia.dateLabel}</p>
            <div className="mt-3 grid max-w-prose gap-2 text-sm">
              {guia.paragraphs.map((p) => (
                <p key={p.label}>
                  <strong>{p.label}:</strong> {p.text}
                </p>
              ))}
            </div>
          </details>
        )}

        <details className={cn(SURFACE, "p-6")}>
          <summary className="cursor-pointer font-heading text-lg font-semibold">
            Reglas del plan
          </summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {reglas.map((card) => (
              <div key={card.title}>
                <h3 className="font-semibold">{card.title}</h3>
                <ul className="mt-1 grid list-disc gap-1 pl-4 text-sm text-muted-foreground">
                  {card.rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
