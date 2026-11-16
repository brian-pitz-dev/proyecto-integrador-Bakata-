// Plan armado por la IA: la app arma el banco de comidas y las rutinas con lo que eligió la IA
// (lib/plan-ia.ts bancoDesdeEleccion / rutinasDesdeEleccion).
import { describe, expect, it } from "vitest";
import { bancoDesdeEleccion, normalizar, rutinasDesdeEleccion } from "@/lib/plan-ia";
import { MEAL_TYPES, mealBank } from "@/lib/meal-plan";
import { catalogoEjercicios, gymRoutines } from "@/lib/gym-exercises";
import { GYM_KEYS, type AiEleccionComidas, type AiRutinas } from "@/lib/validation/coach";

const plato = (nombre: string, extra: Partial<AiEleccionComidas["almuerzo"][number]> = {}) => ({
  nombre,
  nuevo: false,
  detalle: "",
  ingredientes: [],
  carbLoad: false,
  liviana: false,
  ...extra,
});
const vacia = (): AiEleccionComidas =>
  Object.fromEntries(MEAL_TYPES.map((t) => [t, []])) as unknown as AiEleccionComidas;

describe("banco de comidas desde la elección de la IA", () => {
  it("sin ningún plato usable devuelve null (queda el plan base)", () => {
    const e = vacia();
    e.almuerzo = [plato("Plato que no existe en el catálogo")];
    expect(bancoDesdeEleccion(e)).toBeNull();
  });

  it("toma platos del catálogo sin importar mayúsculas ni tildes, sin repetir", () => {
    const nombre = mealBank.cena[0].name;
    const e = vacia();
    e.cena = [plato(nombre.toUpperCase()), plato(nombre)];
    const bank = bancoDesdeEleccion(e)!;
    expect(bank.cena[0].name).toBe(nombre);
    expect(bank.cena.filter((m) => normalizar(m.name) === normalizar(nombre))).toHaveLength(1);
  });

  it("completa cada comida hasta 3 opciones y garantiza un almuerzo de carga de hidratos", () => {
    const e = vacia();
    e.desayuno = [plato(mealBank.desayuno[0].name)];
    const bank = bancoDesdeEleccion(e)!;
    for (const t of MEAL_TYPES) expect(bank[t].length).toBeGreaterThanOrEqual(3);
    expect(bank.almuerzo.some((m) => m.carbLoad)).toBe(true);
  });

  it("un plato nuevo solo usa ingredientes conocidos", () => {
    const e = vacia();
    e.almuerzo = [
      plato("Bowl nuevo", {
        nuevo: true,
        ingredientes: [
          { id: "huevo", gramos: 100 },
          { id: "ingrediente-inventado", gramos: 50 },
        ],
      }),
    ];
    const bowl = bancoDesdeEleccion(e)!.almuerzo.find((m) => m.name === "Bowl nuevo")!;
    expect(bowl.ingredientes.map((i) => i.id)).toEqual(["huevo"]);
  });
});

describe("rutinas desde la elección de la IA", () => {
  const catalogo = catalogoEjercicios();
  const eleccion = (nombres: string[]): AiRutinas =>
    Object.fromEntries(
      GYM_KEYS.map((k) => [
        k,
        { label: `Rutina ${k}`, exercises: nombres.map((name) => ({ name, sets: "3x10" })) },
      ]),
    ) as unknown as AiRutinas;

  it("usa los nombres exactos del catálogo y descarta los inventados y repetidos", () => {
    const [a, b, c] = catalogo;
    const r = rutinasDesdeEleccion(
      eleccion([a.name.toLowerCase(), b.name, b.name, "Inventado", c.name]),
    );
    expect(r.empuje.exercises.map((e) => e.name)).toEqual([a.name, b.name, c.name]);
    expect(r.empuje.label).toBe("Rutina empuje");
    expect(r.empuje.warmup).toBe(gymRoutines.empuje.warmup);
  });

  it("con menos de 3 ejercicios válidos deja la rutina base", () => {
    const r = rutinasDesdeEleccion(eleccion([catalogo[0].name, "Inventado"]));
    expect(r.tiron).toEqual(gymRoutines.tiron);
  });
});
