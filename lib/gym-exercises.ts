/**
 * Rutinas de gym y core del plan semanal.
 * Referenciado por Session.gymKey / Session.coreKey en lib/training-plan.ts — las claves
 * (empuje, tiron, inferior, inferiorRun, *Light, base, light) son parte del contrato con
 * el plan y no deben renombrarse.
 *
 * Revisadas con el material del curso de Personal Trainer IFBB (notas en el proyecto:
 * claude/notas-ejercicios.md): cada ejercicio indica qué músculo trabaja; las rutinas
 * cubren pares agonista/antagonista, suman trabajo unilateral, glúteo medio y pantorrillas
 * (clave para correr), e incluyen entrada en calor y vuelta a la calma.
 * La intensidad se indica con RIR ("repeticiones en reserva"): RIR 2 = terminar la serie
 * sintiendo que quedaban 2 repeticiones más.
 */

export interface Exercise {
  name: string;
  sets: string;
  /** Músculo principal y secundarios, en lenguaje simple. */
  muscles?: string;
}

export interface Routine {
  label: string;
  exercises: Exercise[];
  warmup?: string;
  cooldown?: string;
  /** Indicaciones extra según el perfil del usuario (las agrega lib/personalize.ts). */
  notes?: string[];
}

const WARMUP_SUPERIOR =
  "5' de bici o elíptico suave + círculos y rotaciones de hombro + 1 serie liviana del primer ejercicio";
const WARMUP_INFERIOR =
  "5' de cinta o bici suave + movilidad de cadera, rodillas y tobillos + 1 serie liviana del primer ejercicio";
const COOLDOWN =
  "Estirar las zonas trabajadas: 30-45 seg cada una, sin rebote, sintiendo tensión pero no dolor";

export const gymRoutines: Record<string, Routine> = {
  empuje: {
    label: "Empuje — Pecho, hombros y tríceps",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Chest Press",
        sets: "3×8-12 · RIR 2",
        muscles: "Pecho medio · tríceps · hombro anterior",
      },
      { name: "Incline Press", sets: "3×8-12 · RIR 2", muscles: "Pecho alto · hombro anterior" },
      { name: "Shoulder Press", sets: "3×8-12", muscles: "Hombros · tríceps" },
      {
        name: "Vuelos laterales (Deltoid Raise)",
        sets: "3×12-15",
        muscles: "Hombro lateral",
      },
      {
        name: "Extensión de tríceps sobre la cabeza (polea o mancuerna)",
        sets: "3×10-12",
        muscles: "Tríceps (cabeza larga)",
      },
    ],
  },
  tiron: {
    label: "Tirón — Espalda, hombro posterior y bíceps",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Lat Pull Down (al pecho)",
        sets: "3×8-12 · RIR 2",
        muscles: "Dorsal ancho (ancho de espalda) · bíceps",
      },
      {
        name: "Remo sentado en polea (Seated Row)",
        sets: "3×10-12",
        muscles: "Espalda media (grosor) · romboides · trapecio medio",
      },
      {
        name: "Remo a un brazo con mancuerna",
        sets: "3×10 c/lado",
        muscles: "Dorsal y espalda media · a un brazo",
      },
      {
        name: "Face pull en polea (o vuelos posteriores)",
        sets: "3×12-15",
        muscles: "Hombro posterior · manguito rotador · postura",
      },
      { name: "Arm Curl", sets: "2×10-12", muscles: "Bíceps" },
      {
        name: "Curl martillo",
        sets: "2×10-12",
        muscles: "Braquial · antebrazo (agarre)",
      },
    ],
  },
  inferior: {
    label: "Tren inferior — Piernas, glúteos y pantorrillas",
    warmup: WARMUP_INFERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Squat con cable (o prensa)",
        sets: "3×10-12 · RIR 2",
        muscles: "Cuádriceps · glúteo mayor",
      },
      {
        name: "Peso muerto rumano con mancuernas",
        sets: "3×10 · bajando en 3 seg",
        muscles: "Femorales · glúteo · lumbares",
      },
      {
        name: "Estocada hacia atrás",
        sets: "2×10 c/pierna",
        muscles: "Cuádriceps y glúteo · a una pierna (equilibrio)",
      },
      { name: "Leg Curl", sets: "3×10-12 · bajada lenta", muscles: "Femorales" },
      {
        name: "Abducción de cadera (máquina o banda)",
        sets: "2×15",
        muscles: "Glúteo medio (estabiliza la cadera al correr)",
      },
      {
        name: "Elevación de talones de pie",
        sets: "3×12-15",
        muscles: "Gemelos · tendón de Aquiles",
      },
    ],
  },
  inferiorRun: {
    label: "Piernas para correr",
    warmup: WARMUP_INFERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Squat con cable",
        sets: "3×6-8 · pesado · RIR 2",
        muscles: "Cuádriceps · glúteo mayor",
      },
      {
        name: "Peso muerto rumano",
        sets: "3×8 · bajando en 3 seg",
        muscles: "Femorales (previene desgarros) · glúteo",
      },
      {
        name: "Estocada búlgara",
        sets: "2×8 c/pierna",
        muscles: "Cuádriceps y glúteo · a una pierna",
      },
      {
        name: "Elevación de talones sentado",
        sets: "3×15-20",
        muscles: "Sóleo (clave en carreras largas)",
      },
      {
        name: "Caminata lateral con banda",
        sets: "2×12 pasos c/lado",
        muscles: "Glúteo medio (estabiliza la cadera y la rodilla)",
      },
    ],
  },
  empujeLight: {
    label: "Empuje liviano",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      { name: "Chest Press", sets: "2×10 · 60-70% · RIR 4", muscles: "Pecho · tríceps" },
      { name: "Shoulder Press", sets: "2×10 · RIR 4", muscles: "Hombros" },
      { name: "Vuelos laterales", sets: "2×12", muscles: "Hombro lateral" },
    ],
  },
  tironLight: {
    label: "Tirón liviano",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      { name: "Lat Pull Down", sets: "2×10 · 60-70% · RIR 4", muscles: "Dorsal ancho" },
      { name: "Remo sentado en polea", sets: "2×10 · RIR 4", muscles: "Espalda media" },
      { name: "Face pull en polea", sets: "2×15", muscles: "Hombro posterior · postura" },
    ],
  },
  // Sesiones complementarias para quien elige 4-5 días de fuerza: trabajo de bajo
  // impacto que no compite con las rutinas principales ni con las salidas a correr.
  accesoriosSup: {
    label: "Complementos — Hombro posterior, brazos y core",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Face pull en polea (o vuelos posteriores)",
        sets: "3×15",
        muscles: "Hombro posterior · manguito rotador · postura",
      },
      { name: "Vuelos laterales", sets: "3×12-15", muscles: "Hombro lateral" },
      { name: "Curl martillo", sets: "2×12", muscles: "Braquial · antebrazo (agarre)" },
      {
        name: "Extensión de tríceps en polea con soga",
        sets: "2×12-15",
        muscles: "Tríceps",
      },
      {
        name: "Pallof press en polea",
        sets: "2×10 c/lado",
        muscles: "Core anti-rotación (estabilidad al correr)",
      },
    ],
  },
  accesoriosInf: {
    label: "Complementos — Estabilidad para correr",
    warmup: WARMUP_INFERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Abducción de cadera (máquina o banda)",
        sets: "3×15",
        muscles: "Glúteo medio (estabiliza la cadera al correr)",
      },
      {
        name: "Elevación de talones sentado",
        sets: "3×15-20",
        muscles: "Sóleo (clave en carreras largas)",
      },
      {
        name: "Puente de glúteo a una pierna",
        sets: "2×10 c/lado",
        muscles: "Glúteo · femorales · estabilidad de pelvis",
      },
      {
        name: "Estocada hacia atrás",
        sets: "2×8 c/pierna · liviano",
        muscles: "Cuádriceps y glúteo · equilibrio",
      },
      {
        name: "Copenhagen plank (apoyo en un banco)",
        sets: "2×15-20 seg c/lado",
        muscles: "Aductores (protege la ingle y la rodilla)",
      },
    ],
  },
  inferiorLight: {
    label: "Piernas — activación",
    warmup: WARMUP_INFERIOR,
    cooldown: COOLDOWN,
    exercises: [
      { name: "Squat con cable", sets: "2×12 · muy suave", muscles: "Cuádriceps · glúteo" },
      { name: "Puente de glúteo", sets: "2×12 · sin fallo", muscles: "Glúteo mayor" },
      { name: "Caminata lateral con banda", sets: "2×10 pasos c/lado", muscles: "Glúteo medio" },
      { name: "Elevación de talones de pie", sets: "2×15", muscles: "Gemelos" },
    ],
  },
};

/**
 * Variantes B y C: mismas zonas que la versión A, con otros ejercicios y ángulos. El plan
 * rota A → B → C cada ROTATION_WEEKS semanas (principio de "confusión muscular" del curso:
 * cambiar los estímulos para que el cuerpo no se adapte). Principiantes y mayores de 60
 * rotan cada 8 semanas (lib/personalize.ts) para consolidar la técnica. Las rutinas
 * livianas y las de piernas para correr no rotan: priorizan constancia antes del evento.
 */
export const ROTATION_WEEKS = 4;

export const VARIANTS = ["A", "B", "C"] as const;
export type Variant = (typeof VARIANTS)[number];

/** Variante que toca en una semana del plan, y si esa semana arranca un bloque nuevo. */
export function getRotation(
  weekNum: number,
  rotationWeeks = ROTATION_WEEKS,
): { variant: Variant; blockStart: number; blockEnd: number; isNewBlock: boolean } {
  const block = Math.floor((Math.max(weekNum, 1) - 1) / rotationWeeks);
  const blockStart = block * rotationWeeks + 1;
  return {
    variant: VARIANTS[block % VARIANTS.length],
    blockStart,
    blockEnd: blockStart + rotationWeeks - 1,
    isNewBlock: block > 0 && weekNum === blockStart,
  };
}

const gymRoutinesB: Record<string, Routine> = {
  empuje: {
    label: "Empuje B — Pecho, hombros y tríceps",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Press de pecho con mancuernas (banco plano)",
        sets: "3×8-12 · RIR 2",
        muscles: "Pecho medio · tríceps · cada brazo trabaja solo",
      },
      {
        name: "Press inclinado con mancuernas",
        sets: "3×8-12 · RIR 2",
        muscles: "Pecho alto · hombro anterior",
      },
      {
        name: "Press de hombros con mancuernas sentado",
        sets: "3×10",
        muscles: "Hombros · tríceps",
      },
      { name: "Vuelos laterales en polea", sets: "3×12-15 c/lado", muscles: "Hombro lateral" },
      { name: "Fondos (en paralelas o en banco)", sets: "3×8-12", muscles: "Tríceps · pecho bajo" },
      {
        name: "Extensión de tríceps en polea con soga",
        sets: "2×12-15",
        muscles: "Tríceps (cabezas lateral y medial)",
      },
    ],
  },
  tiron: {
    label: "Tirón B — Espalda, hombro posterior y bíceps",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Dominadas asistidas (o jalón con agarre neutro)",
        sets: "3×6-10 · RIR 2",
        muscles: "Dorsal ancho · bíceps · abdomen",
      },
      {
        name: "Remo con barra o remo en T",
        sets: "3×8-10 · RIR 2",
        muscles: "Espalda media (grosor) · lumbares",
      },
      { name: "Pull over en polea", sets: "2×12-15", muscles: "Dorsal ancho (aislado)" },
      {
        name: "Vuelos posteriores en máquina (contractora invertida)",
        sets: "3×12-15",
        muscles: "Hombro posterior · postura",
      },
      {
        name: "Curl inclinado con mancuernas",
        sets: "2×10-12",
        muscles: "Bíceps (cabeza larga, más estiramiento)",
      },
      { name: "Curl invertido", sets: "2×12-15", muscles: "Antebrazo · braquial (agarre)" },
    ],
  },
  inferior: {
    label: "Tren inferior B — Piernas, glúteos y pantorrillas",
    warmup: WARMUP_INFERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Prensa (pies a media altura)",
        sets: "3×10-12 · RIR 2",
        muscles: "Cuádriceps · glúteo",
      },
      { name: "Hip thrust", sets: "3×10-12", muscles: "Glúteo mayor" },
      {
        name: "Subida al cajón o step",
        sets: "2×10 c/pierna",
        muscles: "Cuádriceps y glúteo · a una pierna",
      },
      {
        name: "Leg Curl bajando en 4 seg (o curl nórdico asistido)",
        sets: "3×6-8",
        muscles: "Femorales en excéntrico (previene desgarros)",
      },
      {
        name: "Leg Extension",
        sets: "2×12-15",
        muscles: "Cuádriceps (estabiliza la rodilla)",
      },
      {
        name: "Elevación de talones sentado",
        sets: "3×15-20",
        muscles: "Sóleo (clave en carreras largas)",
      },
    ],
  },
};

/** Variantes C: tercera vuelta de estímulos (barra, máquinas con apoyo, trabajo unilateral). */
const gymRoutinesC: Record<string, Routine> = {
  empuje: {
    label: "Empuje C — Pecho, hombros y tríceps",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Press de banca con barra (o en Smith)",
        sets: "4×6-8 · RIR 2",
        muscles: "Pecho · tríceps · hombro anterior",
      },
      {
        name: "Press inclinado en máquina",
        sets: "3×10-12 · RIR 2",
        muscles: "Pecho alto · hombro anterior",
      },
      {
        name: "Press Arnold con mancuernas",
        sets: "3×10",
        muscles: "Hombros (las tres porciones)",
      },
      {
        name: "Vuelos laterales sentado con mancuernas",
        sets: "3×12-15",
        muscles: "Hombro lateral (sin impulso)",
      },
      {
        name: "Cruce de poleas (de arriba hacia abajo)",
        sets: "2×12-15",
        muscles: "Pecho (aislado, parte baja)",
      },
      { name: "Press francés con barra EZ", sets: "2×10-12", muscles: "Tríceps (cabeza larga)" },
    ],
  },
  tiron: {
    label: "Tirón C — Espalda, hombro posterior y bíceps",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Jalón al pecho con agarre cerrado",
        sets: "3×8-12 · RIR 2",
        muscles: "Dorsal ancho (parte baja) · bíceps",
      },
      {
        name: "Remo en máquina con apoyo de pecho",
        sets: "3×10-12 · RIR 2",
        muscles: "Espalda media · romboides (sin cargar la zona lumbar)",
      },
      {
        name: "Remo con mancuernas en banco inclinado (pecho apoyado)",
        sets: "2×12",
        muscles: "Espalda alta · trapecio medio",
      },
      {
        name: "Face pull con soga",
        sets: "3×15",
        muscles: "Hombro posterior · manguito rotador · postura",
      },
      { name: "Curl en banco Scott", sets: "2×10-12", muscles: "Bíceps (sin balanceo)" },
      { name: "Encogimientos con mancuernas", sets: "2×12-15", muscles: "Trapecio superior" },
    ],
  },
  inferior: {
    label: "Tren inferior C — Piernas, glúteos y pantorrillas",
    warmup: WARMUP_INFERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Sentadilla hack (o goblet pesada)",
        sets: "3×8-10 · RIR 2",
        muscles: "Cuádriceps · glúteo",
      },
      {
        name: "Peso muerto rumano a una pierna",
        sets: "3×8 c/pierna",
        muscles: "Femorales · glúteo · equilibrio",
      },
      {
        name: "Estocada caminando",
        sets: "2×10 c/pierna",
        muscles: "Cuádriceps y glúteo · a una pierna",
      },
      {
        name: "Hip thrust en máquina (o puente con barra)",
        sets: "3×10-12",
        muscles: "Glúteo mayor",
      },
      {
        name: "Abducción de cadera en polea",
        sets: "2×12 c/lado",
        muscles: "Glúteo medio (estabiliza la cadera al correr)",
      },
      {
        name: "Elevación de talones a una pierna",
        sets: "3×12 c/pierna",
        muscles: "Gemelos · tendón de Aquiles",
      },
    ],
  },
};

const VARIANT_ROUTINES: Record<Variant, Record<string, Routine>> = {
  A: {},
  B: gymRoutinesB,
  C: gymRoutinesC,
};

/** Si la rutina cambia de variante con las semanas (las livianas y las de complementos no). */
export function routineRotates(gymKey: string): boolean {
  return gymKey === "superior" || gymKey in gymRoutinesB;
}

/** Rutina de gym para una semana del plan: rota A → B → C cada `rotationWeeks` semanas. */
export function getGymRoutine(
  gymKey: string,
  weekNum?: number,
  rotationWeeks = ROTATION_WEEKS,
): Routine | undefined {
  if (gymKey === "superior" || gymKey === "superiorLight") {
    return superiorRoutine(gymKey, weekNum, rotationWeeks);
  }
  const variant = weekNum !== undefined ? getRotation(weekNum, rotationWeeks).variant : "A";
  return VARIANT_ROUTINES[variant][gymKey] ?? gymRoutines[gymKey];
}

/**
 * Tren superior completo en una sola sesión (para quien entrena fuerza 2 días por semana):
 * se arma intercalando los ejercicios principales de empuje y tirón de la misma variante,
 * así cada sesión cubre los pares agonista/antagonista sin duplicar contenido.
 */
function superiorRoutine(
  key: "superior" | "superiorLight",
  weekNum: number | undefined,
  rotationWeeks: number,
): Routine | undefined {
  const light = key === "superiorLight";
  const push = getGymRoutine(light ? "empujeLight" : "empuje", weekNum, rotationWeeks);
  const pull = getGymRoutine(light ? "tironLight" : "tiron", weekNum, rotationWeeks);
  if (!push || !pull) return undefined;
  const order: [Routine, number][] = light
    ? [
        [push, 0],
        [pull, 0],
        [push, 1],
        [pull, 1],
      ]
    : [
        [push, 0],
        [pull, 0],
        [push, 2],
        [pull, 1],
        [push, 3],
        [pull, 3],
      ];
  return {
    label: light
      ? "Tren superior liviano"
      : `Tren superior${weekNum !== undefined && getRotation(weekNum, rotationWeeks).variant !== "A" ? ` ${getRotation(weekNum, rotationWeeks).variant}` : ""} — Empuje y tirón`,
    warmup: push.warmup,
    cooldown: push.cooldown,
    exercises: order.map(([r, i]) => r.exercises[i]).filter(Boolean),
  };
}

export const coreRoutines: Record<string, Routine> = {
  base: {
    label: "Rutina base — Core en casa",
    cooldown: "Gato-vaca y postura del niño: 30 seg cada una",
    exercises: [
      { name: "Plank frontal", sets: "3×30-40 seg", muscles: "Abdomen profundo (estabilidad)" },
      { name: "Plank lateral", sets: "2×25-30 seg c/lado", muscles: "Oblicuos · glúteo medio" },
      { name: "Dead bug", sets: "3×8-10 reps", muscles: "Abdomen profundo · coordinación" },
      { name: "Crunch invertido", sets: "2×10-12 reps", muscles: "Recto abdominal (parte baja)" },
      { name: "Bird dog", sets: "2×10 reps c/lado", muscles: "Lumbares · glúteo · estabilidad" },
      {
        name: "Puente de glúteo a una pierna",
        sets: "2×10 c/lado",
        muscles: "Glúteo · femorales · estabilidad de pelvis",
      },
    ],
  },
  light: {
    label: "Core liviano — semana descarga",
    cooldown: "Gato-vaca y postura del niño: 30 seg cada una",
    exercises: [
      { name: "Plank frontal", sets: "2×25 seg", muscles: "Abdomen profundo" },
      { name: "Plank lateral", sets: "2×20 seg c/lado", muscles: "Oblicuos" },
      { name: "Dead bug", sets: "2×8 reps", muscles: "Abdomen profundo" },
      { name: "Glute bridge", sets: "2×12 reps", muscles: "Glúteo" },
    ],
  },
};
