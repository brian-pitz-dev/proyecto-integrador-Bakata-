/** Guía del próximo evento y reglas del plan (se muestran al pie del Calendario). No es dato de Supabase. */

import { formatPace } from "@/lib/pace";
import { fromISO } from "@/lib/date";
import type { UserEvent } from "@/lib/training-plan";
import { REGLAS } from "@/lib/plan-carrera";

export interface EventCard {
  title: string;
  dateLabel: string;
  paragraphs: { label: string; text: string }[];
}

function duracion(totalSeg: number): string {
  const h = Math.floor(totalSeg / 3600);
  const m = Math.round((totalSeg % 3600) / 60);
  return h ? `${h}h${String(m).padStart(2, "0")}` : `${m} min`;
}

/** Guía para el día de un evento del usuario, armada con su tipo, distancia y ritmo objetivo. */
export function guiaEvento(ev: UserEvent): EventCard {
  const fecha = fromISO(ev.fecha).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dateLabel = `${fecha[0].toUpperCase()}${fecha.slice(1)} · ${ev.distanciaKm} km`;

  if (ev.tipo === "caminata") {
    return {
      title: ev.nombre,
      dateLabel,
      paragraphs: [
        { label: "Meta", text: "llegar entero: el ritmo importa menos que no lastimarte." },
        {
          label: "Estrategia",
          text: "arrancá más lento de lo que te pide el cuerpo, parás unos minutos cada hora y comés algo antes de tener hambre.",
        },
        {
          label: "Equipo",
          text: "el calzado y las medias que ya probaste en las caminatas largas; nada nuevo el día del evento.",
        },
        {
          label: "Día anterior",
          text: "más carbohidratos de lo habitual, mucha agua y dormir temprano.",
        },
      ],
    };
  }

  const seg = ev.ritmoObjetivoSeg;
  return {
    title: ev.nombre,
    dateLabel,
    paragraphs: [
      {
        label: "Meta",
        text: seg
          ? `${formatPace(seg).replace("/km", " min/km")} (~${duracion(seg * ev.distanciaKm)} total).`
          : "terminar entero y con buenas sensaciones. Si sabés tu ritmo objetivo, cargalo en tu evento.",
      },
      {
        label: "Estrategia",
        text: seg
          ? `el primer 15% unos segundos más lento que ${formatPace(seg)}, el medio parejo a ese ritmo y en el último 20% apretá si vas entero. El reloj suele marcar de más: marcá vuelta en cada cartel oficial de km.`
          : "el primer 15% más lento de lo que te pide el cuerpo, el medio parejo y en el último 20% apretá si vas entero.",
      },
      {
        label: "Día anterior",
        text: "más carbohidratos de lo habitual, proteína normal y nada que no hayas probado antes.",
      },
    ],
  };
}

export interface RuleCard {
  title: string;
  rules: string[];
}

/** Lo que hace falta saber de la persona para elegir qué reglas mostrarle. */
export interface ContextoReglas {
  objetivo?: "musculo" | "bajar" | "evento";
  nivelCardio?: "nuevo" | "base" | "regular";
  /** Días que faltan para su próximo evento (null si no tiene). */
  diasAlEvento: number | null;
  /** Tipo de su próximo evento. */
  tipoEvento?: "carrera" | "caminata";
}

/**
 * Reglas del plan según la persona: cada una aparece solo si aplica (objetivo, nivel, si tiene un
 * evento y cuánto falta). Las de running salen de lib/plan-carrera.ts REGLAS.
 */
export function reglasPara(c: ContextoReglas): RuleCard[] {
  const conEvento = c.diasAlEvento !== null;
  const resistencia = c.objetivo === "evento" || c.objetivo === undefined || conEvento;
  const eventoCerca = conEvento && (c.diasAlEvento ?? 99) <= 14;

  const siempre = [
    "Llegá a tu objetivo diario de proteína (lo ves en Nutrición).",
    "Dormí 7-9 horas: es cuando el cuerpo se recupera y se adapta.",
    c.objetivo === "musculo" &&
      "Anotá el peso de cada ejercicio y subilo de a poco: sin sobrecarga progresiva no hay progreso.",
    c.objetivo === "musculo" && "Dejá al menos 48 h entre dos sesiones fuertes del mismo músculo.",
    c.objetivo === "bajar" &&
      "Mantené el gym aunque busques bajar de peso: es lo que cuida tu músculo.",
    c.objetivo === "bajar" &&
      "Un déficit moderado se sostiene; uno extremo te quita energía y músculo.",
    resistencia && REGLAS.ochentaVeinte,
    resistencia && REGLAS.progresion,
    resistencia && REGLAS.salidaLarga,
    c.nivelCardio === "nuevo" &&
      "Si te falta el aire para hablar, bajá a caminar: alternar es parte del plan.",
    eventoCerca && REGLAS.descarga,
    eventoCerca && "Hidratate bien los 2 días antes del evento.",
  ];

  const nunca = [
    "Esfuerzo fuerte dos días seguidos.",
    "Ignorar el dolor articular: cansancio no es lo mismo que lesión.",
    resistencia && "Subir distancia e intensidad la misma semana.",
    conEvento && "Estrenar calzado o ropa el día del evento.",
    eventoCerca && "Piernas pesadas en el gym la semana del evento.",
    eventoCerca && c.tipoEvento === "carrera" && "Salir más rápido que tu ritmo en el primer km.",
  ];

  const alarmas = [
    "Dolor articular más de 48 h → bajá el volumen esa semana.",
    "Varias noches de mal sueño o cansancio que no se va → señal de sobreentrenamiento.",
    "Si perdés más de 2 semanas por lesión → retomá de a poco, no donde dejaste.",
  ];

  const solo = (xs: (string | false | undefined)[]) => xs.filter((x): x is string => !!x);
  return [
    { title: "Siempre", rules: solo(siempre) },
    { title: "Nunca", rules: solo(nunca) },
    { title: "Señales de alarma", rules: alarmas },
  ];
}
