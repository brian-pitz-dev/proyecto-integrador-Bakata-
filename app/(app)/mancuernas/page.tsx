import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  dayKeyOf,
  dowKeys,
  getCurrentWeekNum,
  getStrengthSlots,
  slotHref,
  slotTitle,
  type DayKey,
  type StrengthSlot,
} from "@/lib/training-plan";
import { getPersonalCoreRoutine, getPersonalRotation, getPersonalRoutine } from "@/lib/personalize";
import { routineRotates } from "@/lib/gym-exercises";
import { RefreshCw } from "lucide-react";
import { todayNormalized } from "@/lib/date";
import { getUserPlanContext } from "@/lib/user-plan";
import { PageHeader } from "@/components/page-header";
import { RoutineDetail } from "@/components/routine/routine-detail";
import { SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mancuernas · Bakata",
  description: "Tus rutinas completas, día por día, según tu plan.",
  alternates: { canonical: "/mancuernas" },
};

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function MancuernasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, planContext] = await Promise.all([searchParams, getUserPlanContext()]);

  const today = todayNormalized();
  let weekNum: number | null = null;
  let slots: StrengthSlot[] = [];
  let selectedDay: DayKey | undefined;

  if (planContext) {
    const { weeks } = planContext;
    const currentWeek = getCurrentWeekNum(weeks, today);
    const requestedWeek = Number(first(params.semana));
    const week =
      weeks.find((w) => w.num === requestedWeek) ?? weeks.find((w) => w.num === currentWeek);
    if (week) {
      weekNum = week.num;
      slots = getStrengthSlots(week);
      const dia = first(params.dia);
      // sin selección: hoy, si es día de fuerza
      const candidate = dia ?? (week.num === currentWeek ? dayKeyOf(today) : undefined);
      selectedDay = slots.find((sl) => sl.day === candidate)?.day;
    }
  }

  // Un botón y una card por día: todo lo que se hace ese día (gym + core) va junto.
  const days = dowKeys.filter((d) => slots.some((sl) => sl.day === d));
  const daySlots = (day: DayKey) =>
    slots
      .filter((sl) => sl.day === day)
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "gym" ? -1 : 1));
  const selectedSlots = selectedDay ? daySlots(selectedDay) : [];
  const routines =
    planContext && weekNum !== null
      ? selectedSlots.flatMap((sl) => {
          const routine =
            sl.kind === "gym"
              ? getPersonalRoutine(sl.key, weekNum, planContext.training)
              : getPersonalCoreRoutine(sl.key, planContext.training);
          return routine ? [{ slot: sl, routine }] : [];
        })
      : [];

  const rotation =
    planContext &&
    weekNum !== null &&
    selectedSlots.some((sl) => sl.kind === "gym" && routineRotates(sl.key))
      ? getPersonalRotation(weekNum, planContext.training)
      : null;

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-12">
      <PageHeader
        title="Mancuernas"
        description="Tus rutinas completas, día por día, según tu plan."
      />

      {weekNum !== null && slots.length > 0 && (
        <section className="grid gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Tu plan · semana {weekNum}</h2>
              <p className="text-sm text-muted-foreground">
                Elegí una sesión para ver todo lo que te toca.
              </p>
            </div>
            <Link
              href="/calendario"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline dark:text-[#d6b8f2]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> Volver al calendario
            </Link>
          </div>

          <nav aria-label="Días de fuerza de la semana" className="flex flex-wrap gap-2">
            {days.map((day) => {
              const active = day === selectedDay;
              const parts = daySlots(day);
              return (
                <Link
                  key={day}
                  href={
                    active
                      ? `/mancuernas?semana=${weekNum}&dia=ninguno` // segundo toque: deseleccionar
                      : slotHref(weekNum as number, parts[0])
                  }
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-2xl border px-4 py-2.5 text-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <span className="font-semibold">
                    {parts
                      .map((sl) => `${sl.group}${sl.total > 1 ? ` ${sl.ordinal}/${sl.total}` : ""}`)
                      .join(" + ")}
                  </span>
                </Link>
              );
            })}
          </nav>

          {selectedDay && routines.length > 0 ? (
            <div className={cn(SURFACE, "grid p-6")}>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase dark:text-[#d6b8f2]">
                Semana {weekNum}
                {rotation &&
                  ` · Rutina ${rotation.variant} (semanas ${rotation.blockStart}-${rotation.blockEnd})`}
              </p>
              {rotation?.isNewBlock && (
                <p className="mt-3 flex gap-2 rounded-2xl bg-primary/10 p-4 text-sm dark:bg-primary/15">
                  <RefreshCw
                    className="mt-0.5 size-4 shrink-0 text-primary dark:text-[#d6b8f2]"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-semibold">Rutina nueva.</span> Pasaron{" "}
                    {rotation.blockEnd - rotation.blockStart + 1} semanas con la anterior: cambiamos
                    ejercicios y ángulos para que el cuerpo no se acostumbre. La primera semana usá
                    pesos más livianos hasta dominar la técnica.
                  </span>
                </p>
              )}
              {routines.map(({ slot, routine }, i) => (
                <RoutineDetail
                  key={`${slot.kind}-${slot.key}`}
                  routine={routine}
                  title={slotTitle(slot)}
                  className={cn(i > 0 && "mt-8 border-t border-border pt-8")}
                />
              ))}
            </div>
          ) : (
            <p className={cn(SURFACE, "p-6 text-sm text-muted-foreground")}>
              {first(params.dia)
                ? "Elegí una sesión de arriba para ver sus rutinas."
                : "Hoy no tenés fuerza en el plan. Elegí una sesión de arriba para ver sus rutinas."}
            </p>
          )}
        </section>
      )}

      <p className="text-sm text-muted-foreground">
        Si sentís dolor (no cansancio), pará. Sin mancuernas sirven una mochila, un bidón o botellas
        con agua.
      </p>
    </div>
  );
}
