"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { cargaLimiter } from "@/lib/rate-limit";
import { CATEGORIA_CARGA, cargaSchema } from "@/lib/validation/carga";
import { toISO, todayNormalized } from "@/lib/date";
import type { ActionResult } from "@/lib/types";

/**
 * Guarda (o borra, con kg null) el peso usado en un ejercicio un día. Una sola carga por
 * ejercicio y día: si ya había una, se reemplaza. Va en `registro` con categoría "carga".
 */
export async function saveCarga(input: {
  fecha: string;
  ejercicio: string;
  kg: number | null;
}): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };

  if (cargaLimiter.isLimited(user.id)) {
    return { ok: false, message: "Demasiados cambios en poco tiempo, esperá un momento." };
  }
  cargaLimiter.record(user.id);

  const parsed = cargaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Datos inválidos." };
  const { fecha, ejercicio, kg } = parsed.data;
  // comparación de strings ISO: YYYY-MM-DD ordena igual que las fechas
  if (fecha > toISO(todayNormalized())) {
    return { ok: false, message: "Solo podés anotar cargas de hoy o días anteriores." };
  }

  const supabase = await createClient();
  // primero la nueva y después se borran las otras: si el insert falla, la carga anterior queda
  let nueva: string | null = null;
  if (kg !== null) {
    const { data, error } = await supabase
      .from("registro")
      .insert([
        { categoria: CATEGORIA_CARGA, fecha, valor: kg, nota: ejercicio, user_id: user.id },
      ])
      .select("id")
      .single();
    if (error) {
      console.error("saveCarga insert", error);
      return { ok: false, message: "No se pudo guardar, probá de nuevo." };
    }
    nueva = data.id;
  }

  let anteriores = supabase
    .from("registro")
    .delete()
    .eq("user_id", user.id)
    .eq("categoria", CATEGORIA_CARGA)
    .eq("fecha", fecha)
    .eq("nota", ejercicio);
  if (nueva) anteriores = anteriores.neq("id", nueva);
  const { error: deleteError } = await anteriores;
  if (deleteError) {
    console.error("saveCarga delete", deleteError);
    // con kg ya quedó guardada la nueva (gana al leer, es la última); sin kg no se borró nada
    if (kg === null) return { ok: false, message: "No se pudo borrar, probá de nuevo." };
  }

  return { ok: true };
}
