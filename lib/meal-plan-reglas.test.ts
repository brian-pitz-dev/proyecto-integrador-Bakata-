// Reglas de nutrición según objetivo y tipo de día, y cómo se muestran las porciones.
import { describe, expect, it } from "vitest";
import { formatPortion, reglasNutricion, type Meal } from "@/lib/meal-plan";

describe("reglas de nutrición", () => {
  it("suma reglas según el objetivo y el tipo de día", () => {
    const base = reglasNutricion({});
    expect(reglasNutricion({ objetivo: "musculo" }).length).toBe(base.length + 1);
    expect(reglasNutricion({ objetivo: "bajar", tipoDia: "carga" }).join(" ")).toMatch(
      /verduras y la proteína[\s\S]*Carga de hidratos/,
    );
    expect(reglasNutricion({ tipoDia: "descanso" }).join(" ")).toMatch(/descanso/);
  });
});

describe("porciones", () => {
  const meal = (ingredientes: Meal["ingredientes"]) => ({ ingredientes }) as Meal;

  it("suma el mismo ingrediente y lo muestra en unidades", () => {
    expect(
      formatPortion(
        meal([
          { id: "huevo", cantidad: 100 },
          { id: "huevo", cantidad: 50 },
        ]),
      ),
    ).toBe("3 huevos");
    expect(formatPortion(meal([{ id: "huevo", cantidad: 50 }]))).toBe("1 huevo");
  });

  it("usa la porción fija cuando el ingrediente la tiene", () => {
    expect(formatPortion(meal([{ id: "lecheDescremada", cantidad: 300 }]))).toBe(
      "250 ml de leche descremada",
    );
  });
});
