// Ex scripts/check-meal-scaling.mjs: escalado de porciones y umbral de proteína.
import { describe, expect, it } from "vitest";
import {
  getMealsForDay,
  mealBank,
  PROTEINA_G_POR_KG,
  hcObjetivo,
  metasMacros,
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
          // días puntuales pueden pasarse un poco; el promedio lo controla el test de objetivos
          expect(dia.totalKcal).toBeLessThanOrEqual(meta * 1.15);
          for (const m of dia.meals)
            for (const i of m.meal.ingredientes)
              if (i.id === "huevoFrito") expect((i.cantidad ?? 0) % 50).toBe(0);
        }
    }
  });

  it("macros del día: suman la meta de calorías, grasas entre 0,8 y 1,2 g/kg", () => {
    expect(tipoDiaPara(["rest"], false)).toBe("descanso");
    expect(tipoDiaPara(["core", "gym"], false)).toBe("gym");
    expect(tipoDiaPara(["long"], false)).toBe("fondo");
    expect(tipoDiaPara(["gym"], true)).toBe("carga");
    for (const [peso, meta] of [
      [50, 1800],
      [70, 2300],
      [95, 2700],
    ] as const)
      for (const tipo of ["descanso", "gym", "fondo", "carga"] as const) {
        const m = metasMacros(peso, tipo, meta);
        expect(Math.round(4 * m.p + 4 * m.h + 9 * m.g)).toBe(meta);
        expect(m.g).toBeGreaterThanOrEqual(peso * 0.8 - 0.01);
        expect(m.g).toBeLessThanOrEqual(peso * 1.2 + 0.01);
        expect(hcObjetivo(peso, tipo, meta)).toBe(Math.round(m.h));
      }
    // más entrenamiento → más hidratos (y menos grasas) con las mismas calorías
    expect(hcObjetivo(70, "fondo", 2300)).toBeGreaterThan(hcObjetivo(70, "descanso", 2300));
  });

  it("el día armado queda cerca de los objetivos (la mayoría de los días)", () => {
    for (const [peso, meta] of [
      [49, 2035],
      [70, 2300],
      [95, 2700],
    ] as const) {
      let dentro = 0;
      let dias = 0;
      for (let w = 1; w <= 20; w++)
        for (let d = 0; d < 7; d++) {
          const dia = getMealsForDay(w, d, carbLoad, {
            pesoKg: peso,
            metaKcal: meta,
            tipoDia: "gym",
          });
          const m = metasMacros(peso, "gym", meta);
          const ok =
            Math.abs(dia.totalProteinG / m.p - 1) <= 0.2 &&
            Math.abs((dia.totalHcG ?? 0) / m.h - 1) <= 0.2 &&
            Math.abs((dia.totalGrasaG ?? 0) / m.g - 1) <= 0.25 &&
            Math.abs(dia.totalKcal / meta - 1) <= 0.1;
          dias++;
          if (ok) dentro++;
        }
      expect(dentro / dias, `peso ${peso}`).toBeGreaterThanOrEqual(0.8);
    }
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
