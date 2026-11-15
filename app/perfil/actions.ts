"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { trainingSchema } from "@/lib/validation/onboarding";
import type { ActionResult } from "@/lib/types";
import { z } from "zod";
import { addDays, fromISO, todayNormalized } from "@/lib/date";
import { WEEK_DAYS, validateStrengthDays } from "@/lib/strength-schedule";
import { trainingProfileFromRow } from "@/lib/training-profile";
import type { DayKey } from "@/lib/training-plan";
import { isMissingColumnError } from "@/lib/supabase/errors";

/** Módulo de Server Actions (sin page.tsx), igual que app/registro/actions.ts. */
export async function updateTraining(input: z.infer<typeof trainingSchema>): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) {
    return { ok: false, message: "No autenticado." };
  }

  const parsed = trainingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  const supabase = await createClient();
  // Si cambia la cantidad de días, los cambios por semana ya no encajan: se descartan.
  const { data: current } = await supabase
    .from("perfil")
    .select("dias_gym")
    .eq("user_id", user.id)
    .maybeSingle();
  const resetWeeks = current != null && Number(current.dias_gym) !== data.diasGym;

  const { error } = await supabase
    .from("perfil")
    .update({
      ...(resetWeeks ? { dias_fuerza_semana: {} } : {}),
      nivel: data.nivel,
      objetivo: data.objetivo,
      dias_gym: data.diasGym,
      dias_fuerza: data.diasFuerza ?? null,
      lugar: data.lugar,
    })
    .eq("user_id", user.id);
  if (isMissingColumnError(error)) {
    return {
      ok: false,
      message:
        "La base de datos todavía no tiene la migración de entrenamiento (supabase/migrations/20261115120000_perfil_entrenamiento.sql). Pedile a quien administra Supabase que la ejecute.",
    };
  }
  if (error) {
    return { ok: false, message: "No se pudo guardar: " + error.message };
  }

  revalidatePath("/calendario");
  revalidatePath("/mancuernas");
  return { ok: true };
}

const weekDaysSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** null = volver a los días habituales esa semana. */
  days: z
    .array(z.enum(WEEK_DAYS as [DayKey, ...DayKey[]]))
    .max(7)
    .nullable(),
});

/** Cambia los días de fuerza de una sola semana (clave: el lunes de esa semana). */
export async function updateWeekDays(input: z.infer<typeof weekDaysSchema>): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) {
    return { ok: false, message: "No autenticado." };
  }

  const parsed = weekDaysSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Datos inválidos." };
  }
  const { weekStart, days } = parsed.data;
  const monday = fromISO(weekStart);
  if (monday.getDay() !== 1) {
    return { ok: false, message: "La semana tiene que empezar un lunes." };
  }
  const thisMonday = addDays(todayNormalized(), -((todayNormalized().getDay() + 6) % 7));
  if (monday < thisMonday) {
    return { ok: false, message: "No se pueden cambiar semanas que ya pasaron." };
  }

  const supabase = await createClient();
  const { data: row, error: readError } = await supabase
    .from("perfil")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError || !row) {
    return { ok: false, message: "No se encontró tu perfil." };
  }
  if (!("dias_fuerza_semana" in row)) {
    return {
      ok: false,
      message:
        "La base de datos todavía no tiene la migración de entrenamiento (supabase/migrations/20261115120000_perfil_entrenamiento.sql). Pedile a quien administra Supabase que la ejecute.",
    };
  }

  const training = trainingProfileFromRow(row, Number(row.edad));
  if (days) {
    const error = validateStrengthDays(training.diasGym, days);
    if (error) return { ok: false, message: error };
  }

  // Se guardan solo semanas desde la actual en adelante (las pasadas ya no se pueden editar).
  const weeks: Record<string, DayKey[]> = {};
  for (const [key, value] of Object.entries(training.diasFuerzaSemana)) {
    if (fromISO(key) >= thisMonday) weeks[key] = value;
  }
  if (days) weeks[weekStart] = days;
  else delete weeks[weekStart];

  const { error } = await supabase
    .from("perfil")
    .update({ dias_fuerza_semana: weeks })
    .eq("user_id", user.id);
  if (error) {
    return { ok: false, message: "No se pudo guardar: " + error.message };
  }

  revalidatePath("/calendario");
  revalidatePath("/mancuernas");
  return { ok: true };
}
