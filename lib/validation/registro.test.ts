import { describe, expect, it } from "vitest";
import { saveLogSchema } from "@/lib/validation/registro";

const log = (categoria: string, valor: number) =>
  saveLogSchema.safeParse({ categoria, fecha: "2026-11-16", valor });

describe("saveLogSchema: rango por categoría", () => {
  it("rechaza un peso imposible (5000 kg), con un mensaje para el usuario", () => {
    const r = log("peso", 5000);
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe("El peso va entre 20 y 400 kg.");
  });

  it("acepta valores reales de cada categoría y corta en los bordes", () => {
    expect(log("peso", 78.5).success).toBe(true);
    expect(log("peso", 20).success).toBe(true);
    expect(log("peso", 19.9).success).toBe(false);
    expect(log("caminata", 80).success).toBe(true); // Luján
    expect(log("tirada", 0).success).toBe(false);
    expect(log("sueno", 7.5).success).toBe(true);
    expect(log("sueno", 25).success).toBe(false);
    expect(log("calorias", 650).success).toBe(true);
    expect(log("calorias", 51_604).success).toBe(false);
    expect(log("completado", 1).success).toBe(true);
    expect(log("completado", 2).success).toBe(false);
  });
});
