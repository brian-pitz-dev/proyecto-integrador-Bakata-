/**
 * Rutinas de mancuernas para hacer en casa (pausas de Pomodoro o días sin gym).
 * No forman parte del plan semanal (lib/training-plan.ts), pero `suggestDumbbellRoutine`
 * elige cuál conviene según lo que el plan tiene para ese día.
 *
 * Basadas en el material del curso de Personal Trainer IFBB (clase "Funcional y en casa";
 * notas en el proyecto: claude/notas-ejercicios.md): circuitos cortos, cadencia
 * controlada, trabajo unilateral para sumar intensidad sin más peso, y objetos de la casa
 * (mochila, bidón, botellas) si no hay mancuernas.
 */

import type { Session } from "@/lib/training-plan";

export interface DumbbellExercise {
  name: string;
  sets: string;
  /** Músculo principal y secundarios, en lenguaje simple. */
  muscles: string;
  description: string;
}

export interface DumbbellRoutine {
  label: string;
  /** Para qué sirve, en una línea. */
  goal: string;
  /** Cómo se hace: series, circuito, descansos, cadencia, duración. */
  format: string;
  exercises: DumbbellExercise[];
}

export const dumbbellRoutines = {
  postura: {
    label: "Espalda y postura",
    goal: "Compensa las horas sentado: espalda, hombro posterior y lumbares.",
    format: "3 series · 45 seg de descanso · bajar en 3 seg, subir en 1 · ~10 min",
    exercises: [
      {
        name: "Remo a un brazo",
        sets: "3×12 c/lado",
        muscles: "Dorsal · espalda media",
        description:
          "Apoyar una mano y una rodilla en una silla o banco, espalda recta. Llevar la mancuerna hacia la cadera con el codo pegado al cuerpo y bajar controlado.",
      },
      {
        name: "Vuelos posteriores",
        sets: "3×12-15",
        muscles: "Hombro posterior · romboides",
        description:
          "Inclinado hacia adelante con espalda recta, brazos colgando y codos apenas flexionados. Abrir los brazos hacia los costados juntando los omóplatos y bajar lento.",
      },
      {
        name: "Pull over acostado",
        sets: "2×12",
        muscles: "Dorsal · serrato",
        description:
          "Acostado boca arriba, una mancuerna con ambas manos sobre el pecho. Llevarla por detrás de la cabeza con los brazos casi estirados hasta sentir el estiramiento y volver.",
      },
      {
        name: "Superman",
        sets: "2×10 · 2 seg arriba",
        muscles: "Lumbares · glúteo",
        description:
          "Boca abajo con brazos estirados adelante. Despegar a la vez brazos, pecho y piernas del piso, sostener 2 segundos y bajar.",
      },
    ],
  },
  inferiorGluteos: {
    label: "Piernas y glúteos",
    goal: "Fuerza de piernas con foco en glúteo y femorales, lo que más protege la rodilla al correr.",
    format: "Circuito de 3 vueltas · sin pausa entre ejercicios · 1-2 min entre vueltas · ~12 min",
    exercises: [
      {
        name: "Sentadilla goblet",
        sets: "12",
        muscles: "Cuádriceps · glúteo",
        description:
          "Una mancuerna contra el pecho. Bajar como si te sentaras, espalda recta y rodillas en línea con los pies, hasta que los muslos queden paralelos al piso, y subir.",
      },
      {
        name: "Peso muerto rumano",
        sets: "10 · bajando en 3 seg",
        muscles: "Femorales · glúteo · lumbares",
        description:
          "Mancuernas frente a los muslos, rodillas apenas flexionadas. Llevar la cadera hacia atrás bajando las pesas pegadas a las piernas hasta sentir el estiramiento atrás del muslo, y subir apretando el glúteo.",
      },
      {
        name: "Estocada hacia atrás",
        sets: "10 c/pierna",
        muscles: "Cuádriceps y glúteo · a una pierna",
        description:
          "Dar un paso largo hacia atrás y bajar hasta que ambas rodillas queden en 90°, con el torso derecho. Empujar con la pierna de adelante para volver.",
      },
      {
        name: "Puente de glúteo a una pierna",
        sets: "12 c/lado",
        muscles: "Glúteo mayor y medio · estabilidad de pelvis",
        description:
          "Boca arriba, un pie apoyado y la otra pierna estirada. Subir la cadera apretando el glúteo hasta formar una línea recta, sin que la pelvis se incline, y bajar.",
      },
      {
        name: "Elevación de talones",
        sets: "15 · 1 seg arriba",
        muscles: "Gemelos · sóleo",
        description:
          "Parado en el borde de un escalón con una mancuerna en la mano. Subir en puntas de pie lo más alto posible, sostener 1 segundo y bajar despacio por debajo del escalón.",
      },
    ],
  },
  superior: {
    label: "Tren superior",
    goal: "Pecho, hombros y brazos equilibrados, sin olvidar el hombro posterior.",
    format: "3 series · 45 seg de descanso · bajar en 3 seg, subir en 1 · ~12 min",
    exercises: [
      {
        name: "Press de pecho en el piso",
        sets: "3×12",
        muscles: "Pecho · tríceps",
        description:
          "Acostado boca arriba con rodillas flexionadas. Bajar las mancuernas hasta que los codos toquen el piso (a 45° del cuerpo) y empujar hacia arriba.",
      },
      {
        name: "Press de hombros",
        sets: "3×10",
        muscles: "Hombros · tríceps",
        description:
          "Sentado o parado con el abdomen firme, mancuernas a la altura de los hombros. Empujar hacia arriba sin arquear la espalda y bajar controlado.",
      },
      {
        name: "Vuelos laterales",
        sets: "2×12-15",
        muscles: "Hombro lateral",
        description:
          "Brazos a los costados con codos apenas flexionados. Subirlos hacia los lados hasta la altura de los hombros, sin balancear el cuerpo, y bajar lento.",
      },
      {
        name: "Curl martillo",
        sets: "2×12",
        muscles: "Bíceps · braquial · antebrazo",
        description:
          "Mancuernas con las palmas mirándose. Flexionar los codos llevando las pesas hacia los hombros sin mover los brazos, y bajar controlado.",
      },
      {
        name: "Press francés con una mancuerna",
        sets: "2×12",
        muscles: "Tríceps (cabeza larga)",
        description:
          "Sentado, una mancuerna con ambas manos por encima de la cabeza. Bajarla por detrás de la nuca flexionando solo los codos y volver a extender.",
      },
    ],
  },
  fullBody: {
    label: "Full body en circuito",
    goal: "Todo el cuerpo en poco tiempo, con algo de cardio.",
    format: "Circuito de 2-3 vueltas · sin pausa entre ejercicios · 1 min entre vueltas · ~12 min",
    exercises: [
      {
        name: "Sentadilla con press",
        sets: "10",
        muscles: "Piernas · glúteo · hombros",
        description:
          "Mancuernas sobre los hombros. Bajar en sentadilla y, al subir, aprovechar el impulso para empujar las pesas por encima de la cabeza.",
      },
      {
        name: "Remo inclinado",
        sets: "12",
        muscles: "Espalda media · bíceps",
        description:
          "Torso inclinado hacia adelante con espalda recta y rodillas semiflexionadas. Llevar las mancuernas hacia las costillas juntando los omóplatos y bajar.",
      },
      {
        name: "Peso muerto",
        sets: "10",
        muscles: "Glúteo · femorales · lumbares",
        description:
          "Mancuernas frente a los muslos. Llevar la cadera atrás manteniendo la espalda recta y las pesas pegadas a las piernas, bajar hasta media canilla y subir.",
      },
      {
        name: "Plancha tocando hombros",
        sets: "30 seg",
        muscles: "Abdomen · hombros",
        description:
          "En plancha alta con manos bajo los hombros. Tocar el hombro contrario alternando manos sin que la cadera se balancee.",
      },
      {
        name: "Jumping jacks",
        sets: "30 seg",
        muscles: "Cardio · coordinación",
        description:
          "Saltar abriendo piernas y brazos a la vez y volver a cerrar, a ritmo constante.",
      },
    ],
  },
  movilidad: {
    label: "Movilidad y core suave",
    goal: "Para días de carrera o semana de evento: activa sin cansar las piernas.",
    format: "1-2 vueltas · a ritmo tranquilo · ~8 min · sin peso",
    exercises: [
      {
        name: "Gato-vaca",
        sets: "10 respiraciones",
        muscles: "Movilidad de toda la columna",
        description:
          "En cuatro apoyos, alternar redondear la espalda mirando al ombligo y arquearla mirando al frente, acompañando con la respiración.",
      },
      {
        name: "Estocada baja con rodilla en el piso",
        sets: "30 seg c/lado",
        muscles: "Flexores de cadera",
        description:
          "Una rodilla apoyada y el otro pie adelante. Llevar la cadera hacia adelante sin arquear la zona lumbar hasta sentir el estiramiento adelante de la cadera.",
      },
      {
        name: "Almeja (clamshell)",
        sets: "15 c/lado",
        muscles: "Glúteo medio",
        description:
          "De costado con rodillas flexionadas y pies juntos. Abrir la rodilla de arriba sin despegar los pies ni girar la cadera, y cerrar despacio.",
      },
      {
        name: "Dead bug",
        sets: "8 c/lado",
        muscles: "Abdomen profundo",
        description:
          "Boca arriba con brazos al techo y rodillas a 90°. Estirar a la vez un brazo y la pierna contraria sin despegar la zona lumbar del piso, y volver.",
      },
      {
        name: "Rotación torácica en cuatro apoyos",
        sets: "8 c/lado",
        muscles: "Movilidad de espalda alta",
        description:
          "En cuatro apoyos, una mano detrás de la nuca. Llevar el codo hacia el brazo de apoyo y después abrirlo hacia el techo siguiéndolo con la mirada.",
      },
    ],
  },
  tabata: {
    label: "Tabata de 4 minutos",
    goal: "La pausa más corta: activa todo el cuerpo y sube las pulsaciones.",
    format:
      "8 rondas de 20 seg a fondo + 10 seg de descanso, alternando los dos ejercicios · 4 min",
    exercises: [
      {
        name: "Sentadilla (con o sin mancuerna)",
        sets: "20 seg",
        muscles: "Piernas · glúteo",
        description:
          "Sentadillas a buen ritmo, con buena técnica: espalda recta y rodillas en línea con los pies.",
      },
      {
        name: "Flexiones de brazos",
        sets: "20 seg",
        muscles: "Pecho · tríceps · abdomen",
        description:
          "Cuerpo en línea recta desde la cabeza a los pies (o con rodillas apoyadas). Bajar el pecho hasta cerca del piso y empujar.",
      },
    ],
  },
} satisfies Record<string, DumbbellRoutine>;

export type DumbbellRoutineKey = keyof typeof dumbbellRoutines;

/**
 * Elige la rutina de mancuernas que mejor complementa lo que el plan tiene para hoy:
 * no repetir el grupo que ya se trabajó en el gym, no cansar las piernas en días de
 * carrera y bajar la intensidad en semana de evento.
 */
export function suggestDumbbellRoutine(
  todaySessions: Session[],
  isEventWeek: boolean,
): { key: DumbbellRoutineKey; reason: string } {
  const tags = new Set(todaySessions.map((s) => s.tag));
  const gymKeys = todaySessions.map((s) => s.gymKey).filter(Boolean) as string[];

  if (isEventWeek || tags.has("event") || tags.has("luj")) {
    return {
      key: "movilidad",
      reason: "Es semana de evento: mejor movilidad suave para llegar descansado.",
    };
  }
  if (tags.has("long") || tags.has("run") || tags.has("walk")) {
    return {
      key: "movilidad",
      reason: "Hoy tenés carrera o caminata: movilidad y core sin cansar las piernas.",
    };
  }
  if (gymKeys.some((k) => k.startsWith("inferior"))) {
    return {
      key: "superior",
      reason: "Hoy ya trabajás piernas en el gym: complementá con tren superior.",
    };
  }
  if (gymKeys.some((k) => k.startsWith("superior") || k === "accesoriosSup")) {
    return {
      key: "inferiorGluteos",
      reason: "Hoy ya trabajás tren superior: sumá piernas y glúteos.",
    };
  }
  if (gymKeys.some((k) => k.startsWith("empuje"))) {
    return {
      key: "postura",
      reason: "Hoy hacés empuje en el gym: compensá con espalda y postura.",
    };
  }
  if (gymKeys.some((k) => k.startsWith("tiron"))) {
    return {
      key: "inferiorGluteos",
      reason: "Hoy hacés tirón en el gym: sumá piernas y glúteos.",
    };
  }
  if (tags.has("core")) {
    return {
      key: "inferiorGluteos",
      reason: "Hoy solo tenés core: buen día para piernas y glúteos.",
    };
  }
  return {
    key: "fullBody",
    reason: "Día libre en el plan: un circuito de cuerpo entero.",
  };
}
