"use server";

import { getCalorieTarget } from "@/lib/calorie-target";
import {
  bancoDesdeEleccion,
  textoCatalogoComidas,
  textoIngredientes,
  textoPlanActual,
} from "@/lib/plan-ia";
import { todayNormalized } from "@/lib/date";
import { MEALS_SYSTEM, describeUser } from "@/lib/coach";
import {
  aiEleccionComidasSchema,
  armarComidasInputSchema,
  mealBankSchema,
} from "@/lib/validation/coach";
import { leerEstadoPlanIa } from "@/lib/preferencias";
import type { ActionResult } from "@/lib/types";
import {
  prepare,
  cobrar,
  latestPeso,
  generateJson,
  savePlan,
  describirObjetivoEntreno,
  describirMacros,
  describirObjetivo,
} from "@/lib/coach-server";

/**
 * Arma (o cambia, con `pedido`) el plan de comidas: la IA elige platos del catálogo o arma
 * nuevos con ingredientes conocidos; las porciones las calcula la app. Usa 1 consulta del día.
 */
export async function armarComidas(input: {
  pedido: string;
  inicial?: boolean;
}): Promise<ActionResult & { cobrado?: boolean }> {
  const ready = await prepare();
  if (!ready.ok) return ready;
  const parsed = armarComidasInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "El pedido es muy largo (máximo 1000)." };

  const { supabase, userId, ctx } = ready;
  const { pedido } = parsed.data;
  const [peso, estado, target] = await Promise.all([
    latestPeso(supabase, userId),
    leerEstadoPlanIa(supabase),
    getCalorieTarget(todayNormalized(), ctx.profile, ctx.weeks),
  ]);
  const { preferencias } = estado;
  // "inicial" solo vale recién registrado (marca plan_pendiente)
  const inicial = parsed.data.inicial && estado.planPendiente;
  const actual = ctx.planIa.comidas;

  const prompt = [
    describeUser(ctx, peso),
    describirObjetivoEntreno(preferencias),
    describirObjetivo(target),
    describirMacros(ctx.profile.pesoInicialKg, peso, target?.meta ?? null),
    `No come: ${preferencias.noCome ? `"""${preferencias.noCome}"""` : "nada en particular"}.`,
    `CATÁLOGO de platos (nombre [ids de ingredientes]):\n${textoCatalogoComidas()}`,
    `INGREDIENTES para platos nuevos (id: nombre):\n${textoIngredientes()}`,
    actual
      ? `Su plan actual:\n${textoPlanActual(actual)}`
      : "Todavía no tiene plan: armalo de cero.",
    pedido ? `Lo que pide cambiar:\n"""${pedido}"""` : "Armá su plan completo.",
  ].join("\n\n");

  const gen = await cobrar(
    supabase,
    () => generateJson(MEALS_SYSTEM, prompt, aiEleccionComidasSchema, aiEleccionComidasSchema),
    { inicial },
  );
  if (!gen.ok) return gen;
  // desde acá el uso ya se descontó: toda respuesta lleva cobrado
  const bank = bancoDesdeEleccion(gen.data);
  // doble chequeo contra el mismo schema con el que se lee (lib/user-plan.ts)
  if (!bank || !mealBankSchema.safeParse(bank).success) {
    return { ok: false, message: "La IA armó un plan inválido, probá de nuevo.", cobrado: true };
  }
  return { ...(await savePlan(supabase, userId, "comidas", bank)), cobrado: true };
}
