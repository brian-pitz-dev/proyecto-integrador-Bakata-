"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { cargaLimiter } from "@/lib/rate-limit";
import { getUserPlanContext } from "@/lib/user-plan";
import { CATEGORIA_MOVER, motivoNoMover } from "@/lib/mover";
import { addDays, fromISO, toISO, todayNormalized } from "@/lib/date";
import type { ActionResult } from "@/lib/types";

const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const moverSchema = z.object({ desde: fechaISO, hasta: fechaISO });

function revalidar() {
  revalidatePath("/calendario");
  revalidatePath("/nutricion");
  revalidatePath("/coach");
}

/**
 * Pasa el entrenamiento de un día a otro de la misma semana (se intercambian). Se valida contra el
 * plan actual de la persona (lib/mover.ts): misma semana, no días pasados ni de un evento, y sin
 * dejar el mismo grupo muscular en días seguidos.
 */
export async function moverDia(input: { desde: string; hasta: string }): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };
  if (cargaLimiter.isLimited(user.id))
    return { ok: false, message: "Demasiados cambios en poco tiempo, esperá un momento." };
  cargaLimiter.record(user.id);

  const parsed = moverSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Datos inválidos." };
  const { desde, hasta } = parsed.data;

  const ctx = await getUserPlanContext();
  if (!ctx) return { ok: false, message: "Completá tu perfil primero." };
  const motivo = motivoNoMover(ctx.weeks, ctx.events, desde, hasta, toISO(todayNormalized()));
  if (motivo) return { ok: false, message: motivo };

  const supabase = await createClient();
  const { error } = await supabase
    .from("registro")
    .insert([
      { categoria: CATEGORIA_MOVER, fecha: desde, valor: 0, nota: hasta, user_id: user.id },
    ]);
  if (error) {
    console.error("moverDia", error);
    return { ok: false, message: "No se pudo mover, probá de nuevo." };
  }
  revalidar();
  return { ok: true };
}

/** Vuelve la semana (la que arranca el lunes `lunes`) a como la armó el plan. */
export async function deshacerMovimientos(lunes: string): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };
  if (!fechaISO.safeParse(lunes).success) return { ok: false, message: "Datos inválidos." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("registro")
    .delete()
    .eq("user_id", user.id)
    .eq("categoria", CATEGORIA_MOVER)
    .gte("fecha", lunes)
    .lte("fecha", toISO(addDays(fromISO(lunes), 6)));
  if (error) {
    console.error("deshacerMovimientos", error);
    return { ok: false, message: "No se pudo deshacer, probá de nuevo." };
  }
  revalidar();
  return { ok: true };
}
