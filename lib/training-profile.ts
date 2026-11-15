/**
 * Datos de entrenamiento de cada usuario (columnas nivel/objetivo/dias_gym/lugar de
 * `perfil`, migración 20261115120000_perfil_entrenamiento.sql). Con ellos se adapta
 * la plantilla compartida del plan (lib/personalize.ts): la metodología sigue siendo
 * la misma para todos, pero el volumen, las repeticiones, los días de fuerza y los
 * ejercicios cambian según la persona.
 *
 * Los valores por defecto reproducen exactamente el plan original, así que un usuario
 * que todavía no cargó estos datos ve lo mismo que antes.
 */

import type { DayKey } from "@/lib/training-plan";

const DAY_KEYS: readonly DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const NIVELES = ["principiante", "intermedio", "avanzado"] as const;
export const OBJETIVOS = ["bajar_grasa", "ganar_musculo", "rendimiento", "salud"] as const;
export const LUGARES = ["gimnasio", "casa", "peso_corporal"] as const;
export const DIAS_GYM = [2, 3, 4, 5] as const;

export type Nivel = (typeof NIVELES)[number];
export type Objetivo = (typeof OBJETIVOS)[number];
export type Lugar = (typeof LUGARES)[number];
export type DiasGym = (typeof DIAS_GYM)[number];

export interface TrainingProfile {
  nivel: Nivel;
  objetivo: Objetivo;
  diasGym: DiasGym;
  /** Días elegidos para fuerza (lun..dom); null = los sugeridos (DEFAULT_DAYS). */
  diasFuerza: DayKey[] | null;
  /** Días de una semana puntual (clave: lunes ISO de esa semana); pisa a diasFuerza. */
  diasFuerzaSemana: Record<string, DayKey[]>;
  lugar: Lugar;
  edad: number;
}

export const DEFAULT_TRAINING: Omit<TrainingProfile, "edad"> = {
  nivel: "intermedio",
  objetivo: "rendimiento",
  diasGym: 3,
  diasFuerza: null,
  diasFuerzaSemana: {},
  lugar: "gimnasio",
};

export const NIVEL_LABELS: Record<Nivel, { label: string; hint: string }> = {
  principiante: { label: "Principiante", hint: "Nunca entrené fuerza o hace mucho que no" },
  intermedio: { label: "Intermedio", hint: "Entreno hace unos meses y conozco la técnica" },
  avanzado: { label: "Avanzado", hint: "Entreno hace más de un año de forma constante" },
};

export const OBJETIVO_LABELS: Record<Objetivo, { label: string; hint: string }> = {
  bajar_grasa: { label: "Bajar grasa", hint: "Más repeticiones y descansos cortos" },
  ganar_musculo: { label: "Ganar músculo", hint: "Series cerca del fallo, cargas progresivas" },
  rendimiento: { label: "Rendir en mis eventos", hint: "Fuerza al servicio de correr y caminar" },
  salud: { label: "Salud y bienestar", hint: "Intensidad moderada, sin ir al límite" },
};

export const LUGAR_LABELS: Record<Lugar, { label: string; hint: string }> = {
  gimnasio: { label: "En el gimnasio", hint: "Máquinas, poleas y pesos libres" },
  casa: { label: "En casa con mancuernas", hint: "Mancuernas y una banda elástica" },
  peso_corporal: { label: "Sin equipamiento", hint: "Solo peso corporal" },
};

function pick<T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/** Lee las columnas de `perfil` tolerando filas viejas (antes de la migración) o valores inválidos. */
export function trainingProfileFromRow(
  row: Record<string, unknown>,
  edad: number,
): TrainingProfile {
  return {
    nivel: pick(row.nivel, NIVELES, DEFAULT_TRAINING.nivel),
    objetivo: pick(row.objetivo, OBJETIVOS, DEFAULT_TRAINING.objetivo),
    diasGym: pick(Number(row.dias_gym), DIAS_GYM, DEFAULT_TRAINING.diasGym),
    diasFuerza: parseDays(row.dias_fuerza),
    diasFuerzaSemana: parseWeekDays(row.dias_fuerza_semana),
    lugar: pick(row.lugar, LUGARES, DEFAULT_TRAINING.lugar),
    edad,
  };
}

function parseDays(value: unknown): DayKey[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const days = value.filter((d): d is DayKey => DAY_KEYS.includes(d as DayKey));
  return days.length === value.length ? days : null;
}

function parseWeekDays(value: unknown): Record<string, DayKey[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, DayKey[]> = {};
  for (const [week, days] of Object.entries(value)) {
    const parsed = parseDays(days);
    if (/^\d{4}-\d{2}-\d{2}$/.test(week) && parsed) out[week] = parsed;
  }
  return out;
}
