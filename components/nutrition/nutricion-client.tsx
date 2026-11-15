"use client";

import { useEffect, useState, type ReactNode } from "react";
import { addDays, fromISO, toISO, todayNormalized, WEEKDAY_LABELS } from "@/lib/date";
import { getCurrentWeekNum, getCarbLoadWeeks, type Week } from "@/lib/training-plan";
import { cn } from "@/lib/utils";
import {
  getMealsForDay,
  hcObjetivo,
  PROTEINA_G_POR_KG,
  TIPO_DIA_LABEL,
  type MealBank,
} from "@/lib/meal-plan";
import { getCalorieTargetForDate, type CalorieTargetDelDia } from "@/app/(app)/nutricion/actions";
import { WeekSelector } from "@/components/week-selector/week-selector";
import { MealCard } from "@/components/nutrition/meal-card";
import { FixedRules } from "@/components/nutrition/fixed-rules";
import { PageHeader } from "@/components/page-header";
import { HIGHLIGHT, SURFACE } from "@/lib/styles";

function currentDayIdx(today: Date): number {
  const jsDay = today.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function NutricionClient({
  weeks,
  mealBank,
  planIa,
}: {
  weeks: Week[];
  mealBank?: MealBank;
  /** Tarjeta para armar comidas con IA (se arma en el server con la cuota del día). */
  planIa?: ReactNode;
}) {
  const today = todayNormalized();
  const start = today;

  const [week, setWeek] = useState(() => getCurrentWeekNum(weeks, start));
  const [day, setDay] = useState(() => currentDayIdx(start));
  const [calorieTarget, setCalorieTarget] = useState<CalorieTargetDelDia | null>(null);

  const carbLoadWeeks = getCarbLoadWeeks(weeks);
  const dayPlan = getMealsForDay(week, day, carbLoadWeeks, {
    bank: mealBank,
    metaKcal: calorieTarget?.meta,
    pesoKg: calorieTarget?.pesoKg,
    tipoDia: calorieTarget?.tipoDia,
  });
  // el plan de IA no se ajusta, pero el objetivo de hidratos de la persona se muestra igual
  const hcMeta =
    dayPlan.hcObjetivoG ??
    (calorieTarget
      ? hcObjetivo(calorieTarget.pesoKg, calorieTarget.tipoDia, calorieTarget.meta)
      : null);
  const weekObj = weeks.find((w) => w.num === week) ?? weeks[0];
  const weekStart = fromISO(weekObj.start);

  function handleSelectWeek(weekNum: number) {
    setWeek(weekNum);
    setDay(0); // siempre arranca en lunes al cambiar de semana
  }

  useEffect(() => {
    const weekObj = weeks.find((w) => w.num === week);
    if (!weekObj) return;
    const dateISO = toISO(addDays(fromISO(weekObj.start), day));
    let cancelled = false;
    getCalorieTargetForDate(dateISO).then((target) => {
      if (!cancelled) setCalorieTarget(target);
    });
    return () => {
      cancelled = true;
    };
  }, [week, day, weeks]);

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-10">
      <PageHeader
        title="Nutrición"
        description="Tus comidas de toda la semana con el método del plato; el fin de semana, más flexible. El menú rota cada semana."
      />

      {planIa}

      <WeekSelector weeks={weeks} selectedWeek={week} onSelectWeek={handleSelectWeek} />

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAY_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setDay(i)}
            aria-pressed={day === i}
            className={cn(
              "rounded-2xl border py-2 text-center text-sm transition-colors",
              day === i
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              i >= 5 && day !== i && "border-dashed opacity-70",
            )}
          >
            <span className="block text-xs">{label.slice(0, 3)}</span>
            <span className="font-heading text-lg tabular-nums">
              {addDays(weekStart, i).getDate()}
            </span>
          </button>
        ))}
      </div>

      {!dayPlan.isWeekday && (
        <div className="rounded-[20px] border border-dashed border-border p-5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Fin de semana: más flexible.</span> Es una
          guía, no una regla: podés cambiar platos, comer afuera o darte un gusto. Tratá de llegar a
          la proteína del día. Antes de una carrera larga o una caminata, seguí la guía de carga de
          hidratos del Calendario.
        </div>
      )}
      <div className="grid gap-4">
        <div className="mb-2 grid gap-4">
          <div className={cn(HIGHLIGHT, "rounded-[20px] p-6")}>
            <p className="text-sm font-semibold text-primary dark:text-white/80">Tu día</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 tabular-nums sm:grid-cols-4">
              <MacroDia
                label="Proteína"
                value={`${Math.round(dayPlan.totalProteinG)} g`}
                sub={
                  calorieTarget
                    ? `objetivo ${Math.round(calorieTarget.pesoKg * PROTEINA_G_POR_KG)} g`
                    : undefined
                }
              />
              <MacroDia
                label="Hidratos"
                value={dayPlan.totalHcG === null ? "—" : `${Math.round(dayPlan.totalHcG)} g`}
                sub={
                  hcMeta !== null && calorieTarget
                    ? `objetivo ${hcMeta} g · ${TIPO_DIA_LABEL[calorieTarget.tipoDia]}`
                    : undefined
                }
              />
              <MacroDia
                label="Grasas"
                value={dayPlan.totalGrasaG === null ? "—" : `${Math.round(dayPlan.totalGrasaG)} g`}
                sub={
                  dayPlan.grasaObjetivoG !== null
                    ? `objetivo ${dayPlan.grasaObjetivoG} g`
                    : undefined
                }
              />
              <MacroDia
                label="Calorías"
                value={`${Math.round(dayPlan.totalKcal)}`}
                sub={calorieTarget ? `meta ${calorieTarget.meta}` : undefined}
              />
            </dl>
          </div>
          {calorieTarget && (
            <div className={cn(SURFACE, "p-6")}>
              <p className="text-sm text-muted-foreground">
                Meta calórica ·{" "}
                {calorieTarget.objetivo === "subir"
                  ? `para subir de peso (+${-calorieTarget.deficit} kcal)`
                  : calorieTarget.objetivo === "bajar"
                    ? `para bajar de peso (−${calorieTarget.deficit} kcal)`
                    : "para mantener tu peso"}
              </p>
              <p className="font-heading text-3xl font-semibold tabular-nums">
                {calorieTarget.meta} kcal
              </p>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                Gastás ~{calorieTarget.gastoCalorico} kcal (
                {calorieTarget.fuente === "xiaomi" ? "BMR + activas" : "estimado"}) · Plan: ~
                {Math.round(dayPlan.totalKcal)} kcal
                {dayPlan.personalizado
                  ? " · porciones según tu peso y tu meta"
                  : dayPlan.factor !== 1 && ` · porciones ×${dayPlan.factor.toFixed(2)}`}
              </p>
            </div>
          )}
        </div>
        {dayPlan.meals.map((meal) => (
          <MealCard
            key={meal.type}
            meal={meal}
            factor={dayPlan.factor}
            personalizado={dayPlan.personalizado}
          />
        ))}
      </div>

      <FixedRules />
    </div>
  );
}

function MacroDia({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="grid content-start">
      <dt className="text-sm text-muted-foreground dark:text-white/75">{label}</dt>
      <dd className="font-heading text-3xl font-semibold text-foreground dark:text-white">
        {value}
      </dd>
      {sub && <dd className="text-xs text-muted-foreground dark:text-white/70">{sub}</dd>}
    </div>
  );
}
