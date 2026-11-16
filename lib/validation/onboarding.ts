import { z } from "zod";
import { edadDesde, toISO, todayNormalized } from "@/lib/date";
import { preferenciasSchema } from "@/lib/validation/coach";
import { lesionSchema } from "@/lib/validation/lesion";

// Los mismos schemas validan cada paso del registro en el cliente y el envío completo en el server.

function fecha(vacia: string) {
  return z
    .string()
    .min(1, vacia)
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");
}

/** Número obligatorio con mensajes en castellano (el cliente manda undefined si el campo está vacío). */
function numero(label: string, min: number, max: number) {
  return z
    .number({ error: `Completá ${label}` })
    .finite()
    .min(min, `${label[0].toUpperCase()}${label.slice(1)}: entre ${min} y ${max}`)
    .max(max, `${label[0].toUpperCase()}${label.slice(1)}: entre ${min} y ${max}`);
}

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña es demasiado larga")
  .regex(/[A-Za-z]/, "La contraseña tiene que tener al menos una letra")
  .regex(/\d/, "La contraseña tiene que tener al menos un número");

/** Contraseña nueva (recuperación): mismas reglas que el registro. */
export const nuevaClaveSchema = z
  .object({ password: passwordSchema, passwordConfirm: z.string() })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirm"],
  });

/** Paso 1: cuenta. */
export const cuentaSchema = z
  .object({
    nombre: z.string().trim().min(1, "Contanos tu nombre").max(60, "Nombre demasiado largo"),
    email: z.string().trim().email("Email inválido"),
    password: passwordSchema,
    passwordConfirm: z.string(),
    aceptaTerminos: z.literal(true, { error: "Tenés que aceptar los términos y la privacidad" }),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirm"],
  });

/** Paso 2: perfil (lo que necesita el cálculo de calorías y el plan). */
export const perfilSchema = z.object({
  fechaNacimiento: fecha("Completá tu fecha de nacimiento").refine((f) => {
    const edad = edadDesde(f);
    return edad >= 13 && edad <= 100;
  }, "Tenés que tener entre 13 y 100 años"),
  alturaCm: numero("la altura", 100, 250),
  sexo: z.enum(["M", "F"], { error: "Elegí una opción" }),
  pesoInicialKg: numero("el peso", 30, 300),
  factorActividad: z.number().finite().min(1).max(2.5).default(1.55),
  metaPesoKg: z.number().finite().min(30).max(300).nullish(),
  metaGrasaPct: z.string().trim().max(20).nullish(),
  calibracionPesoKg: z.number().finite().min(30).max(300).nullish(),
  calibracionBmrKcal: z.number().finite().min(500).max(6000).nullish(),
  // defaults = plantilla original: un registro pendiente guardado antes de spec 006 sigue validando
  diasEntrenamiento: z
    .array(z.number().int().min(0).max(6))
    .min(2, "Elegí al menos 2 días para entrenar")
    .refine((d) => new Set(d).size === d.length, "Días repetidos")
    .default([0, 1, 2, 3, 4, 5]),
  minutosSesion: z
    .union([z.literal(30), z.literal(45), z.literal(60), z.literal(90)], {
      error: "Elegí cuánto tiempo tenés",
    })
    .default(60),
});

/** perfil.disponibilidad_historial (jsonb, lo escribe actualizarPerfil): se re-valida al leer. */
export const historialDisponibilidadSchema = z.array(
  z.object({
    hasta: z.iso.date(),
    dias: z.array(z.int().min(0).max(6)).min(1).max(7),
    minutos: z.int().min(1).max(600),
  }),
);

export const eventoSchema = z.object({
  tipo: z.enum(["carrera", "caminata"]),
  nombre: z.string().trim().min(1, "Falta el nombre").max(100),
  // comparación de strings ISO: válida porque YYYY-MM-DD ordena igual lexicográfica y cronológicamente
  fecha: fecha("Completá la fecha").refine(
    (fecha) => fecha > toISO(todayNormalized()),
    "La fecha del evento tiene que ser futura",
  ),
  distanciaKm: numero("la distancia", 0.1, 1000),
  /** Opcional, solo carreras. El cliente convierte "6:30" a segundos (NaN si el formato no sirve). */
  ritmoObjetivoSeg: z
    .number({ error: "Ritmo: usá el formato m:ss, ej. 6:30" })
    .int()
    .min(150, "Ritmo: entre 2:30 y 15:00 min/km")
    .max(900, "Ritmo: entre 2:30 y 15:00 min/km")
    .nullish(),
});

/** Paso 3: eventos. Opcionales salvo que el objetivo sea un evento (ver conEventoSiHaceFalta). */
export const eventosSchema = z.array(eventoSchema).max(20);

const MSG_EVENTO = "Agregá al menos un evento (o elegí otro objetivo)";

const MSG_META = "Contanos a qué peso querés llegar";

/** Para bajar de peso o ganar músculo hace falta la meta de peso (decide las calorías). */
export function faltaMeta(objetivo: string | undefined, metaPesoKg: number | null | undefined) {
  return (objetivo === "musculo" || objetivo === "bajar") && !metaPesoKg;
}

/** Si entrena para un evento, tiene que cargar al menos uno. */
export function faltaEvento(objetivo: string | undefined, eventos: readonly unknown[]): boolean {
  return objetivo === "evento" && eventos.length === 0;
}

/** Paso 4: lo que la IA necesita para armar el plan (qué no come, zonas, equipo). Todo opcional. */
const preferenciasPaso = preferenciasSchema.default({ noCome: "", zonas: [], equipo: "" });

/** Paso 4 (opcional): una lesión que ya tiene, con el consentimiento para guardarla (spec 011). */
const lesionesPaso = z.array(lesionSchema).max(3).default([]);
const MSG_CONSENTIMIENTO = "Para guardar tu lesión necesitamos tu consentimiento";
const sinConsentimiento = (d: { lesiones: unknown[]; consienteSalud: boolean }) =>
  d.lesiones.length > 0 && !d.consienteSalud;

/** /onboarding: cuenta ya creada, solo perfil + eventos + preferencias (+ lesiones). */
export const onboardingSchema = perfilSchema
  .extend({
    eventos: eventosSchema,
    preferencias: preferenciasPaso,
    lesiones: lesionesPaso,
    consienteSalud: z.boolean().default(false),
  })
  .refine((d) => !sinConsentimiento(d), { message: MSG_CONSENTIMIENTO, path: ["lesiones"] })
  .refine((d) => !faltaEvento(d.preferencias.objetivo, d.eventos), {
    message: MSG_EVENTO,
    path: ["eventos"],
  })
  .refine((d) => !faltaMeta(d.preferencias.objetivo, d.metaPesoKg), {
    message: MSG_META,
    path: ["metaPesoKg"],
  });

/** /signup: el registro completo en un solo envío. */
export const registroSchema = z
  .object({
    cuenta: cuentaSchema,
    perfil: perfilSchema,
    eventos: eventosSchema,
    preferencias: preferenciasPaso,
    lesiones: lesionesPaso,
    consienteSalud: z.boolean().default(false),
    turnstileToken: z.string().min(1, "Completá la verificación anti-bot"),
  })
  .refine((d) => !sinConsentimiento(d), { message: MSG_CONSENTIMIENTO, path: ["lesiones"] })
  .refine((d) => !faltaEvento(d.preferencias.objetivo, d.eventos), {
    message: MSG_EVENTO,
    path: ["eventos"],
  })
  .refine((d) => !faltaMeta(d.preferencias.objetivo, d.perfil.metaPesoKg), {
    message: MSG_META,
    path: ["perfil", "metaPesoKg"],
  });

export type PerfilInput = z.infer<typeof perfilSchema>;
export type EventoInput = z.infer<typeof eventoSchema>;
