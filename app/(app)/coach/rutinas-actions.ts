"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import {
  rutinasDesdeEleccion,
  variarContraAnterior,
  type RutinasGuardadas,
  textoCatalogoEjercicios,
} from "@/lib/plan-ia";
import { toISO, todayNormalized } from "@/lib/date";
import { ROUTINES_SYSTEM, describeUser } from "@/lib/coach";
import {
  armarRutinasInputSchema,
  GYM_KEYS,
  nuevoMesInputSchema,
  routinesSchema,
  storedRoutinesSchema,
} from "@/lib/validation/coach";
import { leerEstadoPlanIa } from "@/lib/preferencias";
import { getGymRoutine } from "@/lib/gym-exercises";
import type { ActionResult } from "@/lib/types";
import {
  prepare,
  cobrar,
  latestPeso,
  generateJson,
  savePlan,
  describirObjetivoEntreno,
} from "@/lib/coach-server";

/**
 * Arma (o cambia) las 7 rutinas de gym con ejercicios del catálogo (foto, video y registro de
 * pesos). Guarda equipo y zonas como preferencias para la próxima vez. Usa 1 consulta del día.
 */
export async function armarRutinas(input: {
  pedido: string;
  equipo: string;
  zonas: string[];
  inicial?: boolean;
  nuevoMes?: boolean;
}): Promise<ActionResult & { cobrado?: boolean }> {
  const ready = await prepare();
  if (!ready.ok) return ready;
  const parsed = armarRutinasInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Datos inválidos." };

  const { supabase, userId, ctx } = ready;
  const { pedido, equipo, zonas } = parsed.data;
  const [peso, estado] = await Promise.all([
    latestPeso(supabase, userId),
    leerEstadoPlanIa(supabase),
  ]);
  const { preferencias } = estado;
  const inicial = parsed.data.inicial && estado.planPendiente;
  const { nuevoMes } = parsed.data;
  const actual = ctx.planIa.ejercicios;

  const prompt = [
    describeUser(ctx, peso),
    describirObjetivoEntreno(preferencias),
    `Zonas a priorizar: ${zonas.length ? zonas.join(", ") : "ninguna en particular"}.`,
    `Equipo disponible:\n"""${equipo || "gimnasio comercial estándar"}"""`,
    `CATÁLOGO de ejercicios (nombre (músculos)):\n${textoCatalogoEjercicios()}`,
    actual
      ? `Sus rutinas actuales:\n${GYM_KEYS.map((k) => `- ${k}: ${actual[k].exercises.map((e) => `${e.name} ${e.sets}`).join("; ")}`).join("\n")}`
      : "Todavía no tiene rutinas: armalas de cero.",
    nuevoMes
      ? "Empieza un MES NUEVO: armá las 7 rutinas DISTINTAS a las actuales. En cada rutina cambiá al menos la mitad de los ejercicios por otros del catálogo para los mismos músculos (variantes con otro equipo, ángulo o agarre) y variá los rangos de repeticiones, para que el estímulo cambie."
      : pedido
        ? `Lo que pide cambiar:\n"""${pedido}"""`
        : "Armá las 7 rutinas.",
    nuevoMes && pedido ? `Además pide:\n"""${pedido}"""` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const gen = await cobrar(
    supabase,
    () => generateJson(ROUTINES_SYSTEM, prompt, routinesSchema, routinesSchema),
    { inicial },
  );
  if (!gen.ok) return gen;
  let rutinas = rutinasDesdeEleccion(gen.data);
  // mes nuevo: nunca idéntico al anterior (si la IA repitió de más, se cambian los repetidos)
  if (nuevoMes && actual)
    rutinas = variarContraAnterior(rutinas, actual as RutinasGuardadas, (key) =>
      [1, 5, 9].flatMap((semana) => getGymRoutine(key, semana)?.exercises ?? []),
    );
  if (!storedRoutinesSchema.safeParse(rutinas).success) {
    return { ok: false, message: "La IA armó rutinas inválidas, probá de nuevo.", cobrado: true };
  }
  const saved = await savePlan(supabase, userId, "ejercicios", rutinas);
  // el mes de rutinas arranca el primer lunes desde hoy: 4 semanas enteras (lib/plan-ia.ts)
  const arrancaMes = inicial || nuevoMes || !preferencias.cicloInicio;
  const cambiaron =
    equipo !== preferencias.equipo || zonas.join() !== preferencias.zonas.join() || arrancaMes;
  if (saved.ok && cambiaron) {
    // si falla, el plan ya quedó guardado: solo precarga el formulario y cuenta el mes
    const hoy = todayNormalized();
    const { error } = await supabase.auth.updateUser({
      data: {
        preferencias: {
          ...preferencias,
          equipo,
          zonas,
          ...(arrancaMes && { cicloInicio: toISO(hoy) }),
        },
      },
    });
    if (!error) await supabase.auth.refreshSession();
  }
  return { ...saved, cobrado: true };
}

/**
 * Terminó el mes de rutinas (objetivo músculo / bajar): elige el objetivo otra vez (y la meta de
 * peso, si cambió) y se arman las rutinas del mes siguiente, distintas a las del que terminó.
 * Usa 1 consulta del día.
 */
export async function armarNuevoMes(input: {
  objetivo: string;
  zonas: string[];
  metaPesoKg: number | null;
  pedido: string;
}): Promise<ActionResult & { cobrado?: boolean }> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };
  const parsed = nuevoMesInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Elegí tu objetivo para el próximo mes." };
  const { objetivo, zonas, metaPesoKg, pedido } = parsed.data;

  const supabase = await createClient();
  const { preferencias } = await leerEstadoPlanIa(supabase);
  if (metaPesoKg !== null) {
    const { error } = await supabase
      .from("perfil")
      .update({ meta_peso_kg: metaPesoKg })
      .eq("user_id", user.id);
    if (error) return { ok: false, message: "No se pudo guardar tu meta de peso." };
  }
  const { error } = await supabase.auth.updateUser({
    data: { preferencias: { ...preferencias, objetivo, zonas } },
  });
  if (error) return { ok: false, message: "No se pudo guardar tu objetivo." };
  // el plan lee las preferencias del JWT: se renueva antes de armar las rutinas
  await supabase.auth.refreshSession();

  const result = await armarRutinas({
    pedido,
    equipo: preferencias.equipo,
    zonas,
    nuevoMes: true,
  });
  revalidatePath("/", "layout");
  return result;
}
