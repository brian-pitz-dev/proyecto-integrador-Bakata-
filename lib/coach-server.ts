// Helpers de servidor compartidos por las Server Actions del coach (app/(app)/coach/*-actions.ts).
// No es un módulo "use server": nada de acá queda expuesto como acción al cliente.
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/supabase/auth";
import { getUserPlanContext, type UserPlanContext } from "@/lib/user-plan";
import { coachLimiter } from "@/lib/rate-limit";
import { generate } from "@/lib/ai";
import { getCalorieTarget } from "@/lib/calorie-target";
import { AI_DAILY_LIMIT } from "@/lib/coach";
import { toGeminiSchema } from "@/lib/validation/coach";
import { usosVisiblesHoy } from "@/lib/preferencias";
import { metasMacros } from "@/lib/meal-plan";
import type { ActionResult } from "@/lib/types";

export type Supabase = Awaited<ReturnType<typeof createClient>>;
type Ready = { ok: true; userId: string; supabase: Supabase; ctx: UserPlanContext };

const LIMIT_MESSAGE = `Usaste tus ${AI_DAILY_LIMIT} consultas de hoy. Mañana se renuevan.`;

/** Sesión + rate limit por minuto. La cuota diaria la descuenta `cobrar`, justo antes de la IA. */
export async function prepare(): Promise<Ready | { ok: false; message: string }> {
  const user = await getAuthedUser();
  if (!user) return { ok: false, message: "No autenticado." };

  if (coachLimiter.isLimited(user.id)) {
    return { ok: false, message: "Vas muy rápido, esperá un minuto." };
  }
  coachLimiter.record(user.id);

  const supabase = await createClient();
  const ctx = await getUserPlanContext();
  if (!ctx) return { ok: false, message: "Completá el onboarding primero." };

  return { ok: true, userId: user.id, supabase, ctx };
}

/** Consume 1 uso de forma atómica (consumir_uso_ia); false si otra request llegó primero al límite. */
export async function consume(supabase: Supabase): Promise<boolean> {
  const { data, error } = await supabase.rpc("consumir_uso_ia");
  return !error && data === true;
}

/**
 * Descuenta 1 uso ANTES de llamar a la IA: así N pedidos en paralelo no pasan todos el chequeo
 * (el límite por minuto es por instancia) y no gastan la cuota gratis de Gemini que comparten
 * todos los usuarios. Si la IA falla, el uso ya se gastó: `cobrado` le avisa al cliente.
 * Ver specs/005-coach-ia/research.md, Decisión 2.
 */
export async function cobrar<T extends { ok: boolean }>(
  supabase: Supabase,
  run: () => Promise<T>,
  { inicial = false }: { inicial?: boolean } = {},
): Promise<(T & { cobrado: true }) | { ok: false; message: string }> {
  // Límite diario visible (18); el armado inicial usa las 2 que quedan hasta el tope duro de la
  // base. Dos pedidos en paralelo podrían pasar este chequeo juntos: el tope duro igual se respeta.
  if (!inicial && (await usosVisiblesHoy(supabase)) >= AI_DAILY_LIMIT)
    return { ok: false, message: LIMIT_MESSAGE };
  if (!(await consume(supabase))) return { ok: false, message: LIMIT_MESSAGE };
  return { ...(await run()), cobrado: true };
}

export async function latestPeso(supabase: Supabase, userId: string): Promise<number | null> {
  const { data } = await supabase
    .from("registro")
    .select("valor")
    .eq("user_id", userId)
    .eq("categoria", "peso")
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? Number(data.valor) : null;
}

/** Llama a la IA pidiendo JSON y lo valida con zod (la salida de la IA no es confiable). */
export async function generateJson<T extends z.ZodType>(
  system: string,
  input: string,
  jsonSchema: z.ZodType,
  validator: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; message: string }> {
  const result = await generate({ system, input, schema: toGeminiSchema(jsonSchema) });
  if (!result.ok) return result;
  let raw: unknown;
  try {
    raw = JSON.parse(result.text);
  } catch {
    return { ok: false, message: "La IA devolvió un formato inválido, probá de nuevo." };
  }
  const parsed = validator.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: "La IA armó un plan incompleto, probá de nuevo." };
  }
  return { ok: true, data: parsed.data };
}

export async function savePlan(
  supabase: Supabase,
  userId: string,
  tipo: "comidas" | "ejercicios",
  contenido: unknown,
): Promise<ActionResult> {
  const { error } = await supabase
    .from("plan_ia")
    .upsert(
      { user_id: userId, tipo, contenido, updated_at: new Date().toISOString() },
      { onConflict: "user_id,tipo" },
    );
  if (error) return { ok: false, message: "No se pudo guardar el plan." };
  revalidatePath("/coach");
  revalidatePath(tipo === "comidas" ? "/nutricion" : "/calendario");
  return { ok: true };
}

const OBJETIVO_TEXTO: Record<string, string> = {
  musculo: "ganar músculo / tonificar (plan centrado en el gym)",
  bajar: "bajar de peso (gym + cardio)",
  evento: "preparar sus carreras o caminatas",
};

export function describirObjetivoEntreno(p: {
  objetivo?: string;
  nivelGym?: string;
  nivelCardio?: string;
}): string {
  return [
    `Objetivo de entrenamiento: ${p.objetivo ? OBJETIVO_TEXTO[p.objetivo] : "preparar sus eventos"}.`,
    p.nivelGym &&
      `Nivel de gym: ${p.nivelGym} (principiante: menos series y lejos del fallo, RIR 3; avanzado: más series, RIR 1).`,
    p.nivelCardio && `Nivel de running/caminata: ${p.nivelCardio}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Objetivos de macros del día (lib/meal-plan.ts metasMacros), para que elija platos que lleguen. */
export function describirMacros(
  pesoInicial: number,
  peso: number | null,
  metaKcal: number | null,
): string {
  const m = metasMacros(peso ?? pesoInicial, "gym", metaKcal);
  return [
    `Objetivos diarios aproximados: proteína ${Math.round(m.p)} g, hidratos ${Math.round(m.h)} g, grasas ${Math.round(m.g)} g.`,
    "Elegí platos con los que se pueda llegar a esos números ajustando porciones: almuerzos y cenas con una fuente de proteína, una de hidratos y verduras; desayunos y meriendas con hidratos y algo de proteína; pocos fritos y embutidos si las grasas objetivo son bajas.",
  ].join("\n");
}

export function describirObjetivo(target: Awaited<ReturnType<typeof getCalorieTarget>>): string {
  if (!target) return "Meta calórica: sin dato todavía.";
  const objetivo =
    target.objetivo === "subir"
      ? "subir de peso, con superávit"
      : target.objetivo === "bajar"
        ? "bajar de peso, con déficit"
        : "mantener el peso";
  return `Meta calórica de hoy: ~${target.meta} kcal (objetivo: ${objetivo}).`;
}
