/**
 * Preferencias que contó en el registro para armar su plan con IA (qué no come, zonas a
 * priorizar, equipo) y la marca de que falta armarlo. Viven en user_metadata: el usuario las
 * puede editar, así que se validan como cualquier input y nunca se usan para autorizar.
 * Solo server.
 */

import { createClient } from "@/lib/supabase/server";
import { toISO, todayNormalized } from "@/lib/date";
import { AI_USOS_PLAN_INICIAL } from "@/lib/coach";
import { preferenciasSchema, type Preferencias } from "@/lib/validation/coach";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const PREFERENCIAS_VACIAS: Preferencias = { noCome: "", zonas: [], equipo: "" };

export async function leerEstadoPlanIa(supabase?: Supabase): Promise<{
  preferencias: Preferencias;
  /** Recién registrado: falta armar su plan con IA. */
  planPendiente: boolean;
}> {
  const client = supabase ?? (await createClient());
  const { data } = await client.auth.getClaims();
  const meta = data?.claims.user_metadata ?? {};
  const parsed = preferenciasSchema.safeParse(meta.preferencias ?? {});
  let planPendiente = meta.plan_pendiente === true;
  if (planPendiente) {
    // Red de seguridad: si ya tiene los dos planes guardados (p. ej. el JWT todavía no se
    // renovó), no se vuelve a armar ni a cobrar.
    const { data: planes } = await client.from("plan_ia").select("tipo");
    planPendiente = (planes ?? []).length < 2;
  }
  return {
    preferencias: parsed.success ? parsed.data : PREFERENCIAS_VACIAS,
    planPendiente,
  };
}

/**
 * Consultas de IA usadas hoy que cuentan para el límite diario: las del armado inicial del plan
 * (anotadas en user_metadata.plan_inicial al terminarlo) no cuentan. El dato es editable por el
 * usuario, pero el tope duro de la base (AI_HARD_LIMIT) no cambia: como mucho gana esas 2.
 */
export async function usosVisiblesHoy(supabase?: Supabase): Promise<number> {
  const client = supabase ?? (await createClient());
  const hoy = toISO(todayNormalized());
  const [{ data: uso }, { data: claims }] = await Promise.all([
    client.from("uso_ia").select("usos").eq("fecha", hoy).maybeSingle(),
    client.auth.getClaims(),
  ]);
  const inicial = claims?.claims.user_metadata?.plan_inicial;
  const deInicial =
    inicial?.fecha === hoy && typeof inicial.usos === "number"
      ? Math.min(AI_USOS_PLAN_INICIAL, Math.max(0, inicial.usos))
      : 0;
  return Math.max(0, (uso?.usos ?? 0) - deInicial);
}
