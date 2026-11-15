/**
 * Sobrecarga progresiva por doble progresión (curso de Personal Trainer, ver
 * claude/notas-ejercicios.md): cuando se completan las repeticiones con un peso, se sube la
 * carga (~5% tren superior, ~10% tren inferior) bajando las repeticiones; la sesión siguiente
 * se mantiene ese peso nuevo y se vuelve a las repeticiones de siempre. Así se alterna
 * "subir" → "consolidar" → "subir"…, sin que la persona tenga que calcular nada.
 *
 * Funciones puras: se usan en el Calendario (cliente) a partir de las cargas anotadas.
 */

export interface CargaPrevia {
  fecha: string;
  kg: number;
}

export type Fase = "subir" | "consolidar";

export interface Progresion {
  /** Última carga anotada antes de esta sesión. */
  anterior?: CargaPrevia;
  /** Qué toca en esta sesión (sin historial no hay fase: se anota el primer peso). */
  fase?: Fase;
  /** Peso sugerido para esta sesión. */
  sugeridoKg?: number;
  /** Series ajustadas a la fase (menos reps al subir; las de siempre al consolidar). */
  sets: string;
  /** Porcentaje de aumento usado (5 o 10). */
  porcentaje: number;
}

/** Saltos realistas de peso: discos/mancuernas de 2,5 kg; con poco peso, de a 1 kg. */
function paso(kg: number): number {
  return kg >= 20 ? 2.5 : 1;
}

function redondear(kg: number, step: number): number {
  return Math.round(kg / step) * step;
}

/** Peso de la semana de subir: +5% o +10%, redondeado, y siempre al menos un salto. */
export function pesoSubida(kg: number, porcentaje: number): number {
  const step = paso(kg);
  return Math.max(kg + step, redondear(kg * (1 + porcentaje / 100), step));
}

const SETS_RE = /^(\d+)×(\d+)(?:-(\d+))?(.*)$/;

/** "3×8-12 · RIR 2" → "3×8 · RIR 2" (al subir el peso se apunta al mínimo del rango). */
export function setsReducidos(sets: string): string {
  const m = sets.match(SETS_RE);
  if (!m) return sets;
  const [, series, lo, hi, rest] = m;
  const reps = hi ? Number(lo) : Math.max(Number(lo) - 2, 1);
  return `${series}×${reps}${rest}`;
}

/**
 * Calcula la progresión de un ejercicio para una sesión.
 * `historial`: cargas anotadas de ese ejercicio ANTES de la fecha de la sesión, en cualquier orden.
 * `actualKg`: lo anotado en esta sesión, si ya se anotó (define la fase según lo que se hizo).
 */
export function calcularProgresion({
  historial,
  actualKg,
  sets,
  trenInferior,
}: {
  historial: CargaPrevia[];
  actualKg?: number;
  sets: string;
  trenInferior: boolean;
}): Progresion {
  const porcentaje = trenInferior ? 10 : 5;
  const ordenado = [...historial].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  const [anterior, previa] = ordenado;
  if (!anterior) return { sets, porcentaje };

  let fase: Fase;
  if (actualKg !== undefined) {
    // ya anotada: la fase sale de lo que realmente hizo
    fase = actualKg > anterior.kg ? "subir" : "consolidar";
  } else {
    // la sesión anterior subió el peso → ahora se consolida; si no, toca subir
    fase = previa && anterior.kg > previa.kg ? "consolidar" : "subir";
  }

  return {
    anterior,
    fase,
    sugeridoKg: fase === "subir" ? pesoSubida(anterior.kg, porcentaje) : anterior.kg,
    sets: fase === "subir" ? setsReducidos(sets) : sets,
    porcentaje,
  };
}
