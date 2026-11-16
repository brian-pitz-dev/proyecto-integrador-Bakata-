/**
 * Lesiones que ajustan el plan (specs/011-lesiones). Funciones puras: `aplicarLesiones` es el
 * último ajuste de la cadena de getUserPlanContext() (lib/user-plan.ts), así Calendario,
 * Nutrición, Coach y Progreso ven el mismo plan. Ver research.md, Decisiones 1-4.
 */

import { addDays, fromISO, toISO } from "@/lib/date";
import type { Session, Week } from "@/lib/training-plan";
import type { Gravedad, LesionInput, TipoLesion, ZonaLesion } from "@/lib/validation/lesion";

export interface Lesion extends LesionInput {
  id: string;
}

export const TIPO_LABEL: Record<TipoLesion, string> = {
  fractura: "Fractura",
  fisura: "Fisura",
  esguince: "Esguince",
  desgarro: "Desgarro",
  contractura: "Contractura",
  tendinitis: "Tendinitis",
  luxacion: "Luxación",
  cirugia: "Cirugía",
  otra: "Lesión",
};

export const ZONA_LABEL: Record<ZonaLesion, string> = {
  cuello: "cuello",
  hombro: "hombro",
  codo: "codo",
  muneca_mano: "muñeca/mano",
  espalda_alta: "espalda alta",
  lumbar: "zona lumbar",
  cadera: "cadera",
  muslo: "muslo",
  rodilla: "rodilla",
  pantorrilla: "pantorrilla",
  tobillo_pie: "tobillo/pie",
};

export const GRAVEDAD_LABEL: Record<Gravedad, string> = {
  leve: "leve",
  moderada: "moderada",
  grave: "grave",
};

/** "esguince de tobillo/pie (lado derecho)". */
export function describirLesion(l: Pick<Lesion, "tipo" | "zona" | "lado">): string {
  const lado = l.lado ? ` (${l.lado === "ambos" ? "ambos lados" : `lado ${l.lado}`})` : "";
  return `${TIPO_LABEL[l.tipo].toLowerCase()} de ${ZONA_LABEL[l.zona]}${lado}`;
}

/**
 * Activa en `fecha` (ISO): ya empezó y todavía no llegó el alta. `hasta` es el alta, el primer
 * día ya recuperado: "Ya estoy bien" la pone en hoy y el plan vuelve a la normalidad ese mismo día.
 */
export function activaEn(l: Pick<Lesion, "desde" | "hasta">, fecha: string): boolean {
  return l.desde <= fecha && (!l.hasta || fecha < l.hasta);
}

/** Semanas orientativas hasta el alta (research.md, Decisión 4); null = que lo diga su médico. */
const SEMANAS: Partial<Record<TipoLesion, [number, number, number]>> = {
  contractura: [1, 2, 3],
  tendinitis: [2, 4, 6],
  esguince: [2, 4, 8],
  desgarro: [2, 5, 10],
  fisura: [4, 6, 8],
  luxacion: [3, 6, 10],
  fractura: [6, 8, 12],
};

export function duracionSugerida(tipo: TipoLesion, gravedad: Gravedad): number | null {
  const s = SEMANAS[tipo];
  return s ? s[["leve", "moderada", "grave"].indexOf(gravedad)] : null;
}

/** Fecha de alta sugerida (ISO) a partir de `desde`, o null. */
export function altaSugerida(tipo: TipoLesion, gravedad: Gravedad, desde: string): string | null {
  const semanas = duracionSugerida(tipo, gravedad);
  return semanas === null ? null : toISO(addDays(fromISO(desde), semanas * 7));
}

// --- Qué sesión usa qué zona (research.md, Decisión 2) ---

type Grupo = "impacto" | "walk" | "piernas" | "empuje" | "tiron" | "core";

const INFERIOR: readonly ZonaLesion[] = [
  "cadera",
  "muslo",
  "rodilla",
  "pantorrilla",
  "tobillo_pie",
];
const SUPERIOR: readonly ZonaLesion[] = ["hombro", "codo", "muneca_mano"];

function grupoDe(s: Session): Grupo | null {
  if (s.tag === "run" || s.tag === "long" || s.tag === "luj") return "impacto";
  if (s.tag === "walk") return "walk";
  if (s.tag === "core") return "core";
  if (s.tag === "gym" && s.gymKey) {
    if (s.gymKey.startsWith("inferior")) return "piernas";
    if (s.gymKey.startsWith("empuje")) return "empuje";
    if (s.gymKey.startsWith("tiron")) return "tiron";
  }
  return null; // descanso o evento: no se tocan
}

function afecta(grupo: Grupo, zona: ZonaLesion, gravedad: Gravedad): boolean {
  const desdeModerada = gravedad !== "leve";
  switch (grupo) {
    case "impacto":
    case "piernas":
      return INFERIOR.includes(zona) || zona === "lumbar";
    case "walk":
      return desdeModerada && ["tobillo_pie", "rodilla", "cadera"].includes(zona);
    case "empuje":
      return SUPERIOR.includes(zona) || zona === "cuello";
    case "tiron":
      return SUPERIOR.includes(zona) || ["cuello", "espalda_alta", "lumbar"].includes(zona);
    case "core":
      return zona === "lumbar" || (desdeModerada && ["cuello", "muneca_mano"].includes(zona));
  }
}

const ORDEN: Record<Gravedad, number> = { leve: 1, moderada: 2, grave: 3 };

/** La lesión activa más grave que afecta a `grupo`, o null. */
function peorQueAfecta(grupo: Grupo, activas: Lesion[]): Lesion | null {
  return activas
    .filter((l) => afecta(grupo, l.zona, l.gravedad))
    .reduce<Lesion | null>(
      (peor, l) => (!peor || ORDEN[l.gravedad] > ORDEN[peor.gravedad] ? l : peor),
      null,
    );
}

const NOMBRE_GYM = { piernas: "piernas", empuje: "empuje", tiron: "tirón" } as const;

const sesionesGym: Record<"empuje" | "tiron" | "piernas", string> = {
  empuje: "empuje",
  tiron: "tiron",
  piernas: "inferior",
};

/** Grupos de fuerza de un día (para no repetir grupo muscular en días seguidos, como lib/mover.ts). */
function gruposDelDia(sesiones: Session[] | null | undefined): Set<Grupo> {
  return new Set((sesiones ?? []).map(grupoDe).filter((g): g is Grupo => g !== null));
}

/**
 * Ajusta el plan día por día con las lesiones activas ese día (research.md, Decisión 3):
 * - grave → los días con entrenamiento pasan a "Reposo";
 * - moderada → la sesión afectada se reemplaza por algo que no use la zona (tren superior,
 *   piernas, core o caminata suave), sin dejar el mismo grupo en días seguidos; si no hay
 *   alternativa, "Descanso activo";
 * - leve → la sesión sigue, más liviana (gym en su versión liviana, core corto, cardio suave).
 * Los días de evento no están en las semanas (getSessionsForDate los resuelve antes): no se tocan.
 */
export function aplicarLesiones(weeks: Week[], lesiones: Lesion[]): Week[] {
  if (!lesiones.length) return weeks;
  const DIAS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  const out = weeks.map((w) => ({ ...w, cfg: { ...w.cfg } }));
  // todos los días en orden, para mirar el de antes (ya ajustado) y el de después
  const dias = out.flatMap((w) =>
    DIAS.map((dk, i) => ({ w, dk, fecha: toISO(addDays(fromISO(w.start), i)) })),
  );

  dias.forEach(({ w, dk, fecha }, i) => {
    const sesiones = w.cfg[dk];
    if (!sesiones?.some((s) => s.tag !== "rest")) return;
    const activas = lesiones.filter((l) => activaEn(l, fecha));
    if (!activas.length) return;

    const grave = activas.find((l) => l.gravedad === "grave");
    if (grave) {
      w.cfg[dk] = [{ tag: "rest", label: "Reposo", motivo: `por tu ${describirLesion(grave)}` }];
      return;
    }

    const vecinos = new Set([
      ...gruposDelDia(i > 0 ? dias[i - 1].w.cfg[dias[i - 1].dk] : null),
      ...gruposDelDia(i < dias.length - 1 ? dias[i + 1].w.cfg[dias[i + 1].dk] : null),
    ]);
    // como en lib/mover.ts, solo los grupos de fuerza no se repiten en días seguidos (el core sí)
    const libre = (g: Grupo) => (g === "core" || !vecinos.has(g)) && !peorQueAfecta(g, activas);

    const nuevas: Session[] = [];
    for (const s of sesiones) {
      const grupo = grupoDe(s);
      const lesion = grupo && peorQueAfecta(grupo, activas);
      if (!grupo || !lesion) {
        nuevas.push(s);
        continue;
      }
      const motivo = `por tu ${describirLesion(lesion)}`;
      if (lesion.gravedad === "leve") {
        nuevas.push(liviana(s, grupo, motivo));
        continue;
      }
      const reemplazo = reemplazar(grupo, lesion.zona, libre);
      // "Gym" solo no dice qué se sacó: "Gym de piernas"
      const original =
        s.tag === "gym" ? `Gym de ${NOMBRE_GYM[grupo as keyof typeof NOMBRE_GYM]}` : s.label;
      nuevas.push({ ...reemplazo, reemplaza: original, motivo });
    }
    // un reemplazo que repite otra sesión del día (ej. running → core, y ya había core): una sola
    const igual = (a: Session, b: Session) => a.label === b.label && a.gymKey === b.gymKey;
    w.cfg[dk] = nuevas.filter(
      (s, j) =>
        !s.reemplaza || !nuevas.some((o, k) => k !== j && igual(o, s) && (!o.reemplaza || k < j)),
    );
  });
  return out;
}

function liviana(s: Session, grupo: Grupo, motivo: string): Session {
  if (grupo === "piernas" || grupo === "empuje" || grupo === "tiron") {
    const key = `${sesionesGym[grupo]}Light`;
    return { ...s, gymKey: key, motivo: `versión liviana ${motivo}` };
  }
  if (grupo === "core") return { ...s, coreKey: "light", motivo: `versión corta ${motivo}` };
  return { ...s, motivo: `a ritmo suave ${motivo}: si duele, cortá` };
}

const CAMINATA_SUAVE: Session = {
  tag: "walk",
  label: "Caminata suave",
  detail: "20-30' a ritmo cómodo",
};
const DESCANSO_ACTIVO: Session = {
  tag: "rest",
  label: "Descanso activo",
  detail: "Movilidad suave",
};
const CORE: Session = { tag: "core", label: "Core en casa", coreKey: "light" };
const gym = (g: "empuje" | "tiron" | "piernas"): Session => ({
  tag: "gym",
  label: "Gym",
  gymKey: sesionesGym[g],
});

/** Qué hacer en lugar de una sesión con lesión moderada (research.md, Decisión 3). */
function reemplazar(grupo: Grupo, zona: ZonaLesion, libre: (g: Grupo) => boolean): Session {
  if (zona === "lumbar") return CAMINATA_SUAVE;
  // el cardio pasa a core (no suma días de gym); el gym pasa al otro tren, así la semana tiene
  // la misma cantidad de días de fuerza que antes
  const opciones: ("empuje" | "tiron" | "piernas" | "core")[] =
    grupo === "impacto" || grupo === "walk"
      ? ["core", "empuje", "tiron"]
      : grupo === "piernas"
        ? ["empuje", "tiron", "core"]
        : grupo === "empuje" || grupo === "tiron"
          ? ["piernas", "core"]
          : [];
  const g = opciones.find(libre);
  if (!g) return DESCANSO_ACTIVO;
  return g === "core" ? CORE : gym(g);
}

/**
 * Lunes de las semanas que van un escalón más livianas (como el retome) porque una lesión leve
 * afecta el cardio de impacto algún día de esa semana. Con moderada o grave esas sesiones ya se
 * reemplazan, así que no hace falta.
 */
export function semanasLivianas(weeks: Week[], lesiones: Lesion[]): string[] {
  const leves = lesiones.filter((l) => l.gravedad === "leve" && afecta("impacto", l.zona, "leve"));
  return weeks
    .filter((w) =>
      leves.some((l) => {
        const fin = toISO(addDays(fromISO(w.start), 6));
        return l.desde <= fin && (!l.hasta || l.hasta > w.start);
      }),
    )
    .map((w) => w.start);
}
