// Ex scripts/check-calorie-target.mjs.
import { describe, expect, it } from "vitest";
import {
  calcularMeta,
  computeBmrCalibrado,
  deficitDeFase,
  objetivoCalorico,
  SUPERAVIT_KCAL,
  type UserProfile,
} from "@/lib/calorie-target";

const base = { edad: 30, alturaCm: 180, factorActividad: 1.55 };
const hombre: UserProfile = { ...base, sexo: "M" };
const mujer: UserProfile = { ...base, sexo: "F" };

describe("calorías", () => {
  it("Mifflin-St Jeor: 10·peso + 6.25·altura − 5·edad, +5 hombre / −161 mujer", () => {
    expect(computeBmrCalibrado(80, hombre)).toBe(1780);
    expect(computeBmrCalibrado(80, mujer)).toBe(1614);
  });

  it("calibración (ej. InBody): a ese peso da lo medido y a otro escala con el mismo factor", () => {
    // 1869 / 1780 = 1.05
    const calibrado = { ...hombre, calibracionPesoKg: 80, calibracionBmrKcal: 1869 };
    expect(computeBmrCalibrado(80, calibrado)).toBe(1869);
    expect(Math.round(computeBmrCalibrado(90, calibrado))).toBe(Math.round(1880 * 1.05));
  });

  it("calibración incompleta (falta uno de los dos datos) = sin calibrar", () => {
    expect(computeBmrCalibrado(80, { ...hombre, calibracionPesoKg: 80 })).toBe(1780);
  });

  it("déficit por fase, y 400 fuera del plan o con una fase desconocida", () => {
    expect(deficitDeFase("p6")).toBe(550);
    expect(deficitDeFase("p5")).toBe(100);
    expect(deficitDeFase(null)).toBe(400);
    expect(deficitDeFase("pX")).toBe(400);
  });

  it("meta del día para bajar: BMR + activas − déficit con reloj, BMR × actividad − déficit sin él", () => {
    const paraBajar = { ...hombre, metaPesoKg: 75 };
    expect(calcularMeta(80, 500, paraBajar, "p6")).toEqual({
      meta: 1730,
      gastoCalorico: 2280,
      deficit: 550,
      objetivo: "bajar",
      fuente: "xiaomi",
      pesoKg: 80,
    });
    expect(calcularMeta(80, null, paraBajar, null)).toEqual({
      meta: Math.round(1780 * 1.55 - 400),
      gastoCalorico: Math.round(1780 * 1.55),
      deficit: 400,
      objetivo: "bajar",
      fuente: "estimado",
      pesoKg: 80,
    });
  });

  it("objetivo según la meta de peso: bajar, subir o mantener (±0,5 kg o sin meta)", () => {
    expect(objetivoCalorico(80, 75)).toBe("bajar");
    expect(objetivoCalorico(80, 81)).toBe("subir");
    expect(objetivoCalorico(80, 80.3)).toBe("mantener");
    expect(objetivoCalorico(80, null)).toBe("mantener");
  });

  it("para subir de peso: superávit fijo, sin importar la fase", () => {
    const target = calcularMeta(80, 500, { ...hombre, metaPesoKg: 81 }, "p6");
    expect(target.objetivo).toBe("subir");
    expect(target.deficit).toBe(-SUPERAVIT_KCAL);
    expect(target.meta).toBe(2280 + SUPERAVIT_KCAL);
  });

  it("sin meta de peso: mantenimiento (come lo que gasta)", () => {
    const target = calcularMeta(80, 500, hombre, "p6");
    expect(target.objetivo).toBe("mantener");
    expect(target.deficit).toBe(0);
    expect(target.meta).toBe(2280);
  });

  it("0 activas cargadas es un dato (día sin actividad), no «sin dato»", () => {
    expect(calcularMeta(80, 0, hombre, "p6").fuente).toBe("xiaomi");
  });
});
