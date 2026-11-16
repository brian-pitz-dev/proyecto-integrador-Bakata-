// Plan armado por la IA: meses de rutinas y validaciones del registro.
import { describe, expect, it } from "vitest";
import {
  estadoMes,
  inicioDelMes,
  primerLunes,
  variarContraAnterior,
  type RutinasGuardadas,
} from "@/lib/plan-ia";
import { GYM_KEYS } from "@/lib/validation/coach";
import { onboardingSchema } from "@/lib/validation/onboarding";

describe("meses de rutinas", () => {
  it("cuenta las semanas del mes y avisa cuando terminó", () => {
    expect(estadoMes(undefined, "2026-11-16")).toBeNull();
    expect(estadoMes("2026-11-16", "2026-11-16")).toMatchObject({ semana: 1, terminado: false });
    expect(estadoMes("2026-11-16", "2026-12-06")).toMatchObject({ semana: 3, terminado: false });
    expect(estadoMes("2026-11-16", "2026-12-13")).toMatchObject({ semana: 4, terminado: false });
    expect(estadoMes("2026-11-16", "2026-12-14")).toMatchObject({ terminado: true });
  });

  it("el mes son 4 semanas enteras: si arranca un día que no es lunes, empieza el lunes siguiente", () => {
    expect(primerLunes("2026-11-16")).toBe("2026-11-16"); // lunes
    expect(primerLunes("2026-11-15")).toBe("2026-11-16"); // domingo
    expect(primerLunes("2026-11-18")).toBe("2026-11-23"); // miércoles
    // registrada un domingo: aunque haya un inicio guardado de esa semana, arranca el lunes
    expect(inicioDelMes("2026-11-09", undefined, "2026-11-15")).toBe("2026-11-16");
    // sin inicio guardado: desde que la IA armó las rutinas
    expect(inicioDelMes(undefined, "2026-11-15T22:00:00Z", "2026-11-01")).toBe("2026-11-16");
    expect(inicioDelMes(undefined, undefined)).toBeUndefined();
  });

  it("el mes nuevo nunca repite más de la mitad de los ejercicios del anterior", () => {
    const rutina = (nombres: string[]) => ({
      label: "x",
      exercises: nombres.map((name) => ({ name, sets: "3×10" })),
    });
    const iguales = Object.fromEntries(
      GYM_KEYS.map((k) => [k, rutina(["A", "B", "C", "D"])]),
    ) as RutinasGuardadas;
    const alternativas = () => ["E", "F", "G", "H"].map((name) => ({ name, sets: "3×12" }));
    const nuevas = variarContraAnterior(iguales, iguales, alternativas);
    for (const k of GYM_KEYS) {
      const repetidos = nuevas[k].exercises.filter((e) => ["A", "B", "C", "D"].includes(e.name));
      expect(repetidos.length).toBeLessThanOrEqual(2);
      // las series de la IA se conservan
      expect(nuevas[k].exercises.every((e) => e.sets === "3×10")).toBe(true);
    }
  });
});

describe("registro según el objetivo", () => {
  const perfil = {
    fechaNacimiento: "1995-05-05",
    alturaCm: 165,
    sexo: "F",
    pesoInicialKg: 60,
  };
  const evento = {
    tipo: "carrera",
    nombre: "10K",
    fecha: "2099-01-01",
    distanciaKm: 10,
  };
  it("objetivo gym: sin eventos, pero con meta de peso", () => {
    const sinMeta = onboardingSchema.safeParse({
      ...perfil,
      eventos: [],
      preferencias: { objetivo: "bajar" },
    });
    expect(sinMeta.success).toBe(false);
    const ok = onboardingSchema.safeParse({
      ...perfil,
      metaPesoKg: 55,
      eventos: [],
      preferencias: { objetivo: "bajar" },
    });
    expect(ok.success).toBe(true);
  });
  it("objetivo evento: hace falta al menos un evento", () => {
    expect(
      onboardingSchema.safeParse({ ...perfil, eventos: [], preferencias: { objetivo: "evento" } })
        .success,
    ).toBe(false);
    expect(
      onboardingSchema.safeParse({
        ...perfil,
        eventos: [evento],
        preferencias: { objetivo: "evento" },
      }).success,
    ).toBe(true);
  });
});
