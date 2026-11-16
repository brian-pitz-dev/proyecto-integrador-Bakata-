// Reparto de rutinas según las zonas que prioriza la persona (lib/training-plan.ts).
import { describe, expect, it } from "vitest";
import { buildPlan, priorizarZonas, recortarCore, type Week } from "@/lib/training-plan";
import { fromISO } from "@/lib/date";

const HOY = "2026-11-16"; // lunes
const plan = (dias: number[]) =>
  buildPlan(HOY, [], fromISO(HOY), { dias, minutos: 60 }, [], undefined, { objetivo: "musculo" });
const rutinasDe = (w: Week) =>
  Object.values(w.cfg)
    .flat()
    .filter((s) => s?.tag === "gym")
    .map((s) => s!.gymKey?.replace(/Light$/, ""));
const cores = (w: Week) =>
  Object.values(w.cfg).filter((d) => d?.some((s) => s.tag === "core" && s.label === "Core en casa"))
    .length;

describe("priorizar zonas", () => {
  it("con 3 días y sin prioridad: empuje · piernas · tirón", () => {
    expect(rutinasDe(priorizarZonas(plan([0, 2, 4]), [])[0])).toEqual([
      "empuje",
      "inferior",
      "tiron",
    ]);
  });

  it("priorizando glúteos: dos días de piernas por uno de superior, que alterna", () => {
    const weeks = priorizarZonas(plan([0, 2, 4]), ["glúteos"]);
    expect(rutinasDe(weeks[0])).toEqual(["inferior", "empuje", "inferior"]);
    expect(rutinasDe(weeks[1])).toEqual(["inferior", "tiron", "inferior"]);
  });

  it("si también prioriza tren superior, no carga las piernas", () => {
    const weeks = priorizarZonas(plan([0, 2, 4]), ["glúteos", "espalda"]);
    expect(rutinasDe(weeks[0]).filter((k) => k === "inferior")).toHaveLength(1);
  });
});

describe("recortar core", () => {
  it("deja como mucho un core por semana si no lo priorizó", () => {
    for (const w of recortarCore(plan([0, 1, 2, 3, 4]), []))
      expect(cores(w)).toBeLessThanOrEqual(1);
  });

  it("si prioriza core no lo toca", () => {
    const base = plan([0, 1, 2, 3, 4]);
    expect(recortarCore(base, ["core"])).toBe(base);
  });
});
