/** Guía de los próximos eventos y reglas del plan (se muestran al pie del Calendario). */

import { DAYS_ES, fromISO } from "@/lib/date";
import type { UserEvent } from "@/lib/training-plan";

export interface EventCard {
  title: string;
  dateLabel: string;
  paragraphs: { label: string; text: string }[];
}

const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatLong(iso: string): string {
  const d = fromISO(iso);
  const weekday = DAYS_ES[d.getDay()];
  return `${weekday[0].toUpperCase()}${weekday.slice(1)} ${d.getDate()} de ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

function formatKm(km: number): string {
  return Number.isInteger(km) ? `${km}K` : `${km.toLocaleString("es-AR")} km`;
}

/**
 * Guía de un evento del usuario, armada según su tipo y distancia (antes era una tarjeta
 * fija del 21K de Mar del Plata del plan original). Criterios generales: sin ritmos
 * personales, porque el perfil todavía no tiene un tiempo objetivo.
 */
export function buildEventGuide(event: UserEvent): EventCard {
  const km = event.distanciaKm;
  const title = `${event.nombre} · ${formatKm(km)}`;
  const dateLabel = formatLong(event.fecha);

  if (event.tipo === "caminata") {
    return {
      title,
      dateLabel,
      paragraphs: [
        {
          label: "Ritmo",
          text: "conservador desde el principio: tenés que poder hablar sin agitarte. Cada hora, 5 minutos de pausa para comer, tomar agua y revisar los pies.",
        },
        {
          label: "Equipo",
          text: "calzado y medias que ya hayas usado en tus caminatas largas, nada nuevo ese día. Vaselina en las zonas de roce para prevenir ampollas.",
        },
        {
          label: "Comida e hidratación",
          text: "algo con carbohidratos cada 60-90 minutos (fruta, barritas, sándwich) y agua de a poco todo el tiempo, aunque no tengas sed. Si hace calor, sumá sales.",
        },
        {
          label: "Día anterior",
          text: "cena con carbohidratos (arroz, pastas, papa), sin comidas pesadas ni nuevas, y dormir lo más que puedas.",
        },
      ],
    };
  }

  if (km < 15) {
    return {
      title,
      dateLabel,
      paragraphs: [
        {
          label: "Estrategia",
          text: "los primeros 2 km un poco más lento de lo que te pide el cuerpo; después ritmo parejo, y si llegás entero, apretá en el último kilómetro.",
        },
        {
          label: "Entrada en calor",
          text: "10-15 minutos de trote suave y 3-4 aceleraciones cortas antes de la largada.",
        },
        {
          label: "Comida",
          text: "desayuno liviano que ya conozcas 2-3 horas antes. La cena del día anterior, normal con carbohidratos; no hace falta carga especial.",
        },
        {
          label: "Hidratación",
          text: "tomá agua en los días previos; en carrera, un par de sorbos en los puestos alcanza.",
        },
      ],
    };
  }

  return {
    title,
    dateLabel,
    paragraphs: [
      {
        label: "Estrategia",
        text: "dividí la carrera en tercios: el primero más lento que tu ritmo objetivo, el segundo parejo, y el último para apretar si vas entero. El reloj suele marcar de más: guiate por los carteles oficiales de km.",
      },
      {
        label: "Carbohidratos",
        text: "los 2-3 días previos subí los carbohidratos (arroz, pastas, papa, pan) y bajá la fibra y las grasas. Desayuno conocido 3 horas antes de largar.",
      },
      {
        label: "En carrera",
        text: "un gel o equivalente cada 40-45 minutos a partir de los 45', siempre con agua, y probados antes en tus tiradas largas. Tomá en todos los puestos.",
      },
      {
        label: "Equipo",
        text: "ropa y zapatillas ya usadas en entrenamientos largos. Nada nuevo el día de la carrera.",
      },
    ],
  };
}

export interface RuleCard {
  title: string;
  rules: string[];
}

export const RULE_CARDS: RuleCard[] = [
  {
    title: "Siempre",
    rules: [
      "El sábado (tirada larga o caminata) es el eje de la semana.",
      "Aumentá distancia o velocidad, nunca las dos juntas.",
      "Hidratate bien los 2 días antes de cada esfuerzo largo.",
      "Llegá cansado a los eventos, no destruido.",
      "Priorizá el piso de 150g de proteína, sobre todo antes de la cena.",
    ],
  },
  {
    title: "Nunca",
    rules: [
      "Piernas pesadas en el gym la semana de un evento.",
      "Esfuerzo fuerte dos días seguidos.",
      "Estrenar calzado el día de un evento.",
      "Ignorar dolor articular — cansancio no es lo mismo que lesión.",
    ],
  },
  {
    title: "Señales de alarma",
    rules: [
      "Dolor articular +48hs → bajá volumen esa semana.",
      "Varias noches de mal sueño → señal de sobreentrenamiento.",
      "Perdés +2 semanas por lesión → ajustá el plan, no fuerces volumen.",
      "Dolor en canilla, Aquiles o rodilla que empeora al correr y no cede con reposo → consultá.",
      "Dolor lumbar que baja a la pierna con hormigueo → consultá a un médico.",
      "Dolor o presión en el pecho, mareo o falta de aire → pará y consultá de inmediato.",
      "Calambre en la pantorrilla → frená, sentate con las piernas estiradas y llevá las puntas de los pies hacia vos.",
    ],
  },
];
