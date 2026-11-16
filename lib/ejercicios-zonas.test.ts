import { describe, expect, it } from "vitest";
import { CARGA_EJERCICIO, cargaLesion, filtrarPorLesion } from "@/lib/ejercicios-zonas";
import { catalogoEjercicios, coreRoutines } from "@/lib/gym-exercises";

describe("zonas que carga cada ejercicio", () => {
  it("todo el catálogo (gym y core) tiene sus zonas", () => {
    const nombres = [
      ...catalogoEjercicios().map((e) => e.name),
      ...Object.values(coreRoutines).flatMap((r) => r.exercises.map((e) => e.name)),
    ];
    const sinZonas = nombres.filter((n) => !CARGA_EJERCICIO[n]);
    expect(sinZonas).toEqual([]);
  });

  it("leve saca solo donde la zona es principal; moderada también las secundarias", () => {
    const hombroLeve = [{ zona: "hombro", gravedad: "leve" } as const];
    const hombroModerado = [{ zona: "hombro", gravedad: "moderada" } as const];
    expect(cargaLesion("Press de hombros en máquina", hombroLeve)).toBe(true);
    expect(cargaLesion("Plancha frontal", hombroLeve)).toBe(false);
    expect(cargaLesion("Plancha frontal", hombroModerado)).toBe(true);
    expect(cargaLesion("Curl femoral en máquina", hombroModerado)).toBe(false);
  });

  it("un ejercicio fuera del catálogo queda (no se sabe qué carga)", () => {
    expect(cargaLesion("Ejercicio inventado", [{ zona: "rodilla", gravedad: "moderada" }])).toBe(
      false,
    );
  });

  it("filtra una rutina y dice qué sacó", () => {
    const rutina = [
      { name: "Press de pecho en máquina", sets: "3×10" },
      { name: "Extensión de tríceps en polea con soga", sets: "3×12" },
    ];
    const { quedan, sacados } = filtrarPorLesion(rutina, [{ zona: "hombro", gravedad: "leve" }]);
    expect(quedan.map((e) => e.name)).toEqual(["Extensión de tríceps en polea con soga"]);
    expect(sacados.map((e) => e.name)).toEqual(["Press de pecho en máquina"]);
    expect(filtrarPorLesion(rutina, undefined).quedan).toBe(rutina);
  });
});
