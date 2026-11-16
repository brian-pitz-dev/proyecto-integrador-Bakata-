import { describe, expect, it } from "vitest";
import {
  aplicarLesiones,
  eventosEnRiesgo,
  vueltaDeLesion,
  altaSugerida,
  describirLesion,
  duracionSugerida,
  semanasLivianas,
  type Lesion,
} from "@/lib/lesiones";
import type { Session, UserEvent, Week } from "@/lib/training-plan";

const run: Session = { tag: "run", label: "Cinta / Cardio", detail: "30 min continuo" };
const core: Session = { tag: "core", label: "Core en casa", coreKey: "base" };
const gym = (gymKey: string): Session => ({ tag: "gym", label: "Gym", gymKey });
const descanso: Session = { tag: "rest", label: "Descanso" };

/** Semana del lunes 2026-11-16 con el patrón de siempre: piernas, running, empuje, running, tirón. */
function semana(cfg: Partial<Week["cfg"]> = {}): Week {
  return {
    num: 1,
    start: "2026-11-16",
    phaseKey: "p1",
    phaseLabel: "Base",
    isEventWeek: false,
    isPrepWeek: false,
    cfg: {
      mon: [gym("inferior"), core],
      tue: [run],
      wed: [gym("empuje"), core],
      thu: [run],
      fri: [gym("tiron"), core],
      sat: [{ tag: "long", label: "Salida larga", detail: "8 km" }],
      sun: [descanso],
      ...cfg,
    },
  };
}

function lesion(p: Partial<Lesion>): Lesion {
  return {
    id: "x",
    tipo: "esguince",
    zona: "tobillo_pie",
    lado: "derecho",
    gravedad: "moderada",
    desde: "2026-11-16",
    hasta: "2026-11-23",
    nota: null,
    ...p,
  };
}

const dia = (weeks: Week[], dk: keyof Week["cfg"]) => weeks[0].cfg[dk]!;
const grupos = (s: Session[]) => s.map((x) => x.gymKey ?? x.tag);

describe("lesiones que ajustan el plan", () => {
  it("sin lesiones devuelve el mismo plan", () => {
    const weeks = [semana()];
    expect(aplicarLesiones(weeks, [])).toBe(weeks);
  });

  it("grave: los días con entrenamiento pasan a reposo; los descansos quedan", () => {
    const out = aplicarLesiones([semana()], [lesion({ tipo: "fractura", gravedad: "grave" })]);
    expect(dia(out, "tue")).toEqual([
      { tag: "rest", label: "Reposo", motivo: "por tu fractura de tobillo/pie (lado derecho)" },
    ]);
    expect(dia(out, "wed")[0].label).toBe("Reposo");
    expect(dia(out, "sun")).toEqual([descanso]);
  });

  it("leve: la rutina sigue, sin los ejercicios que cargan la zona", () => {
    const out = aplicarLesiones([semana()], [lesion({ zona: "hombro", gravedad: "leve" })]);
    expect(dia(out, "wed")[0]).toMatchObject({
      gymKey: "empuje",
      evitar: [{ zona: "hombro", gravedad: "leve" }],
      motivo: "sin los ejercicios que cargan tu hombro, por tu esguince de hombro (lado derecho)",
    });
    expect(dia(out, "tue")).toEqual([run]); // el hombro no frena el running
  });

  it("toda rutina del día lleva las lesiones a evitar, aunque su grupo no esté afectado", () => {
    const out = aplicarLesiones([semana()], [lesion({ zona: "rodilla" })]);
    // el tirón del viernes no usa la rodilla: sigue igual, pero el core saca el perro de caza
    expect(dia(out, "fri")[0]).toEqual({
      ...gym("tiron"),
      evitar: [{ zona: "rodilla", gravedad: "moderada" }],
    });
    expect(dia(out, "tue")[0].evitar).toEqual([{ zona: "rodilla", gravedad: "moderada" }]);
  });

  it("moderada de rodilla: el cardio pasa a core y piernas a tren superior, sin sumar días de gym", () => {
    const out = aplicarLesiones([semana()], [lesion({ zona: "rodilla" })]);
    const semanaOut = (["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((dk) =>
      grupos(dia(out, dk)),
    );
    expect(semanaOut).toEqual([
      ["empuje", "core"], // piernas → empuje (el martes no es de fuerza)
      ["core"],
      ["empuje", "core"],
      ["core"],
      ["tiron", "core"],
      ["core"], // salida larga → core
      ["rest"],
    ]);
    expect(dia(out, "tue")[0]).toMatchObject({
      reemplaza: "Cinta / Cardio",
      motivo: "por tu esguince de rodilla (lado derecho)",
    });
    expect(dia(out, "mon")[0]).toMatchObject({ reemplaza: "Gym de piernas" });
  });

  it("piernas con empuje y tirón a los costados pasa a core", () => {
    const out = aplicarLesiones(
      [semana({ mon: [gym("empuje")], tue: [gym("inferior")], wed: [gym("tiron")] })],
      [lesion({ zona: "rodilla" })],
    );
    expect(grupos(dia(out, "tue"))).toEqual(["core"]);
  });

  it("moderada lumbar: todo lo que la carga pasa a caminata suave", () => {
    const out = aplicarLesiones([semana()], [lesion({ zona: "lumbar", lado: null })]);
    expect(dia(out, "tue")[0]).toMatchObject({ tag: "walk", label: "Caminata suave" });
    expect(dia(out, "fri").every((s) => s.label === "Caminata suave")).toBe(true);
    expect(dia(out, "fri")).toHaveLength(1); // tirón + core → una sola caminata
  });

  it("sin alternativa posible queda descanso activo", () => {
    // rodilla (frena running y piernas) + muñeca moderada (frena empuje, tirón y core)
    const out = aplicarLesiones(
      [semana()],
      [lesion({ zona: "rodilla" }), lesion({ zona: "muneca_mano", tipo: "fisura" })],
    );
    expect(dia(out, "tue")[0]).toMatchObject({
      label: "Descanso activo",
      reemplaza: "Cinta / Cardio",
    });
  });

  it("un reemplazo que repite otra sesión del día queda una sola vez", () => {
    // con empuje y tirón el mismo martes, el running solo puede ser core, y ya hay core
    const weeks = [semana({ tue: [run, core] })];
    const out = aplicarLesiones(weeks, [lesion({ zona: "rodilla" }), lesion({ zona: "hombro" })]);
    expect(dia(out, "tue")).toHaveLength(1);
    expect(dia(out, "tue")[0]).toMatchObject(core);
  });

  it("solo ajusta los días en que la lesión está activa", () => {
    const out = aplicarLesiones(
      [semana()],
      [lesion({ gravedad: "grave", desde: "2026-11-16", hasta: "2026-11-19" })],
    );
    expect(dia(out, "wed")[0].label).toBe("Reposo");
    // el alta (jueves) ya es un día normal
    expect(dia(out, "thu")).toEqual([run]);
    // sin alta: sigue hasta que la persona marque "Ya estoy bien"
    const sinAlta = aplicarLesiones([semana()], [lesion({ gravedad: "grave", hasta: null })]);
    expect(dia(sinAlta, "sat")[0].label).toBe("Reposo");
  });

  it("con dos lesiones manda la más grave para cada sesión", () => {
    const out = aplicarLesiones(
      [semana()],
      [lesion({ zona: "rodilla", gravedad: "leve" }), lesion({ zona: "tobillo_pie" })],
    );
    expect(dia(out, "tue")[0].reemplaza).toBe("Cinta / Cardio");
  });

  it("caminata: solo la frena una lesión de pierna desde moderada", () => {
    const walk: Session = { tag: "walk", label: "Caminata", detail: "40'" };
    const leve = aplicarLesiones([semana({ tue: [walk] })], [lesion({ gravedad: "leve" })]);
    expect(dia(leve, "tue")).toEqual([walk]);
    const moderada = aplicarLesiones([semana({ tue: [walk] })], [lesion({})]);
    expect(dia(moderada, "tue")[0].reemplaza).toBe("Caminata");
  });

  it("semanas más livianas: lesión leve de piernas mientras dura, y la vuelta después del alta", () => {
    const weeks = [semana(), { ...semana(), num: 2, start: "2026-11-23" }];
    expect(semanasLivianas(weeks, [lesion({ gravedad: "leve", hasta: "2026-11-24" })])).toEqual([
      "2026-11-16",
      "2026-11-23",
    ]);
    expect(semanasLivianas(weeks, [lesion({ gravedad: "leve", zona: "hombro" })])).toEqual([]);
    // moderada: mientras dura se reemplaza; la semana del alta (lunes 23) va más liviana
    expect(semanasLivianas(weeks, [lesion({ gravedad: "moderada" })])).toEqual(["2026-11-23"]);
    // alta un jueves: la vuelta toca esa semana y la siguiente
    expect(semanasLivianas(weeks, [lesion({ gravedad: "grave", hasta: "2026-11-19" })])).toEqual([
      "2026-11-16",
      "2026-11-23",
    ]);
    // sin alta todavía: no hay vuelta
    expect(semanasLivianas(weeks, [lesion({ gravedad: "grave", hasta: null })])).toEqual([]);
  });

  it("vuelta de una lesión: los 7 días después del alta de una moderada o grave", () => {
    const l = lesion({ hasta: "2026-11-20" });
    expect(vueltaDeLesion([l], "2026-11-19")).toBeNull(); // todavía lesionada
    expect(vueltaDeLesion([l], "2026-11-20")).toBe(l);
    expect(vueltaDeLesion([l], "2026-11-26")).toBe(l);
    expect(vueltaDeLesion([l], "2026-11-27")).toBeNull();
    expect(
      vueltaDeLesion([lesion({ gravedad: "leve", hasta: "2026-11-20" })], "2026-11-21"),
    ).toBeNull();
  });

  it("avisa de los eventos que caen durante una lesión que los compromete", () => {
    const carrera: UserEvent = {
      id: "e",
      tipo: "carrera",
      nombre: "10K",
      fecha: "2026-12-06",
      distanciaKm: 10,
      ritmoObjetivoSeg: null,
    } as UserEvent;
    const hasta = (h: string | null) => lesion({ hasta: h });
    expect(eventosEnRiesgo([hasta("2026-12-10")], [carrera], "2026-11-16")).toHaveLength(1);
    expect(eventosEnRiesgo([hasta(null)], [carrera], "2026-11-16")).toHaveLength(1);
    expect(eventosEnRiesgo([hasta("2026-12-06")], [carrera], "2026-11-16")).toHaveLength(0); // alta ese día
    // moderada de hombro: no compromete una carrera; grave de hombro sí (es reposo total)
    expect(
      eventosEnRiesgo([lesion({ zona: "hombro", hasta: null })], [carrera], "2026-11-16"),
    ).toHaveLength(0);
    expect(
      eventosEnRiesgo(
        [lesion({ zona: "hombro", gravedad: "grave", hasta: null })],
        [carrera],
        "2026-11-16",
      ),
    ).toHaveLength(1);
    expect(eventosEnRiesgo([hasta(null)], [carrera], "2026-12-07")).toHaveLength(0); // ya pasó
  });

  it("duración sugerida orientativa y texto de la lesión", () => {
    expect(duracionSugerida("esguince", "moderada")).toBe(4);
    expect(duracionSugerida("cirugia", "grave")).toBeNull();
    expect(altaSugerida("fractura", "leve", "2026-11-16")).toBe("2026-12-28");
    expect(describirLesion({ tipo: "otra", zona: "lumbar", lado: null })).toBe(
      "lesión de zona lumbar",
    );
  });
});
