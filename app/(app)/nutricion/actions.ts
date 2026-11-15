"use server";

import { getCalorieTarget, type CalorieTarget } from "@/lib/calorie-target";
import { getUserPlanContext } from "@/lib/user-plan";
import { fromISO } from "@/lib/date";
import { getCarbLoadWeeks, getSessionsForDate } from "@/lib/training-plan";
import { tipoDiaPara, type TipoDia } from "@/lib/meal-plan";

export type CalorieTargetDelDia = CalorieTarget & {
  /** Qué toca entrenar ese día: decide el objetivo de hidratos. */
  tipoDia: TipoDia;
};

export async function getCalorieTargetForDate(iso: string): Promise<CalorieTargetDelDia | null> {
  // Server Action: llega cualquier cosa desde el navegador
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const planContext = await getUserPlanContext();
  if (!planContext) return null;
  const { profile, weeks, events } = planContext;
  const fecha = fromISO(iso);
  const target = await getCalorieTarget(fecha, profile, weeks);
  if (!target) return null;

  // carga de hidratos: jueves y viernes de la semana de carga (igual que el almuerzo en lib/meal-plan.ts)
  const semana = weeks.find((w) => {
    const dias = Math.round((fecha.getTime() - fromISO(w.start).getTime()) / 86_400_000);
    return dias >= 0 && dias < 7;
  });
  const diaIdx = semana
    ? Math.round((fecha.getTime() - fromISO(semana.start).getTime()) / 86_400_000)
    : -1;
  const esCarga = !!semana && diaIdx >= 3 && getCarbLoadWeeks(weeks).includes(semana.num);
  const tags = getSessionsForDate(weeks, events, fecha).map((s) => s.tag);
  return { ...target, tipoDia: tipoDiaPara(tags, esCarga) };
}
