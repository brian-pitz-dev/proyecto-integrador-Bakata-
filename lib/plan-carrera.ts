/**
 * Motor de reglas para la preparación de carreras y caminatas: arma cada semana a partir de los
 * datos de la persona (nivel, volumen actual, distancia del evento, semanas disponibles) en vez
 * de una plantilla fija. Las sesiones se prescriben por TIEMPO y ESFUERZO ("30' a ritmo de
 * charla"), que sirve para cualquiera; si la persona cargó su ritmo objetivo, se suma el ritmo
 * aproximado.
 *
 * Reglas (convenciones de entrenamiento, no leyes; ver REGLAS más abajo con su fuente):
 * - 80/20: la mayor parte suave, una sola sesión exigente por semana (ninguna para quien empieza).
 * - Progresión gradual (~10% por semana) con una semana más liviana cada 4.
 * - La salida larga crece de a poco hasta un tope según la distancia del evento.
 * - Descarga previa (taper) según la distancia: 5-10K ~1-2 semanas, 15-30K 1 semana fuerte,
 *   maratón 3 semanas (Mayo Clinic / Int J Sports Med).
 * - Duración mínima del plan según distancia (5K 4 semanas, 10K 6, media 8, maratón 12): si no
 *   alcanza, se avisa y el objetivo pasa a ser terminar.
 * - Quien no corre arranca con intervalos de trote y caminata.
 */

import type { Session, UserEvent } from "@/lib/training-plan";
import { formatPace } from "@/lib/pace";

export type NivelCardio = "nuevo" | "base" | "regular";

export interface PerfilCardio {
  nivel: NivelCardio;
  /** Km por semana que ya corre (solo "regular"). */
  kmSemana?: number | null;
}

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type WeekCfg = Record<DayKey, Session[] | null>;

export interface SemanaGenerada {
  cfg: WeekCfg;
  phaseKey: string;
  phaseLabel: string;
}

/** Las reglas con su fuente: se muestran en la app y documentan de dónde sale cada número. */
export const REGLAS = {
  ochentaVeinte:
    "La mayor parte del entrenamiento a ritmo suave (80/20): mejora más que entrenar seguido al medio-fuerte.",
  progresion:
    "Subí el volumen de a poco (cerca de 10% por semana) y cada 3-4 semanas hacé una más liviana.",
  salidaLarga:
    "La salida larga crece de a poco (≈10% por semana) hasta un tope según la distancia del evento; nunca la subas junto con la intensidad.",
  descarga:
    "Antes del evento se baja el volumen (5-10K: 1-2 semanas; media: ~2; maratón: ~3) sin dejar de moverse.",
} as const;

const SUAVE = "a ritmo de charla (podés hablar en frases completas)";
const MODERADO = "cómodo-fuerte (frases cortas)";
const FUERTE = "fuerte (solo palabras sueltas)";

const run = (detail: string, label = "Correr"): Session => ({ tag: "run", label, detail });
const walk = (detail: string, label = "Caminata"): Session => ({ tag: "run", label, detail });
const larga = (label: string, detail: string, tag: "long" | "walk" = "long"): Session => ({
  tag,
  label,
  detail,
});
const rest = (label = "Descanso"): Session => ({ tag: "rest", label });
const core = (short: boolean): Session => ({
  tag: "core",
  label: "Core en casa",
  coreKey: short ? "light" : "base",
});
const gym = (key: string): Session[] => [
  { tag: "gym", label: "Gym", gymKey: key },
  core(key.includes("Light")),
];

/** Semanas mínimas de preparación según la distancia (corre; caminata usa el equivalente). */
export function semanasMinimas(distanciaKm: number): number {
  if (distanciaKm <= 5) return 4;
  if (distanciaKm <= 10) return 6;
  if (distanciaKm <= 21.1) return 8;
  return 12;
}

/** Semanas recomendadas de preparación (con más tiempo, antes va mantenimiento). */
export function semanasRecomendadas(ev: Pick<UserEvent, "tipo" | "distanciaKm">): number {
  const d = ev.distanciaKm;
  if (ev.tipo === "caminata") return d <= 21.1 ? 8 : d <= 42.2 ? 12 : 16;
  if (d <= 5) return 8;
  if (d <= 10) return 10;
  if (d <= 21.1) return 12;
  return 16;
}

/** Reducción de volumen por semana de descarga, de la más lejana a la del evento. */
function descargaPorDistancia(distanciaKm: number): number[] {
  if (distanciaKm >= 30) return [0.8, 0.6, 0.4]; // maratón: -20%, -40%, -60%
  if (distanciaKm >= 15) return [0.75, 0.5]; // 15-30K: ~2 semanas
  return [0.8, 0.5]; // 5-10K: -20% y -50% la semana del evento
}

/** Minutos de la salida larga en el pico, según la distancia (tiempo en movimiento). */
function largaPico(ev: Pick<UserEvent, "tipo" | "distanciaKm">): number {
  if (ev.tipo === "caminata") {
    // ~12 min/km caminando; la más larga de la preparación, ~60% del evento con tope de 4 h
    return Math.min(240, Math.max(60, Math.round(ev.distanciaKm * 12 * 0.6)));
  }
  const d = ev.distanciaKm;
  if (d <= 5) return 45;
  if (d <= 10) return 70;
  if (d <= 21.1) return 110;
  return 180;
}

function largaInicial(c: PerfilCardio, ev: Pick<UserEvent, "tipo">): number {
  if (ev.tipo === "caminata") return c.nivel === "nuevo" ? 45 : c.nivel === "base" ? 75 : 90;
  if (c.nivel === "nuevo") return 30;
  if (c.nivel === "base") return 35;
  // ~6:30/km de ritmo suave; la larga, cerca de un cuarto de lo que ya corre
  const km = c.kmSemana ?? 0;
  return km > 0 ? Math.min(90, Math.max(40, Math.round(km * 6.5 * 0.25))) : 50;
}

function sesionSuave(c: PerfilCardio): number {
  return c.nivel === "nuevo" ? 25 : c.nivel === "base" ? 30 : 40;
}

const r5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

/** Ritmo suave aproximado a partir del ritmo objetivo (~15% más lento). */
function ritmoSuave(ev: UserEvent): number | null {
  return ev.ritmoObjetivoSeg ? Math.round(ev.ritmoObjetivoSeg * 1.15) : null;
}

/** Sesión suave: intervalos trote/caminata para quien empieza, continua para el resto. */
function suave(c: PerfilCardio, ev: UserEvent, minutos: number, semana: number): Session {
  if (ev.tipo === "caminata") return walk(`Caminata a paso vivo ${r5(minutos)}'`);
  if (c.nivel === "nuevo") {
    const trote = Math.min(8, 1 + semana); // de 1' a 8' de trote, un minuto más por semana
    if (trote >= 8) return run(`${r5(minutos)}' de trote continuo ${SUAVE}`);
    const caminata = trote >= 4 ? 1 : 2;
    const reps = Math.max(3, Math.floor((minutos - 10) / (trote + caminata)));
    return run(
      `5' caminando + ${reps}×[${trote}' trote suave / ${caminata}' caminata] + 5' caminando`,
      "Trote y caminata",
    );
  }
  const p = ritmoSuave(ev);
  return run(`${r5(minutos)}' ${SUAVE}${p ? ` (≈ ${formatPace(p)})` : ""}`);
}

/** La sesión exigente de la semana, según la distancia del evento. */
function exigente(ev: UserEvent, semana: number): Session {
  if (ev.tipo === "caminata")
    return walk(
      `10' suave + ${r5(25 + semana * 3)}' en subida o cinta inclinada, ${MODERADO} + 5' suave`,
      "Caminata con subidas",
    );
  const rc = ev.ritmoObjetivoSeg ? ` (≈ ${formatPace(ev.ritmoObjetivoSeg)})` : "";
  const d = ev.distanciaKm;
  if (d <= 5) {
    const reps = Math.min(6, 4 + Math.floor(semana / 2));
    return run(`10' suave + ${reps}×[2' ${FUERTE} / 2' suave] + 10' suave`, "Series");
  }
  if (d <= 10) {
    const reps = Math.min(4, 2 + Math.floor(semana / 2));
    return run(`10' suave + ${reps}×[6' ${MODERADO}${rc} / 2' suave] + 10' suave`, "Series largas");
  }
  const t = Math.min(35, 15 + semana * 3);
  return run(`10' suave + ${t}' a ritmo de carrera${rc} + 10' suave`, "Ritmo de carrera");
}

function salidaLarga(ev: UserEvent, minutos: number, c?: PerfilCardio, semana = 0): Session {
  if (ev.tipo === "caminata") {
    const km = Math.round(minutos / 12);
    return larga(
      "Caminata larga",
      `${r5(minutos)}' a paso tranquilo (≈ ${km} km) · probá calzado e hidratación`,
      "long",
    );
  }
  if (c?.nivel === "nuevo") {
    // quien empieza alarga el tiempo en movimiento con el mismo trote/caminata de la semana
    const s = suave(c, ev, minutos, semana);
    return larga("Salida larga", s.detail ?? "");
  }
  const p = ritmoSuave(ev);
  const km = p ? ` (≈ ${Math.round((minutos * 60) / p)} km)` : "";
  return larga("Salida larga", `${r5(minutos)}' ${SUAVE}${km}`);
}

/**
 * Bloque de preparación de un evento: semanas de construcción con progresión + descarga previa.
 * `semanasDisponibles` incluye la semana del evento.
 */
export function bloqueEvento(
  ev: UserEvent,
  semanasDisponibles: number,
  c: PerfilCardio,
): SemanaGenerada[] {
  const reducciones = descargaPorDistancia(ev.distanciaKm);
  const nDescarga = Math.min(reducciones.length, Math.max(1, semanasDisponibles - 1));
  const nConstruccion = Math.max(0, semanasDisponibles - nDescarga);
  const justo = semanasDisponibles < semanasMinimas(ev.distanciaKm);
  const etiqueta = `rumbo a ${ev.nombre} (${ev.fecha})`;
  const keyConstruccion = ev.tipo === "caminata" ? "p2" : ev.distanciaKm >= 15 ? "p4" : "p1";

  const pico = largaPico(ev);
  const inicio = Math.min(pico, largaInicial(c, ev));
  const facil = sesionSuave(c);
  // la larga crece ~10% por semana hasta el pico, sin pasarse
  const largaDeSemana = (k: number) => Math.min(pico, inicio * Math.pow(1.1, k));

  const out: SemanaGenerada[] = [];
  let progreso = 0; // semanas que sumaron progresión (las livianas no suman)
  for (let k = 0; k < nConstruccion; k++) {
    const liviana = (k + 1) % 4 === 0;
    const largaMin = liviana ? largaDeSemana(progreso) * 0.75 : largaDeSemana(progreso);
    if (!liviana) progreso++;
    // 80/20: nada exigente para quien empieza; para "base", desde la tercera semana
    const conExigente = !liviana && c.nivel !== "nuevo" && (c.nivel === "regular" || k >= 2);
    out.push({
      phaseKey: keyConstruccion,
      phaseLabel: `FASE — Construcción · ${etiqueta}${justo ? " · tiempo justo: el objetivo es terminar" : ""}`,
      cfg: {
        mon: gym(liviana ? "empujeLight" : "empuje"),
        tue: [conExigente ? exigente(ev, k) : suave(c, ev, facil, k)],
        wed: gym(liviana ? "inferiorLight" : ev.tipo === "carrera" ? "inferiorRun" : "inferior"),
        thu: [suave(c, ev, liviana ? facil * 0.8 : facil, k)],
        fri: gym(liviana ? "tironLight" : "tiron"),
        sat: [salidaLarga(ev, largaMin, c, k)],
        sun: [rest()],
      },
    });
  }

  // descarga: menos volumen, se mantiene algo de ritmo; la última semana, la del evento
  const largaFinal = largaDeSemana(Math.max(0, progreso - 1));
  const ultimaK = Math.max(0, nConstruccion - 1); // la descarga sigue el nivel alcanzado
  reducciones.slice(reducciones.length - nDescarga).forEach((f, i) => {
    const ultima = i === nDescarga - 1;
    out.push({
      phaseKey: "p5",
      phaseLabel: ultima
        ? `FASE — Semana del evento · ${ev.nombre}`
        : `FASE — Descarga previa · ${etiqueta}`,
      cfg: ultima
        ? {
            mon: gym("empujeLight"),
            tue: [
              ev.tipo === "caminata"
                ? walk(`Caminata suave ${r5(facil * f)}'`)
                : run(`${r5(facil * f)}' suave + 3 aceleraciones de 20"`),
            ],
            wed: [rest("Descanso — piernas frescas")],
            thu: [suave(c, ev, facil * f, ultimaK)],
            fri: [
              rest(
                ev.tipo === "caminata" || ev.distanciaKm >= 15
                  ? "Descanso — carga de carbohidratos y a dormir temprano"
                  : "Descanso — dormí bien",
              ),
            ],
            sat: [rest()],
            sun: [rest()],
          }
        : {
            mon: gym("empujeLight"),
            tue: [c.nivel === "nuevo" ? suave(c, ev, facil * f, ultimaK) : exigente(ev, 0)],
            wed: gym("inferiorLight"),
            thu: [suave(c, ev, facil * f, ultimaK)],
            fri: gym("tironLight"),
            sat: [salidaLarga(ev, largaFinal * f, c, ultimaK)],
            sun: [rest()],
          },
    });
  });
  return out;
}

/** Semana después de un evento: todo suave para recuperar. */
export function semanaRecuperacion(ev: UserEvent, c: PerfilCardio): SemanaGenerada {
  const facil = sesionSuave(c) * 0.7;
  return {
    phaseKey: "p3",
    phaseLabel: `FASE — Recuperación · post ${ev.nombre}`,
    cfg: {
      mon: [core(true)],
      tue: [
        ev.tipo === "caminata"
          ? walk(`Caminata suave ${r5(facil)}'`)
          : walk(`Caminata o trote muy suave ${r5(facil)}'`),
      ],
      wed: gym("inferiorLight"),
      thu: [
        c.nivel === "nuevo" ? walk(`Caminata a paso vivo ${r5(facil)}'`) : suave(c, ev, facil, 0),
      ],
      fri: gym("empujeLight"),
      sat: [larga("Salida tranquila", `${r5(sesionSuave(c))}' muy suave, sin apuro`)],
      sun: [rest()],
    },
  };
}

/** Sin evento cerca: mantener la base con lo que la persona ya hace. */
export function semanaMantenimientoCardio(n: number, c: PerfilCardio): WeekCfg {
  const ref: UserEvent = { id: "", tipo: "carrera", nombre: "", fecha: "", distanciaKm: 10 };
  const facil = sesionSuave(c);
  const liviana = n % 4 === 0;
  return {
    mon: gym(liviana ? "empujeLight" : "empuje"),
    tue: [c.nivel === "nuevo" || liviana ? suave(c, ref, facil, n) : exigente(ref, 1)],
    wed: gym(liviana ? "inferiorLight" : "inferior"),
    thu: [suave(c, ref, facil, n)],
    fri: gym(liviana ? "tironLight" : "tiron"),
    sat: [salidaLarga(ref, largaInicial(c, ref) * (liviana ? 0.75 : 1), c, n)],
    sun: [rest()],
  };
}
