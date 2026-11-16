"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { toISO, todayNormalized } from "@/lib/date";
import { AI_USOS_PLAN_INICIAL } from "@/lib/coach";
import type { ActionResult } from "@/lib/types";

/**
 * Cierra el armado inicial (después del registro): baja la marca plan_pendiente para no volver
 * a mostrar "Armando tu plan". Se llama haya salido bien o no (si no, queda el plan base y lo
 * puede pedir desde Nutrición / Coach).
 */
export async function terminarPlanInicial(cobradas: number): Promise<ActionResult> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };
  const usos = Number.isInteger(cobradas)
    ? Math.min(AI_USOS_PLAN_INICIAL, Math.max(0, cobradas))
    : 0;
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      plan_pendiente: false,
      // las consultas del armado inicial no cuentan en el límite diario (usosVisiblesHoy)
      plan_inicial: { fecha: toISO(todayNormalized()), usos },
    },
  });
  if (error) return { ok: false, message: "No se pudo actualizar tu cuenta." };
  // la marca se lee del JWT (getClaims): sin renovarlo, seguiría diciendo "pendiente" hasta 1 h
  await supabase.auth.refreshSession();
  revalidatePath("/", "layout");
  return { ok: true };
}
