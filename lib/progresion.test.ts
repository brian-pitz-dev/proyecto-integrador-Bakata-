import { describe, expect, it } from "vitest";
import { calcularProgresion, pesoSubida, setsReducidos } from "@/lib/progresion";

describe("sobrecarga progresiva", () => {
  it("sube ~5% o ~10% en saltos reales de disco, y siempre al menos un salto", () => {
    expect(pesoSubida(20, 5)).toBe(22.5); // 21 kg redondea a 20: igual sube un disco
    expect(pesoSubida(60, 10)).toBe(65);
    expect(pesoSubida(10, 5)).toBe(11); // con poco peso, de a 1 kg
  });

  it("al subir el peso apunta al mínimo del rango de repeticiones", () => {
    expect(setsReducidos("3×8-12 · RIR 2")).toBe("3×8 · RIR 2");
    expect(setsReducidos("3×12")).toBe("3×10");
    expect(setsReducidos("30 seg")).toBe("30 seg");
  });

  it("alterna subir → consolidar según la última sesión", () => {
    const sets = "3×8-12 · RIR 2";
    expect(calcularProgresion({ historial: [], sets, trenInferior: false })).toEqual({
      sets,
      porcentaje: 5,
    });

    // la última sesión subió el peso: ahora se mantiene con las repeticiones de siempre
    const subio = [
      { fecha: "2026-11-02", kg: 40 },
      { fecha: "2026-11-09", kg: 42.5 },
    ];
    expect(calcularProgresion({ historial: subio, sets, trenInferior: false })).toMatchObject({
      fase: "consolidar",
      sugeridoKg: 42.5,
      sets,
    });

    // la última sesión consolidó: toca subir (y el historial puede venir en cualquier orden)
    const consolido = [
      { fecha: "2026-11-09", kg: 40 },
      { fecha: "2026-11-02", kg: 40 },
    ];
    expect(calcularProgresion({ historial: consolido, sets, trenInferior: true })).toMatchObject({
      fase: "subir",
      sugeridoKg: 45, // 40 + 10% = 44, al disco de 2,5 más cercano
      sets: "3×8 · RIR 2",
      porcentaje: 10,
    });
  });

  it("si la sesión ya se anotó, la fase sale de lo que hizo", () => {
    const historial = [{ fecha: "2026-11-09", kg: 40 }];
    const sets = "3×10";
    expect(calcularProgresion({ historial, actualKg: 42.5, sets, trenInferior: false }).fase).toBe(
      "subir",
    );
    expect(calcularProgresion({ historial, actualKg: 40, sets, trenInferior: false }).fase).toBe(
      "consolidar",
    );
  });
});
