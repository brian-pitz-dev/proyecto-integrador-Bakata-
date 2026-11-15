"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { toggleDayDone } from "@/app/registro/actions";
import {
  getSessionsForDate,
  getCurrentWeekNum,
  type Week,
  type UserEvent,
  type Session,
  type SessionTag,
} from "@/lib/training-plan";
import { toISO, fromISO, addDays, todayNormalized, formatShort, WEEKDAY_LABELS } from "@/lib/date";
import { cn } from "@/lib/utils";
import { HIGHLIGHT, SURFACE } from "@/lib/styles";
import { WeekSelector } from "@/components/week-selector/week-selector";
import { ExerciseBlock } from "@/components/calendar-grid/exercise-block";
import { CargasProvider } from "@/components/calendar-grid/cargas";
import type { Carga } from "@/lib/validation/carga";
import type { Routine } from "@/lib/gym-exercises";
import { LogDialog } from "@/components/log-form/registro-category-card";
import { SleepForm } from "@/components/log-form/sleep-form";
import { CalorieForm } from "@/components/log-form/calorie-form";
import { NumericLogForm } from "@/components/log-form/numeric-log-form";

// Franja de color por tipo de sesión: violeta = correr/cardio, azul = fuerza
const HERO_BUTTON =
  "rounded-full border-primary/25 bg-white px-3.5 text-primary hover:bg-primary/8 hover:text-primary dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white";

const TAG_STRIPE: Record<SessionTag, string> = {
  run: "border-run",
  long: "border-run",
  walk: "border-run",
  event: "border-run",
  luj: "border-run",
  gym: "border-gym",
  core: "border-gym",
  rest: "border-border",
};

function SessionList({
  sessions,
  routines,
  weekNum,
  fecha,
  inverse = false,
}: {
  sessions: Session[];
  /** Día (ISO) de estas sesiones. */
  fecha: string;
  routines?: Record<string, Routine>;
  /** Semana del plan, para la variante A/B/C de las rutinas compartidas. */
  weekNum?: number;
  /** Dentro de la tarjeta destacada de "Hoy" (lila en claro, violeta en oscuro). */
  inverse?: boolean;
}) {
  return (
    <div className="grid min-w-0 flex-1 gap-5">
      {sessions.map((s, i) => (
        <div
          key={i}
          className={cn(
            "min-w-0 rounded-r-md border-l-[3px] pl-3",
            inverse ? "border-primary/60 dark:border-white/60" : TAG_STRIPE[s.tag],
          )}
        >
          <p
            className={cn(
              "font-semibold break-words",
              inverse ? "text-foreground dark:text-white" : "text-foreground",
            )}
          >
            {s.label}
          </p>
          {s.detail && (
            <p
              className={cn(
                "text-sm break-words",
                inverse ? "text-muted-foreground dark:text-white/75" : "text-muted-foreground",
              )}
            >
              {s.detail}
            </p>
          )}
          <ExerciseBlock
            gymKey={s.gymKey}
            coreKey={s.coreKey}
            routines={routines}
            maxEjercicios={s.maxEjercicios}
            weekNum={weekNum}
            fecha={fecha}
            inverse={inverse}
          />
        </div>
      ))}
    </div>
  );
}

function DoneButton({
  isDone,
  disabled,
  onClick,
  inverse = false,
}: {
  isDone: boolean;
  disabled: boolean;
  onClick: () => void;
  inverse?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={isDone ? "Marcar como no completado" : "Marcar como completado"}
      aria-pressed={isDone}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center self-center rounded-full border-2 transition-colors disabled:opacity-40",
        isDone
          ? inverse
            ? "border-primary bg-primary text-primary-foreground dark:border-white dark:bg-white dark:text-primary"
            : "border-accent bg-accent text-accent-foreground"
          : inverse
            ? "border-primary/40 text-transparent hover:border-primary hover:text-primary/40 dark:border-white/50 dark:hover:border-white dark:hover:text-white/40"
            : "border-border text-transparent hover:border-primary/60 hover:text-primary/40",
      )}
    >
      <Check className="size-5" aria-hidden="true" />
    </button>
  );
}

export function CalendarGrid({
  completedDates,
  weeks,
  events,
  routines,
  cargas = [],
}: {
  completedDates: string[];
  /** Pesos anotados por ejercicio (sobrecarga progresiva). */
  cargas?: Carga[];
  weeks: Week[];
  events: UserEvent[];
  /** Rutinas de gym generadas por IA (plan_ia); pisan a las compartidas por gymKey. */
  routines?: Record<string, Routine>;
}) {
  const todayNorm = todayNormalized();
  // el domingo ya interesa la semana que arranca
  const [selectedWeek, setSelectedWeek] = useState(() =>
    getCurrentWeekNum(weeks, todayNorm.getDay() === 0 ? addDays(todayNorm, 1) : todayNorm),
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
    <CargasProvider initial={cargas}>
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

          <div className="relative flex flex-wrap gap-2">
            <LogDialog title="Sueño" buttonLabel="Sueño" triggerClassName={HERO_BUTTON}>
              <SleepForm />
            </LogDialog>
            <LogDialog title="Calorías" buttonLabel="Calorías" triggerClassName={HERO_BUTTON}>
              <CalorieForm />
            </LogDialog>
            <LogDialog title="Peso" buttonLabel="Peso" triggerClassName={HERO_BUTTON}>
              <NumericLogForm
                categoria="peso"
                fieldLabel="Peso (kg)"
                step="0.1"
                successMessage="Peso guardado"
              />
            </LogDialog>
          </div>
        </section>

        <section className="grid gap-7">
          <WeekSelector weeks={weeks} selectedWeek={selectedWeek} onSelectWeek={setSelectedWeek} />

          <div>
            <h2 className="text-2xl font-semibold">{weekObj.phaseLabel}</h2>
            <p className="text-sm text-muted-foreground">
              Semana {weekObj.num}, del {weekStart.getDate()} al{" "}
              {formatShort(addDays(weekStart, 6))}
            </p>
          </div>

          <div className="grid gap-4">
            {days.map((date, i) => {
              const iso = toISO(date);
              const sessions = getSessionsForDate(weeks, events, date);
              const dayLabel = WEEKDAY_LABELS[i].slice(0, 3);

              if (sessions.every((s) => s.tag === "rest")) {
                return (
                  <div
                    key={iso}
                    className="flex items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-4 text-sm text-muted-foreground"
                  >
                    <span className="w-14 shrink-0 text-center tabular-nums">
                      {dayLabel} {date.getDate()}
                    </span>
                    <span>{sessions[0].label}</span>
                  </div>
                );
              }

              const isDone = completed.has(iso);
              return (
                <div
                  key={iso}
                  className={cn(
                    SURFACE,
                    "flex items-start gap-4 p-4 transition-colors sm:gap-5 sm:p-6",
                    isDone ? "bg-accent/10 ring-accent/50" : "ring-foreground/5 dark:ring-white/10",
                    iso === todayISO && !isDone && "ring-2 ring-primary",
                  )}
                >
                  <div
                    className={cn(
                      "grid w-12 shrink-0 place-items-center rounded-2xl py-2 text-center",
                      iso === todayISO ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <p
                      className={cn(
                        "text-xs",
                        iso === todayISO ? "text-primary-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      {dayLabel}
                    </p>
                    <p className="font-heading text-2xl leading-tight font-semibold tabular-nums">
                      {date.getDate()}
                    </p>
                  </div>
                  <SessionList
                    sessions={sessions}
                    fecha={iso}
                    routines={routines}
                    weekNum={weekObj.num}
                  />
                  <DoneButton
                    isDone={isDone}
                    disabled={date > todayNorm || isPending}
                    onClick={() => handleToggle(date)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </CargasProvider>
  );
}
