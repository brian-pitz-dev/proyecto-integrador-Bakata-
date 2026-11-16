"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleDayDone } from "@/app/registro/actions";
import {
  getSessionsForDate,
  getCurrentWeekNum,
  type Week,
  type UserEvent,
} from "@/lib/training-plan";
import { toISO, fromISO, addDays, todayNormalized, formatShort, WEEKDAY_LABELS } from "@/lib/date";
import { cn } from "@/lib/utils";
import { AVISO, HIGHLIGHT } from "@/lib/styles";
import { WeekSelector } from "@/components/week-selector/week-selector";
import { CargasProvider } from "@/components/calendar-grid/cargas";
import { SemanaMovida } from "@/components/calendar-grid/semana-movida";
import type { Movimiento } from "@/lib/mover";
import type { Carga } from "@/lib/validation/carga";
import type { NivelGym, Routine } from "@/lib/gym-exercises";
import { SessionList } from "@/components/calendar-grid/session-list";
import { DoneButton } from "@/components/calendar-grid/done-button";
import { DiaCard } from "@/components/calendar-grid/dia-card";
import { RegistrosRapidos } from "@/components/calendar-grid/registros-rapidos";

export function CalendarGrid({
  completedDates,
  weeks,
  events,
  routines,
  cargas = [],
  nivelGym,
  movimientos = [],
  finMes,
}: {
  completedDates: string[];
  /** Pesos anotados por ejercicio (sobrecarga progresiva). */
  cargas?: Carga[];
  /** Nivel de gym (preferencias): ajusta las series de las rutinas base. */
  nivelGym?: NivelGym;
  /** Días que movió la persona (ya aplicados en `weeks`): para ofrecer deshacerlos. */
  movimientos?: Movimiento[];
  /** Objetivo músculo / bajar: primer día después del mes de rutinas actual. */
  finMes?: string;
  weeks: Week[];
  events: UserEvent[];
  /** Rutinas de gym generadas por IA (plan_ia); pisan a las compartidas por gymKey. */
  routines?: Record<string, Routine>;
}) {
  const todayNorm = todayNormalized();
  // el domingo ya interesa la semana que arranca
  // Objetivo músculo / bajar: solo se muestran las semanas del mes de rutinas actual (y la de hoy);
  // las siguientes todavía no existen: se arman al terminar el mes, con rutinas nuevas.
  const todayISOInicial = toISO(todayNorm);
  const semanasVisibles = finMes
    ? weeks.filter((w) => w.start < finMes || w.start <= todayISOInicial)
    : weeks;
  const ultimaVisible = semanasVisibles.at(-1) ?? weeks[0];
  const [selectedWeek, setSelectedWeek] = useState(() =>
    Math.min(
      getCurrentWeekNum(weeks, todayNorm.getDay() === 0 ? addDays(todayNorm, 1) : todayNorm),
      ultimaVisible.num,
    ),
  );
  const [completed, setCompleted] = useState(new Set(completedDates));
  const [isPending, startTransition] = useTransition();

  const weekObj = weeks.find((w) => w.num === selectedWeek) ?? weeks[0];
  const weekStart = fromISO(weekObj.start);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todayISO = toISO(todayNorm);
  const todaySessions = getSessionsForDate(weeks, events, todayNorm);

  function handleToggle(date: Date) {
    if (date > todayNorm) return; // no se puede marcar un día futuro
    const iso = toISO(date);
    const isDone = !completed.has(iso);

    const next = new Set(completed);
    if (isDone) next.add(iso);
    else next.delete(iso);
    setCompleted(next);

    startTransition(async () => {
      const result = await toggleDayDone(iso, isDone);
      if (!result.ok) {
        toast.error(result.message ?? "No se pudo actualizar el día.");
        setCompleted(completed); // revertir
      }
    });
  }

  return (
    <CargasProvider initial={cargas} nivelGym={nivelGym}>
      <div className="mx-auto grid w-full max-w-4xl gap-14">
        <section
          className={cn(HIGHLIGHT, "relative grid gap-6 overflow-hidden rounded-[25px] p-6 sm:p-8")}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 size-64 rounded-full bg-primary/10 blur-3xl dark:bg-white/10"
          />
          {/* cuánto falta para el próximo evento ya lo muestra EventosResumen arriba */}
          <div className="relative">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase dark:text-white/70">
              Hoy
            </p>
            <h2 className="text-3xl font-semibold text-foreground first-letter:uppercase dark:text-white">
              {WEEKDAY_LABELS[(todayNorm.getDay() + 6) % 7].toLowerCase()} {formatShort(todayNorm)}
            </h2>
          </div>

          <div className="relative flex items-start gap-5 rounded-2xl bg-white p-5 ring-1 ring-primary/10 sm:p-6 dark:bg-white/10 dark:ring-0">
            <SessionList
              sessions={todaySessions}
              fecha={todayISO}
              routines={routines}
              weekNum={getCurrentWeekNum(weeks, todayNorm)}
              inverse
            />
            {todaySessions.some((s) => s.tag !== "rest") && (
              <DoneButton
                isDone={completed.has(todayISO)}
                disabled={isPending}
                onClick={() => handleToggle(todayNorm)}
                inverse
              />
            )}
          </div>

          <RegistrosRapidos />
        </section>

        <section className="grid gap-7">
          <WeekSelector
            weeks={semanasVisibles}
            selectedWeek={selectedWeek}
            onSelectWeek={setSelectedWeek}
          />

          <div>
            <h2 className="text-2xl font-semibold">{weekObj.phaseLabel}</h2>
            <p className="text-sm text-muted-foreground">
              Semana {weekObj.num}, del {weekStart.getDate()} al{" "}
              {formatShort(addDays(weekStart, 6))}
            </p>
          </div>

          <SemanaMovida lunes={toISO(weekStart)} movimientos={movimientos} />

          <div className="grid gap-4">
            {days.map((date, i) => {
              const iso = toISO(date);
              const sessions = getSessionsForDate(weeks, events, date);
              const dayLabel = WEEKDAY_LABELS[i].slice(0, 3);

              return (
                <DiaCard
                  key={iso}
                  fecha={iso}
                  dayLabel={dayLabel}
                  sessions={sessions}
                  routines={routines}
                  weekNum={weekObj.num}
                  isDone={completed.has(iso)}
                  hoy={todayISO}
                  disabled={date > todayNorm || isPending}
                  onToggle={() => handleToggle(date)}
                  mover={{ lunes: toISO(weekStart), weeks, events }}
                />
              );
            })}
          </div>

          {finMes && weekObj.num === ultimaVisible.num && (
            <p className={AVISO}>
              Esta es la última semana de tu mes de rutinas. Cuando la termines, elegís tu objetivo
              otra vez y armamos el mes que viene con rutinas nuevas, distintas a estas.
            </p>
          )}
        </section>
      </div>
    </CargasProvider>
  );
}
