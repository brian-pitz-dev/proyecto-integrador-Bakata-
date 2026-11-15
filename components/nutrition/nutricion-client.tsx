"use client";

import { useEffect, useState } from "react";
import { addDays, fromISO, toISO, todayNormalized, WEEKDAY_LABELS } from "@/lib/date";
import { getCurrentWeekNum, getCarbLoadWeeks, type Week } from "@/lib/training-plan";
import { cn } from "@/lib/utils";
import { getMealsForDay } from "@/lib/meal-plan";
import { getCalorieTargetForDate } from "@/app/(app)/nutricion/actions";
import type { CalorieTarget } from "@/lib/calorie-target";
import { WeekSelector } from "@/components/week-selector/week-selector";
import { MealCard } from "@/components/nutrition/meal-card";
import { FixedRules } from "@/components/nutrition/fixed-rules";
import { PageHeader } from "@/components/page-header";
import { HIGHLIGHT, SURFACE } from "@/lib/styles";

function currentDayIdx(today: Date): number {
  const jsDay = today.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function NutricionClient({ weeks }: { weeks: Week[] }) {
  const today = todayNormalized();
  // el fin de semana no tiene plan: abrir directo en el lunes que viene
  const start = addDays(today, today.getDay() === 6 ? 2 : today.getDay() === 0 ? 1 : 0);

  const [week, setWeek] = useState(() => getCurrentWeekNum(weeks, start));
  const [day, setDay] = useState(() => currentDayIdx(start));
  const [calorieTarget, setCalorieTarget] = useState<CalorieTarget | null>(null);

  const carbLoadWeeks = getCarbLoadWeeks(weeks);
  const dayPlan = getMealsForDay(week, day, carbLoadWeeks);
  const weekObj = weeks.find((w) => w.num === week) ?? weeks[0];
  const weekStart = fromISO(weekObj.start);

  function handleSelectWeek(weekNum: number) {
    setWeek(weekNum);
    setDay(0); // siempre arranca en lunes al cambiar de semana
  }

  useEffect(() => {
    // En fin de semana no se muestra el total (dayPlan.isWeekday === false), no hace falta pedirlo.
    if (day >= 5) return;
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
        description="Cuatro comidas de lunes a viernes con el método del plato. El menú rota cada semana."
      />

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

      {dayPlan.isWeekday ? (
        <div className="grid gap-4">
          <div className={cn("mb-2 grid gap-4", calorieTarget && "sm:grid-cols-2")}>
            <div className={cn(HIGHLIGHT, "rounded-[20px] p-6")}>
              <p className="text-sm text-muted-foreground dark:text-white/75">Proteína del día</p>
              <p className="font-heading text-3xl font-semibold text-primary tabular-nums dark:text-white">
                {dayPlan.totalProteinG.toFixed(1)} g
              </p>
            </div>
            {calorieTarget && (
              <div className={cn(SURFACE, "p-6")}>
                <p className="text-sm text-muted-foreground">
                  Meta calórica · {calorieTarget.fuente === "xiaomi" ? "BMR + activas" : "estimado"}
                </p>
                <p className="font-heading text-3xl font-semibold tabular-nums">
                  {calorieTarget.meta} kcal
                </p>
              </div>
            )}
          </div>
          {dayPlan.meals.map((meal) => (
            <MealCard key={meal.type} meal={meal} />
          ))}
        </div>
      ) : (
        <div className="rounded-[20px] border border-dashed border-border p-6 text-sm text-muted-foreground">
          El fin de semana no tiene menú fijo. Antes de una carrera o caminata, seguí la guía de tu
          evento al pie del Calendario.
        </div>
      )}

      <FixedRules />
    </div>
  );
}
