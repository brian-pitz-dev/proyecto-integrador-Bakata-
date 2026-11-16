"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { cargaLimiter } from "@/lib/rate-limit";
import { toISO, todayNormalized } from "@/lib/date";
import { lesionSchema, ZONAS_SIN_LADO } from "@/lib/validation/lesion";
import type { ActionResult } from "@/lib/types";

/** Una lesión cambia el plan de todas las pestañas (specs/011-lesiones). */
const recalcular = () => revalidatePath("/", "layout");

const guardarSchema = z.object({
  id: z.uuid().nullish(),
  lesion: lesionSchema,
  /** La persona marcó el consentimiento en el formulario (dato de salud, Ley 25.326). */
  consiento: z.boolean(),
});

/**
 * Alta (sin id) o edición (con id) de una lesión propia. La primera vez exige el consentimiento
 * y lo guarda en user_metadata.salud_consentida_at (research.md, Decisión 6).
 */
export async function guardarLesion(input: unknown): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };
  if (cargaLimiter.isLimited(user.id))
    return { ok: false, message: "Demasiados cambios en poco tiempo, esperá un momento." };
  cargaLimiter.record(user.id);

  const parsed = guardarSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { id, lesion, consiento } = parsed.data;

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const yaConsintio = !!claims?.claims.user_metadata?.salud_consentida_at;
  if (!yaConsintio && !consiento) {
    return { ok: false, message: "Para guardar tu lesión necesitamos tu consentimiento." };
  }

  const fila = {
    ...lesion,
    lado: ZONAS_SIN_LADO.includes(lesion.zona) ? null : lesion.lado,
    nota: lesion.nota || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = id
    ? await supabase.from("lesion").update(fila).eq("id", id).eq("user_id", user.id).select("id")
    : await supabase
        .from("lesion")
        .insert({ ...fila, user_id: user.id })
        .select("id");
  if (error || !data?.length) {
    if (error) console.error("guardarLesion", error);
    return { ok: false, message: "No se pudo guardar la lesión." };
  }

  if (!yaConsintio) {
    // queda constancia de cuándo aceptó; si falla, la lesión ya está y se vuelve a pedir la próxima
    const { error: metaError } = await supabase.auth.updateUser({
      data: { salud_consentida_at: new Date().toISOString() },
    });
    if (!metaError) await supabase.auth.refreshSession();
  }

  recalcular();
  return { ok: true };
}

/** "Ya estoy bien": el alta es hoy, así que el plan vuelve a ser el de siempre desde hoy. */
export async function cerrarLesion(id: unknown): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, message: "Lesión inválida." };

  const hoy = toISO(todayNormalized());
  const supabase = await createClient();
  // si arrancaba más adelante (hasta >= desde en la base), se borra: nunca llegó a estar activa
  const { data: actual } = await supabase
    .from("lesion")
    .select("desde")
    .eq("id", parsed.data)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!actual) return { ok: false, message: "No se encontró la lesión." };
  const { error } =
    actual.desde > hoy
      ? await supabase.from("lesion").delete().eq("id", parsed.data).eq("user_id", user.id)
      : await supabase
          .from("lesion")
          .update({ hasta: hoy, updated_at: new Date().toISOString() })
          .eq("id", parsed.data)
          .eq("user_id", user.id);
  if (error) {
    console.error("cerrarLesion", error);
    return { ok: false, message: "No se pudo actualizar la lesión." };
  }
  recalcular();
  return { ok: true };
}

export async function borrarLesion(id: unknown): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return { ok: false, message: "Lesión inválida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("lesion")
    .delete()
    .eq("id", parsed.data)
    .eq("user_id", user.id);
  if (error) return { ok: false, message: "No se pudo borrar la lesión." };
  recalcular();
  return { ok: true };
}
