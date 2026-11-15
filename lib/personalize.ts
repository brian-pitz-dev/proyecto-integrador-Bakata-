/**
 * Adapta las rutinas compartidas (lib/gym-exercises.ts) al perfil de cada usuario
 * (lib/training-profile.ts). Funciones puras: se usan tanto en Server como en Client
 * Components. Con el perfil por defecto (intermedio · rendimiento · gimnasio) devuelven
 * la rutina original sin cambios.
 *
 * Criterios (notas del curso, claude/notas-ejercicios.md):
 * - Principiantes y mayores de 60: menos series, RIR 3, y la rutina cambia cada 8 semanas
 *   en vez de 4 (más tiempo para aprender la técnica de cada ejercicio).
 * - Avanzados: una serie más en los ejercicios principales.
 * - Objetivo: bajar grasa → más repeticiones y descansos cortos; ganar músculo → 8-12
 *   cerca del fallo; salud → 10-15 con margen; rendimiento → la rutina original.
 * - Lugar: cada ejercicio de máquina o polea tiene su equivalente con mancuernas/banda
 *   o con peso corporal, trabajando la misma zona.
 * El sexo no se usa para elegir ejercicios: solo interviene en el cálculo de calorías.
 */

import {
  ROTATION_WEEKS,
  coreRoutines,
  getGymRoutine,
  getRotation,
  type Exercise,
  type Routine,
} from "@/lib/gym-exercises";
import type { Lugar, TrainingProfile } from "@/lib/training-profile";

type Swap = Partial<Pick<Exercise, "name" | "muscles">>;

/** Equivalentes por ejercicio: [en casa con mancuernas y banda, sin equipamiento]. */
const SWAPS: Record<string, { casa?: Swap; peso_corporal?: Swap }> = {
  "Chest Press": {
    casa: { name: "Press de pecho con mancuernas (en el piso o un banco)" },
    peso_corporal: { name: "Flexiones de brazos (apoyando rodillas si hace falta)" },
  },
  "Incline Press": {
    casa: { name: "Press inclinado con mancuernas (espalda sobre almohadones)" },
    peso_corporal: { name: "Flexiones declinadas (pies en una silla)" },
  },
  "Shoulder Press": {
    casa: { name: "Press de hombros con mancuernas" },
    peso_corporal: { name: "Flexiones pike (cadera bien alta)" },
  },
  "Vuelos laterales (Deltoid Raise)": {
    casa: { name: "Vuelos laterales con mancuernas" },
    peso_corporal: { name: "Plank con toque de hombros", muscles: "Hombros · core" },
  },
  "Vuelos laterales": {
    casa: { name: "Vuelos laterales con mancuernas" },
    peso_corporal: { name: "Plank con toque de hombros", muscles: "Hombros · core" },
  },
  "Extensión de tríceps sobre la cabeza (polea o mancuerna)": {
    casa: { name: "Extensión de tríceps sobre la cabeza con mancuerna" },
    peso_corporal: { name: "Fondos de tríceps en una silla" },
  },
  "Lat Pull Down (al pecho)": {
    casa: { name: "Jalón con banda elástica (anclada arriba)" },
    peso_corporal: { name: "Remo invertido bajo una mesa firme" },
  },
  "Lat Pull Down": {
    casa: { name: "Jalón con banda elástica (anclada arriba)" },
    peso_corporal: { name: "Remo invertido bajo una mesa firme" },
  },
  "Remo sentado en polea (Seated Row)": {
    casa: { name: "Remo inclinado con mancuernas" },
    peso_corporal: { name: "Remo con toalla en el marco de una puerta" },
  },
  "Remo sentado en polea": {
    casa: { name: "Remo inclinado con mancuernas" },
    peso_corporal: { name: "Remo con toalla en el marco de una puerta" },
  },
  "Remo a un brazo con mancuerna": {
    peso_corporal: {
      name: "Superman con remo (boca abajo, llevando los codos atrás)",
      muscles: "Espalda media · lumbares",
    },
  },
  "Face pull en polea (o vuelos posteriores)": {
    casa: { name: "Face pull con banda (o vuelos posteriores con mancuernas)" },
    peso_corporal: { name: "Y-T-W boca abajo" },
  },
  "Face pull en polea": {
    casa: { name: "Face pull con banda" },
    peso_corporal: { name: "Y-T-W boca abajo" },
  },
  "Arm Curl": {
    casa: { name: "Curl de bíceps con mancuernas" },
    peso_corporal: { name: "Curl con toalla (resistiendo con el pie)" },
  },
  "Curl martillo": {
    peso_corporal: { name: "Curl martillo con un bidón o mochila cargada" },
  },
  "Squat con cable (o prensa)": {
    casa: { name: "Sentadilla goblet con mancuerna" },
    peso_corporal: { name: "Sentadilla con peso corporal (pausa de 1 seg abajo)" },
  },
  "Squat con cable": {
    casa: { name: "Sentadilla goblet con mancuerna" },
    peso_corporal: { name: "Sentadilla con peso corporal (pausa de 1 seg abajo)" },
  },
  "Peso muerto rumano con mancuernas": {
    peso_corporal: { name: "Peso muerto rumano a una pierna (sin peso)" },
  },
  "Peso muerto rumano": {
    casa: { name: "Peso muerto rumano con mancuernas" },
    peso_corporal: { name: "Peso muerto rumano a una pierna (sin peso)" },
  },
  "Leg Curl": {
    casa: { name: "Curl femoral deslizando los talones (toalla en el piso)" },
    peso_corporal: { name: "Curl femoral deslizando los talones (toalla en el piso)" },
  },
  "Abducción de cadera (máquina o banda)": {
    casa: { name: "Abducción de cadera con banda" },
    peso_corporal: { name: "Abducción de cadera acostado de lado" },
  },
  "Estocada búlgara": {
    casa: { name: "Estocada búlgara con mancuernas (pie de atrás en una silla)" },
    peso_corporal: { name: "Estocada búlgara (pie de atrás en una silla)" },
  },
  "Elevación de talones sentado": {
    casa: { name: "Elevación de talones sentado (mancuernas sobre las rodillas)" },
    peso_corporal: { name: "Elevación de talones con rodillas flexionadas" },
  },
  "Caminata lateral con banda": {
    peso_corporal: { name: "Caminata lateral en media sentadilla" },
  },
  "Press de pecho con mancuernas (banco plano)": {
    casa: { name: "Press de pecho con mancuernas (en el piso o un banco)" },
    peso_corporal: { name: "Flexiones de brazos (apoyando rodillas si hace falta)" },
  },
  "Press inclinado con mancuernas": {
    peso_corporal: { name: "Flexiones declinadas (pies en una silla)" },
  },
  "Press de hombros con mancuernas sentado": {
    peso_corporal: { name: "Flexiones pike (cadera bien alta)" },
  },
  "Vuelos laterales en polea": {
    casa: { name: "Vuelos laterales con mancuernas" },
    peso_corporal: { name: "Plank con toque de hombros", muscles: "Hombros · core" },
  },
  "Fondos (en paralelas o en banco)": {
    casa: { name: "Fondos de tríceps en una silla" },
    peso_corporal: { name: "Fondos de tríceps en una silla" },
  },
  "Extensión de tríceps en polea con soga": {
    casa: { name: "Patada de tríceps con mancuerna" },
    peso_corporal: { name: "Flexiones diamante (manos juntas)" },
  },
  "Dominadas asistidas (o jalón con agarre neutro)": {
    casa: { name: "Jalón con banda elástica (agarre neutro)" },
    peso_corporal: { name: "Remo invertido bajo una mesa firme" },
  },
  "Remo con barra o remo en T": {
    casa: { name: "Remo inclinado con mancuernas" },
    peso_corporal: { name: "Remo con toalla en el marco de una puerta" },
  },
  "Pull over en polea": {
    casa: { name: "Pull over con mancuerna (acostado)" },
    peso_corporal: { name: "Superman con brazos extendidos", muscles: "Dorsal · lumbares" },
  },
  "Vuelos posteriores en máquina (contractora invertida)": {
    casa: { name: "Vuelos posteriores con mancuernas (torso inclinado)" },
    peso_corporal: { name: "Y-T-W boca abajo" },
  },
  "Curl inclinado con mancuernas": {
    casa: { name: "Curl de bíceps alternado con mancuernas" },
    peso_corporal: { name: "Curl con toalla (resistiendo con el pie)" },
  },
  "Curl invertido": {
    casa: { name: "Curl invertido con mancuernas" },
    peso_corporal: { name: "Curl martillo con un bidón o mochila cargada" },
  },
  "Prensa (pies a media altura)": {
    casa: { name: "Sentadilla goblet con mancuerna" },
    peso_corporal: { name: "Sentadilla con peso corporal (pausa de 1 seg abajo)" },
  },
  "Hip thrust": {
    casa: { name: "Hip thrust con mancuerna (espalda en el sillón)" },
    peso_corporal: { name: "Hip thrust a una pierna (espalda en el sillón)" },
  },
  "Subida al cajón o step": {
    casa: { name: "Subida a una silla o escalón con mancuernas" },
    peso_corporal: { name: "Subida a una silla o escalón" },
  },
  "Leg Curl bajando en 4 seg (o curl nórdico asistido)": {
    casa: { name: "Curl nórdico asistido (pies trabados bajo el sillón)" },
    peso_corporal: { name: "Curl nórdico asistido (pies trabados bajo el sillón)" },
  },
  "Leg Extension": {
    casa: { name: "Extensión de rodilla con banda (sentado)" },
    peso_corporal: { name: "Sentadilla con talones elevados", muscles: "Cuádriceps · rodilla" },
  },
  "Press de banca con barra (o en Smith)": {
    casa: { name: "Press de pecho con mancuernas (en el piso o un banco)" },
    peso_corporal: { name: "Flexiones de brazos (apoyando rodillas si hace falta)" },
  },
  "Press inclinado en máquina": {
    casa: { name: "Press inclinado con mancuernas (espalda sobre almohadones)" },
    peso_corporal: { name: "Flexiones declinadas (pies en una silla)" },
  },
  "Press Arnold con mancuernas": {
    peso_corporal: { name: "Flexiones pike (cadera bien alta)" },
  },
  "Vuelos laterales sentado con mancuernas": {
    peso_corporal: { name: "Plank con toque de hombros", muscles: "Hombros · core" },
  },
  "Cruce de poleas (de arriba hacia abajo)": {
    casa: { name: "Aperturas con mancuernas en el piso" },
    peso_corporal: { name: "Flexiones con manos bien abiertas" },
  },
  "Press francés con barra EZ": {
    casa: { name: "Press francés con mancuernas (acostado)" },
    peso_corporal: { name: "Flexiones diamante (manos juntas)" },
  },
  "Jalón al pecho con agarre cerrado": {
    casa: { name: "Jalón con banda elástica (agarre cerrado)" },
    peso_corporal: { name: "Remo invertido bajo una mesa firme (agarre cerrado)" },
  },
  "Remo en máquina con apoyo de pecho": {
    casa: { name: "Remo inclinado con mancuernas" },
    peso_corporal: { name: "Remo con toalla en el marco de una puerta" },
  },
  "Remo con mancuernas en banco inclinado (pecho apoyado)": {
    casa: { name: "Remo con mancuernas con el pecho apoyado en el respaldo de una silla" },
    peso_corporal: {
      name: "Superman con remo (boca abajo, llevando los codos atrás)",
      muscles: "Espalda alta · lumbares",
    },
  },
  "Face pull con soga": {
    casa: { name: "Face pull con banda" },
    peso_corporal: { name: "Y-T-W boca abajo" },
  },
  "Curl en banco Scott": {
    casa: { name: "Curl concentrado con mancuerna" },
    peso_corporal: { name: "Curl con toalla (resistiendo con el pie)" },
  },
  "Encogimientos con mancuernas": {
    peso_corporal: { name: "Encogimientos con una mochila cargada" },
  },
  "Sentadilla hack (o goblet pesada)": {
    casa: { name: "Sentadilla goblet con mancuerna" },
    peso_corporal: { name: "Sentadilla con peso corporal (pausa de 1 seg abajo)" },
  },
  "Peso muerto rumano a una pierna": {
    casa: { name: "Peso muerto rumano a una pierna con mancuerna" },
    peso_corporal: { name: "Peso muerto rumano a una pierna (sin peso)" },
  },
  "Estocada caminando": {
    casa: { name: "Estocada caminando con mancuernas" },
  },
  "Hip thrust en máquina (o puente con barra)": {
    casa: { name: "Hip thrust con mancuerna (espalda en el sillón)" },
    peso_corporal: { name: "Hip thrust a una pierna (espalda en el sillón)" },
  },
  "Abducción de cadera en polea": {
    casa: { name: "Abducción de cadera con banda" },
    peso_corporal: { name: "Abducción de cadera acostado de lado" },
  },
  "Pallof press en polea": {
    casa: { name: "Pallof press con banda" },
    peso_corporal: { name: "Plank lateral con rotación", muscles: "Oblicuos · core anti-rotación" },
  },
  "Copenhagen plank (apoyo en un banco)": {
    casa: { name: "Copenhagen plank (apoyo en el sillón)" },
    peso_corporal: { name: "Copenhagen plank (apoyo en el sillón)" },
  },
};

const HOME_WARMUPS: [string, string][] = [
  ["5' de bici o elíptico suave", "5' de trote en el lugar o saltos suaves"],
  ["5' de cinta o bici suave", "5' de trote en el lugar o subir escaleras"],
];

function swapExercise(ex: Exercise, lugar: Lugar): Exercise {
  if (lugar === "gimnasio") return ex;
  const swap = SWAPS[ex.name]?.[lugar];
  return swap ? { ...ex, ...swap } : ex;
}

function isCautious(t: TrainingProfile): boolean {
  return t.nivel === "principiante" || t.edad >= 60;
}

/** RIR objetivo según el perfil, o null para respetar el de la rutina. */
function targetRir(t: TrainingProfile): string | null {
  if (isCautious(t) || t.objetivo === "salud") return "RIR 3";
  if (t.objetivo === "ganar_musculo") return t.nivel === "avanzado" ? "RIR 1" : "RIR 1-2";
  return null;
}

/** Reescribe un rango de repeticiones (ej. "8-12") según el objetivo. */
function adjustReps(reps: string, t: TrainingProfile, primary: boolean): string {
  const [lo, hi] = reps.split("-").map(Number);
  const top = hi ?? lo;
  switch (t.objetivo) {
    case "bajar_grasa":
      if (top >= 15) return reps;
      return hi ? "12-15" : String(Math.max(lo, 12));
    case "ganar_musculo":
      return primary && hi ? "8-12" : reps;
    case "salud":
      if (top >= 15) return reps;
      return hi ? "10-15" : String(Math.max(lo, 10));
    default:
      return reps;
  }
}

const SETS_RE = /^(\d+)×(\d+(?:-\d+)?)(.*)$/;

/**
 * Ajusta un string de series ("3×8-12 · RIR 2", "2×10 c/pierna", "3×30-40 seg").
 * `light`: rutinas de descarga y core — solo se ajusta el volumen, no reps ni RIR.
 */
export function adjustSets(
  sets: string,
  t: TrainingProfile,
  { primary, light }: { primary: boolean; light: boolean },
): string {
  const m = sets.match(SETS_RE);
  if (!m) return sets;
  const [, countStr, reps, rest] = m;
  let count = Number(countStr);
  if (isCautious(t)) count = Math.min(count, 2);
  else if (t.nivel === "avanzado" && primary && !light) count = Math.min(count + 1, 4);

  if (light) return `${count}×${reps}${rest}`;

  const timed = /^\s*(seg|pasos)/.test(rest);
  const newReps = timed ? reps : adjustReps(reps, t, primary);

  let newRest = rest;
  const rir = targetRir(t);
  if (rir && !timed) {
    if (/RIR \d(-\d)?/.test(newRest)) newRest = newRest.replace(/RIR \d(-\d)?/, rir);
    else if (primary) newRest = `${newRest} · ${rir}`;
  }
  return `${count}×${newReps}${newRest}`;
}

function profileNotes(t: TrainingProfile): string[] {
  const notes: string[] = [];
  if (t.edad >= 60) {
    notes.push(
      "Movimientos lentos y controlados, sin llegar al fallo. Si aparece dolor articular, pará.",
    );
  } else if (t.nivel === "principiante") {
    notes.push(
      "Primeras semanas: priorizá la técnica con un peso que controles en todo el recorrido.",
    );
  }
  if (t.objetivo === "bajar_grasa") {
    notes.push("Descansá 45-60 seg entre series; si querés, hacé los ejercicios en circuito.");
  } else if (t.objetivo === "ganar_musculo") {
    notes.push(
      "Descansá 90-120 seg. Cuando completes el tope de repeticiones en todas las series, subí un poco el peso.",
    );
  } else if (t.objetivo === "salud") {
    notes.push("Intensidad moderada: terminá cada serie sintiendo que podías hacer 3 más.");
  }
  if (t.lugar === "peso_corporal") {
    notes.push(
      "Si una serie te resulta fácil, hacela más lenta (3 seg bajando) o sumá una mochila con peso.",
    );
  }
  return notes;
}

function personalize(routine: Routine, t: TrainingProfile, light: boolean): Routine {
  const home = t.lugar !== "gimnasio";
  let warmup = routine.warmup;
  if (home && warmup) {
    for (const [from, to] of HOME_WARMUPS) warmup = warmup.replace(from, to);
  }
  const notes = profileNotes(t);
  return {
    ...routine,
    label: home && !routine.label.includes("casa") ? `${routine.label} · en casa` : routine.label,
    warmup,
    notes: notes.length > 0 ? notes : undefined,
    exercises: routine.exercises.map((ex, i) => {
      const swapped = swapExercise(ex, t.lugar);
      return { ...swapped, sets: adjustSets(swapped.sets, t, { primary: i < 2, light }) };
    }),
  };
}

/** Cada cuántas semanas cambia la rutina de gym para este usuario. */
export function rotationWeeksFor(t: TrainingProfile): number {
  return isCautious(t) ? ROTATION_WEEKS * 2 : ROTATION_WEEKS;
}

/** Variante de rutina de la semana y si esa semana empieza una rutina nueva. */
export function getPersonalRotation(weekNum: number, t: TrainingProfile) {
  return getRotation(weekNum, rotationWeeksFor(t));
}

/** Rutina de gym del plan, adaptada al perfil (nivel, objetivo, edad, lugar). */
export function getPersonalRoutine(
  gymKey: string,
  weekNum: number | undefined,
  t: TrainingProfile,
): Routine | undefined {
  const routine = getGymRoutine(gymKey, weekNum, rotationWeeksFor(t));
  return routine ? personalize(routine, t, gymKey.includes("Light")) : undefined;
}

/** Rutina de core del plan (siempre en casa): solo se ajusta el volumen. */
export function getPersonalCoreRoutine(coreKey: string, t: TrainingProfile): Routine | undefined {
  const routine = coreRoutines[coreKey];
  if (!routine) return undefined;
  return {
    ...routine,
    exercises: routine.exercises.map((ex) => ({
      ...ex,
      sets: adjustSets(ex.sets, t, { primary: false, light: true }),
    })),
  };
}
