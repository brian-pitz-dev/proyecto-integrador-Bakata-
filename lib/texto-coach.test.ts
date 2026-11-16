import { describe, expect, it } from "vitest";
import { bloquesDeTexto } from "@/lib/texto-coach";

describe("bloquesDeTexto", () => {
  it("convierte la respuesta real del coach: negrita y lista con *, sin asteriscos sueltos", () => {
    const texto =
      "¡Buenas! Esta semana tenés tu **Fase Base** hacia los 21K:\n\n* **Lunes:** Gym + Core en casa\n* **Martes:** Series largas\n\nDale *tranqui*.";
    expect(bloquesDeTexto(texto)).toEqual([
      {
        tipo: "p",
        tramos: [
          { texto: "¡Buenas! Esta semana tenés tu ", negrita: false },
          { texto: "Fase Base", negrita: true },
          { texto: " hacia los 21K:", negrita: false },
        ],
      },
      {
        tipo: "lista",
        items: [
          [
            { texto: "Lunes:", negrita: true },
            { texto: " Gym + Core en casa", negrita: false },
          ],
          [
            { texto: "Martes:", negrita: true },
            { texto: " Series largas", negrita: false },
          ],
        ],
      },
      { tipo: "p", tramos: [{ texto: "Dale tranqui.", negrita: false }] },
    ]);
  });

  it("los títulos quedan en negrita y el texto común pasa igual", () => {
    expect(bloquesDeTexto("### Tu semana\n3×10 a 20 kg")).toEqual([
      { tipo: "p", tramos: [{ texto: "Tu semana", negrita: true }] },
      { tipo: "p", tramos: [{ texto: "3×10 a 20 kg", negrita: false }] },
    ]);
  });
});
