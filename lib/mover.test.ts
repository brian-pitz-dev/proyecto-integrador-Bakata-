// Mover un día de entrenamiento dentro de su semana (lib/mover.ts).
import { describe, expect, it } from "vitest";
import { aplicarMovimientos, gruposDelDia, motivoNoMover } from "@/lib/mover";
import { buildPlan, getSessionsForDate, priorizarZonas } from "@/lib/training-plan";
import { fromISO } from "@/lib/date";

// objetivo músculo, lunes-miércoles-viernes, priorizando piernas: piernas · superior · piernas
const HOY = "2026-11-16"; // lunes
const weeks = priorizarZonas(
  buildPlan(HOY, [], fromISO(HOY), { dias: [0, 2, 4], minutos: 60 }, [], undefined, {
    objetivo: "musculo",
  }),
  ["glúteos"],
);
const grupos = (w: typeof weeks, iso: string) => [
  ...gruposDelDia(getSessionsForDate(w, [], fromISO(iso))),
];

describe("mover un día", () => {
  it("la semana de base es piernas · superior · piernas", () => {
    expect(grupos(weeks, "2026-11-16")).toEqual(["piernas"]);
    expect(grupos(weeks, "2026-11-18")).toHaveLength(1);
    expect(grupos(weeks, "2026-11-20")).toEqual(["piernas"]);
  });

  it("intercambia los dos días y solo en esa semana", () => {
    const movido = aplicarMovimientos(weeks, [{ desde: "2026-11-18", hasta: "2026-11-19" }]);
    expect(grupos(movido, "2026-11-18")).toEqual([]);
    expect(grupos(movido, "2026-11-19")).toEqual(grupos(weeks, "2026-11-18"));
    // la semana siguiente no cambia
    expect(grupos(movido, "2026-11-25")).toEqual(grupos(weeks, "2026-11-25"));
  });

  it("no deja el mismo músculo en días seguidos", () => {
    // lunes (piernas) al jueves: quedaría pegado al viernes de piernas
    expect(motivoNoMover(weeks, [], "2026-11-16", "2026-11-19", HOY)).toMatch(
      /dos días seguidos de piernas/,
    );
    // lunes (piernas) al martes: el miércoles es de tren superior, se puede
    expect(motivoNoMover(weeks, [], "2026-11-16", "2026-11-17", HOY)).toBeNull();
  });

  it("solo dentro de la misma semana, y no días pasados", () => {
    expect(motivoNoMover(weeks, [], "2026-11-20", "2026-11-23", HOY)).toMatch(/misma semana/);
    expect(motivoNoMover(weeks, [], "2026-11-18", "2026-11-17", "2026-11-18")).toMatch(
      /ya pasaron/,
    );
  });

  it("un día de descanso no se mueve (pero puede recibir)", () => {
    expect(motivoNoMover(weeks, [], "2026-11-17", "2026-11-18", HOY)).toMatch(
      /no tiene entrenamiento/,
    );
  });
});
