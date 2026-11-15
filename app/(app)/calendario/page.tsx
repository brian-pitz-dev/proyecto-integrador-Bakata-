import type { Metadata } from "next";
import { CalendarGrid } from "@/components/calendar-grid/calendar-grid";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanContext } from "@/lib/user-plan";
import { RULE_CARDS, buildEventGuide } from "@/lib/plan-content";
import { fromISO, todayNormalized } from "@/lib/date";
import { PageHeader } from "@/components/page-header";
import { TrainingPrefsDialog } from "@/components/training/training-prefs-dialog";
import { SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Calendario · Bakata",
  description: "Plan de entrenamiento semana a semana: sesiones, fases y eventos.",
  alternates: { canonical: "/calendario" },
};

/** Equivalente a getCompletedDates() de plan_vida_2026.html. */
async function fetchCompletedDates(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("registro").select("fecha").eq("categoria", "completado");
  return (data ?? []).map((r) => r.fecha as string);
}

export default async function CalendarioPage() {
  const [completedDates, planContext] = await Promise.all([
    fetchCompletedDates(),
    getUserPlanContext(),
  ]);

  if (!planContext) return null; // proxy.ts ya redirige a /onboarding antes de esto

  const today = todayNormalized();
  const eventGuides = planContext.events
    .filter((e) => fromISO(e.fecha) >= today)
    .map(buildEventGuide);

  return (
    <div className="grid gap-14">
      <div className="mx-auto w-full max-w-4xl">
        <div className="grid gap-5">
          <PageHeader title="Calendario" description="Tu plan de la semana, día por día." />
          <TrainingPrefsDialog training={planContext.training} />
        </div>
      </div>
      <CalendarGrid
        completedDates={completedDates}
        weeks={planContext.weeks}
        events={planContext.events}
        training={planContext.training}
      />

      <div className="mx-auto grid w-full max-w-4xl gap-4">
        {eventGuides.map((event) => (
          <details key={`${event.title}-${event.dateLabel}`} className={cn(SURFACE, "p-6")}>
            <summary className="cursor-pointer font-heading text-lg font-semibold">
              Guía: {event.title}
            </summary>
            <p className="mt-1 text-sm text-muted-foreground">{event.dateLabel}</p>
            <div className="mt-3 grid max-w-prose gap-2 text-sm">
              {event.paragraphs.map((p) => (
                <p key={p.label}>
                  <strong>{p.label}:</strong> {p.text}
                </p>
              ))}
            </div>
          </details>
        ))}

        <details className={cn(SURFACE, "p-6")}>
          <summary className="cursor-pointer font-heading text-lg font-semibold">
            Reglas del plan
          </summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {RULE_CARDS.map((card) => (
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
