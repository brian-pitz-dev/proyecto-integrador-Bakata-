import { createClient } from "@/lib/supabase/server";
import { getPhaseKeyForDate, type Week } from "@/lib/training-plan";
import type { Registro } from "@/lib/types";
import { toISO } from "@/lib/date";

export interface UserProfile {
  edad: number;
  alturaCm: number;
  sexo: "M" | "F";
  factorActividad: number;
  calibracionPesoKg?: number | null;
  calibracionBmrKcal?: number | null;
  /** Peso al que quiere llegar: decide si se come en déficit, en superávit o en mantenimiento. */
  metaPesoKg?: number | null;
  /** Peso del onboarding: se usa mientras no haya ningún peso registrado. */
  pesoInicialKg?: number | null;
}

/** Mifflin-St Jeor: +5 para hombres, -161 para mujeres. */
function mifflin(peso: number, profile: UserProfile): number {
  const base = 10 * peso + 6.25 * profile.alturaCm - 5 * profile.edad;
  return profile.sexo === "M" ? base + 5 : base - 161;
}

/** BMR calibrado con una referencia real (ej. InBody) si el usuario la cargó; si no, Mifflin-St Jeor puro. */
export function computeBmrCalibrado(peso: number, profile: UserProfile): number {
  const factor =
    profile.calibracionPesoKg && profile.calibracionBmrKcal
      ? profile.calibracionBmrKcal / mifflin(profile.calibracionPesoKg, profile)
      : 1;
  return mifflin(peso, profile) * factor;
}

const deficitPorFase: Record<string, number> = {
  p1: 400,
  p2: 350,
  p3: 130, // reactivación post-evento: priorizar recuperación sobre bajar de peso
  p4: 150, // construcción carrera larga: casi mantenimiento, energía para sostener la carga
  p5: 100, // tapering: casi mantenimiento + carga de carbohidratos
  p6: 550,
};

/** Déficit del día según la fase del plan; 400 si la fecha cae fuera del plan. */
export function deficitDeFase(phaseKey: string | null): number {
  return (phaseKey && deficitPorFase[phaseKey]) || 400;
}

/** Superávit para ganar músculo sin sumar mucha grasa (~0,25 kg por semana). */
export const SUPERAVIT_KCAL = 250;
/** Diferencia con la meta (kg) por debajo de la cual se considera que ya llegó: mantenimiento. */
const TOLERANCIA_META_KG = 0.5;

export type ObjetivoCalorico = "bajar" | "subir" | "mantener";

/** Qué busca la persona según su meta de peso (sin meta = mantener). */
export function objetivoCalorico(
  pesoActual: number,
  metaPesoKg: number | null | undefined,
): ObjetivoCalorico {
  if (metaPesoKg == null) return "mantener";
  if (metaPesoKg < pesoActual - TOLERANCIA_META_KG) return "bajar";
  if (metaPesoKg > pesoActual + TOLERANCIA_META_KG) return "subir";
  return "mantener";
}

/**
 * Kcal que se restan al gasto del día (negativo = superávit): déficit por fase para bajar,
 * superávit fijo para subir, 0 para mantener.
 */
export function ajusteCalorico(objetivo: ObjetivoCalorico, phaseKey: string | null): number {
  if (objetivo === "bajar") return deficitDeFase(phaseKey);
  if (objetivo === "subir") return -SUPERAVIT_KCAL;
  return 0;
}

export interface CalorieTarget {
  meta: number;
  gastoCalorico: number;
  /** Kcal restadas al gasto (negativo = superávit). */
  deficit: number;
  /** Bajar, subir o mantener el peso, según la meta del perfil. */
  objetivo: ObjetivoCalorico;
  fuente: "xiaomi" | "estimado";
  /** Último peso registrado: lo usa Nutrición para el umbral/objetivo de proteína. */
  pesoKg: number;
}

/** Equivalente a getCalorieTarget() de plan_vida_2026.html, generalizado por usuario. */
export async function getCalorieTarget(
  dateObj: Date,
  profile: UserProfile,
  weeks: Week[],
): Promise<CalorieTarget | null> {
  const phaseKey = getPhaseKeyForDate(weeks, dateObj);
  const fechaISO = toISO(dateObj);
  const supabase = await createClient();

  const [{ data: logDelDia }, { data: pesoLogs }] = await Promise.all([
    supabase
      .from("registro")
      .select("*")
      .eq("categoria", "calorias")
      .eq("fecha", fechaISO)
      // varios registros el mismo día: vale el último cargado (igual en todas las consultas de registro)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<Registro>(),
    supabase
      .from("registro")
      .select("*")
      .eq("categoria", "peso")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  // sin pesajes registrados todavía: vale el peso que cargó en el onboarding
  const pesoActual =
    pesoLogs && pesoLogs.length > 0
      ? Number((pesoLogs[0] as Registro).valor)
      : (profile.pesoInicialKg ?? null);
  if (!pesoActual || !(pesoActual > 0)) return null;
  return calcularMeta(pesoActual, logDelDia ? Number(logDelDia.valor) : null, profile, phaseKey);
}

/**
 * La meta del día con datos ya cargados (getCalorieTarget los busca; Estadísticas ya los tiene y
 * se ahorra un viaje a Supabase). `activasDelDia`: calorías activas registradas ese día, o null.
 */
export function calcularMeta(
  pesoActual: number,
  activasDelDia: number | null,
  profile: UserProfile,
  phaseKey: string | null,
): CalorieTarget {
  const bmrCalibrado = computeBmrCalibrado(pesoActual, profile);
  const xiaomi = activasDelDia !== null;
  const gastoCalorico = xiaomi
    ? bmrCalibrado + activasDelDia
    : bmrCalibrado * profile.factorActividad;
  const objetivo = objetivoCalorico(pesoActual, profile.metaPesoKg);
  const deficit = ajusteCalorico(objetivo, phaseKey);
  return {
    meta: Math.round(gastoCalorico - deficit),
    gastoCalorico: Math.round(gastoCalorico),
    deficit,
    objetivo,
    fuente: xiaomi ? "xiaomi" : "estimado",
    pesoKg: pesoActual,
  };
}
