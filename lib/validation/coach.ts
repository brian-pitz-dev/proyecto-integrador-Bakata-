import { z } from "zod";

export const ZONAS = [
  "piernas",
  "glúteos",
  "espalda",
  "pecho",
  "hombros",
  "brazos",
  "core",
] as const;

/** Las mismas gymKey que referencia lib/training-plan.ts — la fase decide cuál toca cada día. */
export const GYM_KEYS = [
  "empuje",
  "tiron",
  "inferior",
  "inferiorRun",
  "empujeLight",
  "tironLight",
  "inferiorLight",
] as const;

// --- Input del usuario ---

export const chatSchema = z
  .array(
    z.object({
      role: z.enum(["user", "model"]),
      text: z.string().trim().min(1).max(1000),
    }),
  )
  .min(1)
  .max(12)
  .refine((msgs) => msgs.at(-1)?.role === "user", "El último mensaje tiene que ser del usuario");

/** Pedido de cambio al plan de comidas (vacío = armarlo con lo que ya sabemos del usuario). */
export const armarComidasInputSchema = z.object({
  pedido: z.string().trim().max(1000),
  /** Armado inicial después del registro: no cuenta en el límite diario (ver AI_DAILY_LIMIT). */
  inicial: z.boolean().default(false),
});

export const armarRutinasInputSchema = z.object({
  pedido: z.string().trim().max(1000),
  inicial: z.boolean().default(false),
  /** Rutinas del mes siguiente: tienen que ser distintas a las del mes que terminó. */
  nuevoMes: z.boolean().default(false),
  equipo: z.string().trim().max(500),
  zonas: z.array(z.enum(ZONAS)).max(ZONAS.length),
});

/** Mes nuevo de rutinas: objetivo otra vez, zonas, meta de peso (opcional) y algún pedido. */
export const nuevoMesInputSchema = z.object({
  objetivo: z.enum(["musculo", "bajar", "evento"]),
  zonas: z.array(z.enum(ZONAS)).max(ZONAS.length),
  metaPesoKg: z.number().min(30).max(300).nullable(),
  pedido: z.string().trim().max(1000),
});

/** Lo que el usuario contó en el registro para que la IA arme su plan (va en user_metadata). */
export const OBJETIVOS = ["musculo", "bajar", "evento"] as const;
export const NIVELES_CARDIO = ["nuevo", "base", "regular"] as const;
export const NIVELES_GYM = ["principiante", "intermedio", "avanzado"] as const;

export const preferenciasSchema = z.object({
  /** Para qué entrena (sin dato = cuentas viejas: plan de eventos de siempre). */
  objetivo: z.enum(OBJETIVOS).optional(),
  /** Running/caminata: nuevo (no corre), base (corre 20-30' seguidos), regular (corre seguido). */
  nivelCardio: z.enum(NIVELES_CARDIO).optional(),
  /** Km por semana que ya corre (solo nivel regular). */
  kmSemana: z.number().min(0).max(250).nullish(),
  nivelGym: z.enum(NIVELES_GYM).optional(),
  /** Lunes en que arrancó su mes de rutinas actual (objetivo músculo / bajar: ciclos de 4 semanas). */
  cicloInicio: z.iso.date().optional(),
  noCome: z.string().trim().max(500).default(""),
  zonas: z.array(z.enum(ZONAS)).max(ZONAS.length).default([]),
  equipo: z.string().trim().max(500).default(""),
});

export type Preferencias = z.infer<typeof preferenciasSchema>;

// --- Salida de la IA (también input no confiable: se valida antes de guardar) ---

/** Texto que solo se muestra: si la IA se pasa de largo se recorta en vez de rechazar todo el plan. */
function shown(max: number, min = 1) {
  return z
    .string()
    .trim()
    .min(min)
    .transform((s) => (s.length > max ? `${s.slice(0, max - 1)}…` : s));
}

/**
 * Plato elegido por la IA: uno del catálogo (`nuevo: false`, solo importa el nombre) o uno nuevo
 * armado con ingredientes del catálogo (`nuevo: true`, ids + gramos de la porción de referencia).
 * Las cantidades finales las calcula la app (lib/meal-plan.ts) según la persona y el día.
 */
const aiPlatoSchema = z.object({
  nombre: shown(80),
  nuevo: z.boolean(),
  detalle: shown(200, 0),
  ingredientes: z
    .array(z.object({ id: z.string().trim().max(40), gramos: z.number().min(0).max(1000) }))
    .max(8),
  carbLoad: z.boolean(),
  liviana: z.boolean(),
});

const aiPlatosArr = z.array(aiPlatoSchema).max(8);
export const aiEleccionComidasSchema = z.object({
  desayuno: aiPlatosArr,
  media: aiPlatosArr,
  almuerzo: aiPlatosArr,
  merienda: aiPlatosArr,
  cena: aiPlatosArr,
});

export type AiEleccionComidas = z.infer<typeof aiEleccionComidasSchema>;

const routineSchema = z.object({
  label: shown(60),
  exercises: z
    .array(
      z.object({
        name: shown(90),
        sets: shown(40),
      }),
    )
    .min(2)
    .max(8),
});

/** Lo que devuelve la IA: por rutina, nombre + ejercicios elegidos del catálogo con sus series. */
export const routinesSchema = z.object(
  Object.fromEntries(GYM_KEYS.map((k) => [k, routineSchema])) as Record<
    (typeof GYM_KEYS)[number],
    typeof routineSchema
  >,
);

export type AiRutinas = z.infer<typeof routinesSchema>;

/** Lo guardado: además, calentamiento, vuelta a la calma y músculos (los completa la app). */
const storedRoutineSchema = z.object({
  label: z.string().max(80),
  warmup: z.string().max(300).optional(),
  cooldown: z.string().max(300).optional(),
  exercises: z
    .array(
      z.object({
        name: z.string().max(90),
        sets: z.string().max(40),
        muscles: z.string().max(120).optional(),
      }),
    )
    .min(2)
    .max(8),
});

export const storedRoutinesSchema = z.object(
  Object.fromEntries(GYM_KEYS.map((k) => [k, storedRoutineSchema])) as Record<
    (typeof GYM_KEYS)[number],
    typeof storedRoutineSchema
  >,
);

// --- Lo guardado en plan_ia (se re-valida al leer: el dueño puede escribir su fila vía RLS) ---

const storedMealSchema = z.object({
  name: z.string().max(80),
  detail: z.string().max(300),
  ingredientes: z
    .array(
      z.object({
        id: z.string().max(40),
        cantidad: z.number().min(0).max(2000).nullable(),
        nombre: z.string().max(40).optional(),
      }),
    )
    .max(10),
  carbLoad: z.boolean().optional(),
  liviana: z.boolean().optional(),
  proteinG: z.number().min(0).max(300).optional(),
  kcal: z.number().min(0).max(4000).optional(),
  hcG: z.number().min(0).max(800).optional(),
  grasaG: z.number().min(0).max(400).optional(),
});

const storedArr = z.array(storedMealSchema).min(1).max(15);
export const mealBankSchema = z.object({
  desayuno: storedArr,
  media: storedArr,
  almuerzo: storedArr,
  merienda: storedArr,
  cena: storedArr,
});

/** JSON Schema para el `response_format` de Gemini, derivado del mismo schema zod. */
// Gemini rechaza schemas con límites numéricos/de largo anidados ("too many states for serving"):
// a la IA se le manda solo la forma; los límites van en el prompt y los aplica zod al validar.
const BOUND_KEYS = new Set([
  "$schema",
  "minimum",
  "maximum",
  "minLength",
  "maxLength",
  "minItems",
  "maxItems",
]);

export function toGeminiSchema(schema: z.ZodType): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(z.toJSONSchema(schema, { io: "input" }), (key, value) =>
      BOUND_KEYS.has(key) ? undefined : value,
    ),
  );
}
