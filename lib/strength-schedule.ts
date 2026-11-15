/**
 * Qué día de la semana va cada sesión de fuerza. El plan sugiere días por defecto y
 * el usuario puede elegir otros, con una regla: la misma zona del cuerpo (tren superior
 * o tren inferior) no puede tocar dos días seguidos — incluido domingo → lunes de la
 * semana siguiente. El core no cuenta: es trabajo liviano de estabilidad.
 */

import type { DayKey } from "@/lib/training-plan";
import type { DiasGym } from "@/lib/training-profile";

export const WEEK_DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const DAY_SHORT: Record<DayKey, string> = {
  mon: "Lun",
  tue: "Mar",
  wed: "Mié",
  thu: "Jue",
  fri: "Vie",
  sat: "Sáb",
  sun: "Dom",
};

export type StrengthGroup = "sup" | "inf";

export const GROUP_LABEL: Record<StrengthGroup, string> = {
  sup: "Tren superior",
  inf: "Tren inferior",
};

/** Días sugeridos: alternan zonas y dejan el sábado para la salida larga. */
export const DEFAULT_DAYS: Record<DiasGym, DayKey[]> = {
  2: ["mon", "wed"],
  3: ["mon", "wed", "fri"],
  4: ["mon", "tue", "thu", "fri"],
  5: ["mon", "tue", "wed", "thu", "fri"],
};

/** Zonas de cada sesión, en el orden preferido (alternando). */
export const GROUP_PATTERN: Record<DiasGym, StrengthGroup[]> = {
  2: ["sup", "inf"],
  3: ["sup", "inf", "sup"],
  4: ["sup", "inf", "sup", "inf"],
  5: ["sup", "inf", "sup", "inf", "sup"],
};

export function groupOfKey(key: string): StrengthGroup {
  return key.startsWith("inferior") || key === "accesoriosInf" ? "inf" : "sup";
}

function sortDays(days: DayKey[]): DayKey[] {
  return [...days].sort((a, b) => WEEK_DAYS.indexOf(a) - WEEK_DAYS.indexOf(b));
}

/** Permutaciones distintas de un multiconjunto, empezando por el orden dado. */
function* arrangements(groups: StrengthGroup[]): Generator<StrengthGroup[]> {
  if (groups.length <= 1) {
    yield groups;
    return;
  }
  const seen = new Set<StrengthGroup>();
  for (let i = 0; i < groups.length; i++) {
    if (seen.has(groups[i])) continue;
    seen.add(groups[i]);
    const rest = [...groups.slice(0, i), ...groups.slice(i + 1)];
    for (const tail of arrangements(rest)) yield [groups[i], ...tail];
  }
}

function isValid(days: DayKey[], groups: StrengthGroup[]): boolean {
  for (let i = 0; i < days.length; i++) {
    const j = (i + 1) % days.length;
    if (j === i) continue;
    const gap = (WEEK_DAYS.indexOf(days[j]) - WEEK_DAYS.indexOf(days[i]) + 7) % 7;
    if (gap === 1 && groups[i] === groups[j]) return false;
  }
  return true;
}

/** Zona que toca cada día elegido, o null si no hay forma de cumplir la regla. */
export function arrangeGroups(
  days: DayKey[],
  pattern: StrengthGroup[],
): { day: DayKey; group: StrengthGroup }[] | null {
  if (days.length !== pattern.length) return null;
  const sorted = sortDays(days);
  for (const groups of arrangements(pattern)) {
    if (isValid(sorted, groups)) return sorted.map((day, i) => ({ day, group: groups[i] }));
  }
  return null;
}

/** Mensaje de error para el formulario, o null si los días sirven. */
export function validateStrengthDays(diasGym: DiasGym, days: DayKey[]): string | null {
  if (new Set(days).size !== days.length) return "Hay días repetidos.";
  if (days.length !== diasGym) {
    return `Elegí ${diasGym} días (marcaste ${days.length}).`;
  }
  if (!arrangeGroups(days, GROUP_PATTERN[diasGym])) {
    return "Con esos días te tocaría la misma zona dos días seguidos. Dejá al menos un día libre en el medio.";
  }
  return null;
}

/**
 * Reparte las rutinas (`keys`, en orden preferido) en los días elegidos respetando la
 * regla; dentro de cada zona se mantiene el orden original (ej. empuje antes que tirón).
 */
export function assignStrength(
  keys: string[],
  days: DayKey[],
): { day: DayKey; key: string }[] | null {
  const arranged = arrangeGroups(days, keys.map(groupOfKey));
  if (!arranged) return null;
  const queues: Record<StrengthGroup, string[]> = {
    sup: keys.filter((k) => groupOfKey(k) === "sup"),
    inf: keys.filter((k) => groupOfKey(k) === "inf"),
  };
  return arranged.map(({ day, group }) => ({ day, key: queues[group].shift() as string }));
}
