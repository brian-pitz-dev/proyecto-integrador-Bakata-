/**
 * Rutinas de gym y core del plan semanal.
 * Referenciado por Session.gymKey / Session.coreKey en lib/training-plan.ts y por las rutinas
 * generadas con IA (lib/validation/coach.ts GYM_KEYS) — las claves (empuje, tiron, inferior,
 * inferiorRun, *Light, base, light) son parte del contrato y no deben renombrarse.
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
        name: "Press de pecho en máquina",
        sets: "3×8-12 · RIR 2",
        muscles: "Pecho medio · tríceps · hombro anterior",
      },
      {
        name: "Press de pecho inclinado en máquina",
        sets: "3×8-12 · RIR 2",
        muscles: "Pecho alto · hombro anterior",
      },
      { name: "Press de hombros en máquina", sets: "3×8-12", muscles: "Hombros · tríceps" },
      {
        name: "Vuelos laterales",
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
        name: "Jalón al pecho",
        sets: "3×8-12 · RIR 2",
        muscles: "Dorsal ancho (ancho de espalda) · bíceps",
      },
      {
        name: "Remo sentado en polea",
        sets: "3×10-12",
        muscles: "Espalda media (grosor) · romboides · trapecio medio",
      },
      {
        name: "Remo a un brazo con mancuerna",
        sets: "3×10 c/lado",
        muscles: "Dorsal y espalda media · a un brazo",
      },
      {
        name: "Jalón a la cara en polea (o vuelos posteriores)",
        sets: "3×12-15",
        muscles: "Hombro posterior · manguito rotador · postura",
      },
      { name: "Curl de bíceps en máquina", sets: "2×10-12", muscles: "Bíceps" },
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
        name: "Sentadilla con polea (o prensa)",
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
      { name: "Curl femoral en máquina", sets: "3×10-12 · bajada lenta", muscles: "Femorales" },
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
        name: "Sentadilla con polea",
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
      {
        name: "Press de pecho en máquina",
        sets: "2×10 · 60-70% · RIR 4",
        muscles: "Pecho · tríceps",
      },
      { name: "Press de hombros en máquina", sets: "2×10 · RIR 4", muscles: "Hombros" },
      { name: "Vuelos laterales", sets: "2×12", muscles: "Hombro lateral" },
    ],
  },
  tironLight: {
    label: "Tirón liviano",
    warmup: WARMUP_SUPERIOR,
    cooldown: COOLDOWN,
    exercises: [
      { name: "Jalón al pecho", sets: "2×10 · 60-70% · RIR 4", muscles: "Dorsal ancho" },
      { name: "Remo sentado en polea", sets: "2×10 · RIR 4", muscles: "Espalda media" },
      { name: "Jalón a la cara en polea", sets: "2×15", muscles: "Hombro posterior · postura" },
    ],
  },
  // Sesiones complementarias para quien elige 4-5 días de fuerza: trabajo de bajo
  // impacto que no compite con las rutinas principales ni con las salidas a correr.
  inferiorLight: {
    label: "Piernas — activación",
    warmup: WARMUP_INFERIOR,
    cooldown: COOLDOWN,
    exercises: [
      { name: "Sentadilla con polea", sets: "2×12 · muy suave", muscles: "Cuádriceps · glúteo" },
      { name: "Puente de glúteo", sets: "2×12 · sin fallo", muscles: "Glúteo mayor" },
      { name: "Caminata lateral con banda", sets: "2×10 pasos c/lado", muscles: "Glúteo medio" },
      { name: "Elevación de talones de pie", sets: "2×15", muscles: "Gemelos" },
    ],
  },
};

/**
 * Variantes B y C: mismas zonas que la versión A, con otros ejercicios y ángulos. El plan
 * rota A → B → C cada ROTATION_WEEKS semanas (principio de "confusión muscular" del curso:
 * cambiar los estímulos para que el cuerpo no se adapte). Las rutinas
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
      {
        name: "Jalón con brazos extendidos en polea",
        sets: "2×12-15",
        muscles: "Dorsal ancho (aislado)",
      },
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
      { name: "Empuje de cadera con barra", sets: "3×10-12", muscles: "Glúteo mayor" },
      {
        name: "Subida al cajón o escalón",
        sets: "2×10 c/pierna",
        muscles: "Cuádriceps y glúteo · a una pierna",
      },
      {
        name: "Curl femoral bajando en 4 seg (o curl nórdico asistido)",
        sets: "3×6-8",
        muscles: "Femorales en excéntrico (previene desgarros)",
      },
      {
        name: "Extensión de cuádriceps en máquina",
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
        name: "Press de banca con barra (o en máquina guiada)",
        sets: "4×6-8 · RIR 2",
        muscles: "Pecho · tríceps · hombro anterior",
      },
      {
        name: "Press inclinado en máquina",
        sets: "3×10-12 · RIR 2",
        muscles: "Pecho alto · hombro anterior",
      },
      {
        name: "Press de hombros con giro, con mancuernas",
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
      { name: "Press francés con barra W", sets: "2×10-12", muscles: "Tríceps (cabeza larga)" },
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
        name: "Jalón a la cara con soga",
        sets: "3×15",
        muscles: "Hombro posterior · manguito rotador · postura",
      },
      {
        name: "Curl de bíceps en banco predicador",
        sets: "2×10-12",
        muscles: "Bíceps (sin balanceo)",
      },
      { name: "Encogimientos con mancuernas", sets: "2×12-15", muscles: "Trapecio superior" },
    ],
  },
  inferior: {
    label: "Tren inferior C — Piernas, glúteos y pantorrillas",
    warmup: WARMUP_INFERIOR,
    cooldown: COOLDOWN,
    exercises: [
      {
        name: "Sentadilla en máquina inclinada (o sentadilla copa pesada)",
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
        name: "Empuje de cadera en máquina (o puente con barra)",
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

/** Si la rutina cambia de variante con las semanas (las livianas y las de piernas para correr no). */
export function routineRotates(gymKey: string): boolean {
  return gymKey in gymRoutinesB;
}

/** Rutina de gym para una semana del plan: rota A → B → C cada `rotationWeeks` semanas. */
export function getGymRoutine(
  gymKey: string,
  weekNum?: number,
  rotationWeeks = ROTATION_WEEKS,
): Routine | undefined {
  const variant = weekNum !== undefined ? getRotation(weekNum, rotationWeeks).variant : "A";
  return VARIANT_ROUTINES[variant][gymKey] ?? gymRoutines[gymKey];
}

export const coreRoutines: Record<string, Routine> = {
  base: {
    label: "Rutina base — Core en casa",
    cooldown: "Gato-vaca y postura del niño: 30 seg cada una",
    exercises: [
      { name: "Plancha frontal", sets: "3×30-40 seg", muscles: "Abdomen profundo (estabilidad)" },
      { name: "Plancha lateral", sets: "2×25-30 seg c/lado", muscles: "Oblicuos · glúteo medio" },
      {
        name: "Bicho muerto (boca arriba, brazo y pierna opuestos)",
        sets: "3×8-10 reps",
        muscles: "Abdomen profundo · coordinación",
      },
      {
        name: "Abdominal invertido",
        sets: "2×10-12 reps",
        muscles: "Recto abdominal (parte baja)",
      },
      {
        name: "Perro de caza (en cuatro apoyos, brazo y pierna opuestos)",
        sets: "2×10 reps c/lado",
        muscles: "Lumbares · glúteo · estabilidad",
      },
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
      { name: "Plancha frontal", sets: "2×25 seg", muscles: "Abdomen profundo" },
      { name: "Plancha lateral", sets: "2×20 seg c/lado", muscles: "Oblicuos" },
      {
        name: "Bicho muerto (boca arriba, brazo y pierna opuestos)",
        sets: "2×8 reps",
        muscles: "Abdomen profundo",
      },
      { name: "Puente de glúteo", sets: "2×12 reps", muscles: "Glúteo" },
    ],
  },
};
