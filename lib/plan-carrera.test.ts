// Motor de reglas de running/caminata (lib/plan-carrera.ts) y su uso desde buildPlan.
import { describe, expect, it } from "vitest";
import { bloqueEvento, semanasMinimas, type PerfilCardio } from "@/lib/plan-carrera";
import { buildPlan, getSessionsForDate, type UserEvent } from "@/lib/training-plan";
import { ajustarSeriesNivel } from "@/lib/gym-exercises";
import { reglasPara } from "@/lib/plan-content";
import { addDays, fromISO } from "@/lib/date";

const ev = (
  tipo: UserEvent["tipo"],
  distanciaKm: number,
  extra: Partial<UserEvent> = {},
): UserEvent => ({
  id: "1",
  tipo,
  nombre: "Evento",
  fecha: "2027-03-07",
  distanciaKm,
  ...extra,
});
const sesiones = (b: ReturnType<typeof bloqueEvento>) =>
  b.flatMap((s) => Object.values(s.cfg).flat()).filter((x) => x !== null);
const larga = (s: ReturnType<typeof bloqueEvento>[number]) =>
  s.cfg.sat?.find((x) => x.tag === "long");
const minutos = (detail?: string) => Number(/^(\d+)'/.exec(detail ?? "")?.[1] ?? NaN);

describe("motor de reglas de running", () => {
  it("prescribe por tiempo y esfuerzo: ningún km/h fijo", () => {
    for (const c of [
      { nivel: "nuevo" },
      { nivel: "base" },
      { nivel: "regular", kmSemana: 30 },
    ] as PerfilCardio[])
      for (const d of [5, 10, 21.1, 42.2])
        for (const s of sesiones(bloqueEvento(ev("carrera", d), 12, c)))
          expect(s.detail ?? "").not.toMatch(/km\/h/);
  });

  it("quien no corre arranca con trote y caminata, sin sesiones exigentes", () => {
    const b = bloqueEvento(ev("carrera", 5), 8, { nivel: "nuevo" });
    expect(b[0].cfg.tue?.[0].detail).toMatch(/trote suave \/ \d' caminata/);
    expect(sesiones(b).some((s) => /fuerte|ritmo de carrera/.test(s.detail ?? ""))).toBe(false);
  });

  it("la salida larga crece como mucho ~10% por semana y nunca pasa el tope de la distancia", () => {
    const b = bloqueEvento(ev("carrera", 21.1), 12, { nivel: "base" });
    const largas = b.filter((s) => s.phaseKey !== "p5").map((s) => minutos(larga(s)?.detail));
    // contra la más larga hasta ahí (después de una semana liviana se retoma, no se salta)
    for (let i = 1; i < largas.length; i++) {
      const previa = Math.max(...largas.slice(0, i));
      expect(largas[i], `semana ${i + 1}`).toBeLessThanOrEqual(previa * 1.1 + 5); // +5: redondeo a 5'
    }
    expect(Math.max(...largas)).toBeLessThanOrEqual(110);
  });

  it("cada 4 semanas una más liviana", () => {
    const b = bloqueEvento(ev("carrera", 21.1), 12, { nivel: "base" });
    expect(minutos(larga(b[3])?.detail)).toBeLessThan(minutos(larga(b[2])?.detail));
  });

  it("80/20: como mucho una sesión exigente por semana", () => {
    for (const s of bloqueEvento(ev("carrera", 10), 10, { nivel: "regular", kmSemana: 40 })) {
      const exigentes = Object.values(s.cfg)
        .flat()
        .filter((x) => x && /cómodo-fuerte|fuerte \(|ritmo de carrera/.test(x.detail ?? ""));
      expect(exigentes.length).toBeLessThanOrEqual(1);
    }
  });

  it("la descarga depende de la distancia: 5-10K 2 semanas, maratón 3", () => {
    const desc = (d: number) =>
      bloqueEvento(ev("carrera", d), 16, { nivel: "base" }).filter((s) => s.phaseKey === "p5")
        .length;
    expect(desc(10)).toBe(2);
    expect(desc(42.2)).toBe(3);
  });

  it("con menos semanas que el mínimo avisa que el objetivo es terminar", () => {
    expect(semanasMinimas(21.1)).toBe(8);
    const b = bloqueEvento(ev("carrera", 21.1), 5, { nivel: "base" });
    expect(b[0].phaseLabel).toMatch(/tiempo justo/);
    expect(bloqueEvento(ev("carrera", 21.1), 10, { nivel: "base" })[0].phaseLabel).not.toMatch(
      /tiempo justo/,
    );
  });

  it("con ritmo objetivo suma ritmos aproximados; sin él, no", () => {
    const con = sesiones(
      bloqueEvento(ev("carrera", 10, { ritmoObjetivoSeg: 330 }), 10, { nivel: "base" }),
    );
    expect(con.some((s) => /≈ \d:\d\d\/km/.test(s.detail ?? ""))).toBe(true);
    const sin = sesiones(bloqueEvento(ev("carrera", 10), 10, { nivel: "base" }));
    expect(sin.some((s) => /\/km/.test(s.detail ?? ""))).toBe(false);
  });

  it("caminatas: todo caminando", () => {
    for (const s of sesiones(bloqueEvento(ev("caminata", 42), 10, { nivel: "base" })))
      if (s.tag === "run" || s.tag === "long") expect(s.detail ?? "").not.toMatch(/trote|correr/i);
  });

  it("buildPlan con nivel usa el motor; sin nivel, las plantillas de siempre", () => {
    const evento = ev("carrera", 10, { fecha: "2027-02-14" });
    const hoy = fromISO("2026-11-16");
    const con = buildPlan("2026-11-16", [evento], hoy, undefined, [], undefined, {
      cardio: { nivel: "base" },
    });
    const sin = buildPlan("2026-11-16", [evento], hoy);
    const textos = (w: typeof con) =>
      w
        .flatMap((wk) =>
          Array.from({ length: 7 }, (_, i) =>
            getSessionsForDate(w, [evento], addDays(fromISO(wk.start), i)),
          ),
        )
        .flat()
        .map((s) => s.detail ?? "")
        .join(" ");
    expect(textos(con)).not.toMatch(/km\/h/);
    expect(textos(sin)).toMatch(/km\/h/);
    // el evento sigue cayendo en su fecha
    expect(getSessionsForDate(con, [evento], fromISO(evento.fecha))[0].tag).toBe("event");
  });
});

describe("gym según nivel", () => {
  it("principiante: una serie menos y RIR 3; avanzado: una más y un RIR menos", () => {
    expect(ajustarSeriesNivel("3×8-12 · RIR 2", "principiante")).toBe("2×8-12 · RIR 3");
    expect(ajustarSeriesNivel("3×8-12 · RIR 2", "avanzado")).toBe("4×8-12 · RIR 1");
    expect(ajustarSeriesNivel("2×12", "principiante")).toBe("2×12");
    expect(ajustarSeriesNivel("5×5", "avanzado")).toBe("5×5");
    expect(ajustarSeriesNivel("3×10", "intermedio")).toBe("3×10");
  });
});

describe("reglas según la persona", () => {
  const todas = (c: Parameters<typeof reglasPara>[0]) =>
    reglasPara(c)
      .flatMap((r) => r.rules)
      .join(" | ");
  it("objetivo gym sin evento: nada de salidas largas ni descarga", () => {
    const r = todas({ objetivo: "musculo", diasAlEvento: null });
    expect(r).not.toMatch(/salida larga|evento/i);
    expect(r).toMatch(/sobrecarga progresiva/);
  });
  it("evento a menos de 2 semanas: reglas de descarga y del día del evento", () => {
    const r = todas({ objetivo: "evento", diasAlEvento: 10, tipoEvento: "carrera" });
    expect(r).toMatch(/Antes del evento se baja el volumen/);
    expect(r).toMatch(/Piernas pesadas/);
  });
});
