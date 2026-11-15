// Ex scripts/check-meal-scaling.mjs: escalado de porciones y umbral de proteína.
import { describe, expect, it } from "vitest";
import {
  getMealsForDay,
  mealBank,
  PROTEINA_G_POR_KG,
  hcObjetivo,
  tipoDiaPara,
  portionFactor,
  umbralAlmuerzo,
  type Meal,
  type MealBank,
  type MealType,
} from "@/lib/meal-plan";

const carbLoad = [5, 6, 12];

describe("plan de comidas", () => {
  it("sin opts = banco base explícito (el plan original no cambia)", () => {
    for (let w = 1; w <= 30; w++)
      for (let d = 0; d < 7; d++)
        expect(getMealsForDay(w, d, carbLoad)).toEqual(
          getMealsForDay(w, d, carbLoad, { bank: mealBank }),
        );
  });

  it("factor de porción acotado a [0.75, 1.3] y redondeado", () => {
    expect(portionFactor(5000, 1000)).toBe(1.3);
    expect(portionFactor(100, 1000)).toBe(0.75);
    expect(portionFactor(2200, 2000)).toBe(1.1);
    expect(portionFactor(2000, 0)).toBe(1);
  });

  it("umbral de proteína del almuerzo: 55 g a 94.9 kg (el plan original), menos con menos peso", () => {
    expect(umbralAlmuerzo(94.9)).toBe(55);
    expect(umbralAlmuerzo(null)).toBe(55);
    expect(umbralAlmuerzo(70)).toBeLessThan(55);
  });

  it("banco base con peso: la proteína del día sigue al peso de cada persona", () => {
    for (const [peso, meta] of [
      [50, 1800],
      [70, 2300],
      [94.9, 2600],
    ] as const) {
      const objetivo = peso * PROTEINA_G_POR_KG;
      for (let w = 1; w <= 20; w++)
        for (let d = 0; d < 5; d++) {
          const dia = getMealsForDay(w, d, carbLoad, { metaKcal: meta, pesoKg: peso });
          expect(dia.personalizado).toBe(true);
          expect(dia.totalProteinG, `peso ${peso} semana ${w} día ${d}`).toBeGreaterThan(
            objetivo * 0.8,
          );
          expect(dia.totalProteinG, `peso ${peso} semana ${w} día ${d}`).toBeLessThan(
            objetivo * 1.35,
          );
          expect(dia.totalKcal).toBeLessThanOrEqual(meta * 1.1);
          for (const m of dia.meals)
            for (const i of m.meal.ingredientes)
              if (i.id === "huevoFrito") expect((i.cantidad ?? 0) % 50).toBe(0);
        }
    }
  });

  it("hidratos: objetivo según el tipo de día, sin comerse las grasas mínimas", () => {
    expect(tipoDiaPara(["rest"], false)).toBe("descanso");
    expect(tipoDiaPara(["core", "gym"], false)).toBe("gym");
    expect(tipoDiaPara(["long"], false)).toBe("fondo");
    expect(tipoDiaPara(["gym"], true)).toBe("carga");
    expect(hcObjetivo(50, "descanso", 1800)).toBe(150);
    expect(hcObjetivo(50, "gym", 1800)).toBe(200);
    // carga 8 g/kg = 400 g, pero con 1800 kcal solo entran 270 g sin bajar de 0,8 g/kg de grasa
    expect(hcObjetivo(50, "carga", 1800)).toBe(270);
    const dia = getMealsForDay(2, 0, carbLoad, { pesoKg: 50, metaKcal: 1800, tipoDia: "gym" });
    expect(dia.hcObjetivoG).toBe(200);
    expect(dia.totalHcG ?? 0).toBeGreaterThan(200 * 0.7);
  });

  it("banco propio (IA): los totales estimados escalan con el factor", () => {
    const iaMeal = (name: string): Meal => ({
      name,
      detail: "",
      proteinG: 60, // ≥ umbral: sin refuerzo, así el factor no se corrige
      kcal: 500,
      ingredientes: [{ id: "ia", nombre: "lentejas", cantidad: 200 }],
      carbLoad: true,
    });
    const tipos: MealType[] = ["desayuno", "media", "almuerzo", "merienda", "cena"];
    const iaBank = Object.fromEntries(
      tipos.map((t) => [t, [iaMeal(`${t} 1`), iaMeal(`${t} 2`)]]),
    ) as MealBank;

    const ia = getMealsForDay(1, 0, [], { bank: iaBank, metaKcal: 3000 });
    expect(ia.factor).toBe(1.2);
    const almuerzo = ia.meals.find((m) => m.type === "almuerzo");
    expect(almuerzo?.meal.ingredientes[0].cantidad).toBe(240);
    expect(almuerzo?.proteinG).toBe(72);
  });
});
