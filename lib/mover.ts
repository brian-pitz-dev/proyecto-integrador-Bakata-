/**
 * Mover un día de entrenamiento dentro de su semana (solo esa semana: otra semana puede tener
 * otros días). Se guarda como un intercambio entre dos días ("mover" en `registro`: fecha = día
 * original, nota = día nuevo) y se aplica sobre el plan calculado. Regla: después del cambio no
 * puede quedar el mismo grupo muscular del gym en dos días seguidos (fatiga muscular).
 */

import { addDays, fromISO, toISO } from "@/lib/date";
import { getSessionsForDate, type Session, type UserEvent, type Week } from "@/lib/training-plan";

export const CATEGORIA_MOVER = "mover";

export interface Movimiento {
  desde: string;
  hasta: string;
}

const DIAS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const GRUPO_LABEL: Record<string, string> = {
  piernas: "piernas",
  empuje: "pecho, hombros y tríceps",
  tiron: "espalda y bíceps",
};

/** Grupos musculares que trabaja un día en el gym (piernas / empuje / tirón). */
export function gruposDelDia(sessions: Session[]): Set<string> {
  const grupos = new Set<string>();
  for (const s of sessions) {
    if (s.tag !== "gym" || !s.gymKey) continue;
    if (s.gymKey.startsWith("inferior")) grupos.add("piernas");
    else if (s.gymKey.startsWith("empuje")) grupos.add("empuje");
    else if (s.gymKey.startsWith("tiron")) grupos.add("tiron");
  }
  return grupos;
}

function semanaDe(weeks: Week[], fecha: string): { week: Week; dia: number } | null {
  const d = fromISO(fecha);
  for (const week of weeks) {
    const dia = Math.round((d.getTime() - fromISO(week.start).getTime()) / 86_400_000);
    if (dia >= 0 && dia < 7) return { week, dia };
  }
  return null;
}

/** Aplica los intercambios guardados, en orden, sobre las semanas del plan. */
export function aplicarMovimientos(weeks: Week[], movimientos: Movimiento[]): Week[] {
  if (!movimientos.length) return weeks;
  const out = weeks.map((w) => ({ ...w, cfg: { ...w.cfg } }));
  for (const m of movimientos) {
    const a = semanaDe(out, m.desde);
    const b = semanaDe(out, m.hasta);
    if (!a || !b || a.week !== b.week || a.dia === b.dia) continue;
    const cfg = a.week.cfg;
    const [da, db] = [DIAS[a.dia], DIAS[b.dia]];
    [cfg[da], cfg[db]] = [cfg[db], cfg[da]];
  }
  return out;
}

const esDescanso = (s: Session[]) => s.every((x) => x.tag === "rest");

/**
 * ¿Se puede pasar lo del día `desde` al día `hasta` (intercambiándolos)? Devuelve el motivo si no.
 * Mismo semana, hoy o más adelante, sin tocar el día de un evento ni un descanso con nombre (carga
 * de hidratos, piernas frescas), y sin dejar el mismo grupo muscular en días seguidos.
 */
export function motivoNoMover(
  weeks: Week[],
  events: UserEvent[],
  desde: string,
  hasta: string,
  hoy: string,
): string | null {
  if (desde === hasta) return "Es el mismo día.";
  const a = semanaDe(weeks, desde);
  const b = semanaDe(weeks, hasta);
  if (!a || !b || a.week !== b.week) return "Solo se puede mover dentro de la misma semana.";
  if (desde < hoy || hasta < hoy) return "No se pueden mover días que ya pasaron.";

  const sesiones = (iso: string) => getSessionsForDate(weeks, events, fromISO(iso));
  const sDesde = sesiones(desde);
  const sHasta = sesiones(hasta);
  if (esDescanso(sDesde)) return "Ese día no tiene entrenamiento.";
  const esEvento = (s: Session[]) => s.some((x) => x.tag === "event" || x.tag === "luj");
  if (esEvento(sDesde) || esEvento(sHasta)) return "El día de un evento no se mueve.";
  const descansoConNombre = (s: Session[]) =>
    s.some((x) => x.tag === "rest" && x.label !== "Descanso");
  if (descansoConNombre(sHasta)) return `Ese día es "${sHasta[0].label}".`;

  // después del intercambio, ningún día puede repetir grupo con el de al lado
  const movido = aplicarMovimientos(weeks, [{ desde, hasta }]);
  const grupos = (iso: string) => gruposDelDia(getSessionsForDate(movido, events, fromISO(iso)));
  for (const dia of [desde, hasta]) {
    const propios = grupos(dia);
    for (const vecino of [toISO(addDays(fromISO(dia), -1)), toISO(addDays(fromISO(dia), 1))]) {
      const repetido = [...propios].find((g) => grupos(vecino).has(g));
      if (repetido)
        return `Quedarían dos días seguidos de ${GRUPO_LABEL[repetido]}: el músculo necesita al menos un día para recuperarse.`;
    }
  }
  return null;
}
