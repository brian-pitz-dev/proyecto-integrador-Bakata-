/**
 * Qué zonas del cuerpo carga cada ejercicio del catálogo (lib/gym-exercises.ts), para sacar solo
 * los que no se pueden hacer con una lesión (specs/011-lesiones, US6). No es lo mismo que el
 * músculo que trabaja: un press de pecho trabaja el pecho pero carga hombro, codo y muñeca.
 *
 * - `p` (principal): la zona hace el esfuerzo o es la que más riesgo corre → se saca ya con
 *   lesión leve.
 * - `s` (secundaria): la zona también se carga → se saca desde moderada.
 *
 * lib/ejercicios-zonas.test.ts verifica que todo el catálogo tenga su entrada.
 */

import type { Exercise } from "@/lib/gym-exercises";
import type { Gravedad, ZonaLesion } from "@/lib/validation/lesion";

type Z = ZonaLesion;
interface Carga {
  p: Z[];
  s?: Z[];
}

const PRESS_PECHO: Carga = { p: ["hombro"], s: ["codo", "muneca_mano"] };
const PRESS_HOMBROS: Carga = { p: ["hombro"], s: ["codo", "muneca_mano", "cuello"] };
const HOMBRO: Carga = { p: ["hombro"] };
const CURL: Carga = { p: ["codo"], s: ["muneca_mano"] };
const JALON: Carga = { p: ["hombro", "espalda_alta"], s: ["codo"] };
const REMO: Carga = { p: ["espalda_alta"], s: ["hombro", "codo", "muneca_mano"] };
const SENTADILLA: Carga = { p: ["rodilla", "cadera"], s: ["muslo", "lumbar", "tobillo_pie"] };
const UNA_PIERNA: Carga = { p: ["rodilla"], s: ["cadera", "muslo", "tobillo_pie"] };
const RUMANO: Carga = { p: ["lumbar", "muslo"], s: ["cadera"] };
const CADERA: Carga = { p: ["cadera"], s: ["lumbar"] };
const TALONES: Carga = { p: ["pantorrilla", "tobillo_pie"] };

export const CARGA_EJERCICIO: Record<string, Carga> = {
  // empuje
  "Press de banca con barra (o en máquina guiada)": PRESS_PECHO,
  "Press de pecho con mancuernas (banco plano)": PRESS_PECHO,
  "Press de pecho en máquina": PRESS_PECHO,
  "Press de pecho inclinado en máquina": PRESS_PECHO,
  "Press inclinado con mancuernas": PRESS_PECHO,
  "Press inclinado en máquina": PRESS_PECHO,
  "Cruce de poleas (de arriba hacia abajo)": HOMBRO,
  "Fondos (en paralelas o en banco)": { p: ["hombro", "codo"], s: ["muneca_mano"] },
  "Press de hombros con giro, con mancuernas": PRESS_HOMBROS,
  "Press de hombros con mancuernas sentado": PRESS_HOMBROS,
  "Press de hombros en máquina": PRESS_HOMBROS,
  "Vuelos laterales": HOMBRO,
  "Vuelos laterales en polea": HOMBRO,
  "Vuelos laterales sentado con mancuernas": HOMBRO,
  "Extensión de tríceps en polea con soga": { p: ["codo"] },
  "Extensión de tríceps sobre la cabeza (polea o mancuerna)": { p: ["codo"], s: ["hombro"] },
  "Press francés con barra W": CURL,
  // tirón
  "Jalón al pecho": JALON,
  "Jalón al pecho con agarre cerrado": JALON,
  "Jalón con brazos extendidos en polea": JALON,
  "Dominadas asistidas (o jalón con agarre neutro)": {
    p: ["hombro", "espalda_alta"],
    s: ["codo", "muneca_mano"],
  },
  "Remo a un brazo con mancuerna": REMO,
  "Remo con barra o remo en T": { ...REMO, p: ["espalda_alta", "lumbar"] },
  "Remo con mancuernas en banco inclinado (pecho apoyado)": REMO,
  "Remo en máquina con apoyo de pecho": REMO,
  "Remo sentado en polea": REMO,
  "Jalón a la cara con soga": HOMBRO,
  "Jalón a la cara en polea": HOMBRO,
  "Jalón a la cara en polea (o vuelos posteriores)": HOMBRO,
  "Vuelos posteriores en máquina (contractora invertida)": HOMBRO,
  "Encogimientos con mancuernas": { p: ["cuello"], s: ["muneca_mano"] },
  "Curl de bíceps en banco predicador": CURL,
  "Curl de bíceps en máquina": CURL,
  "Curl inclinado con mancuernas": CURL,
  "Curl martillo": { p: ["codo", "muneca_mano"] },
  "Curl invertido": { p: ["codo", "muneca_mano"] },
  // piernas
  "Prensa (pies a media altura)": { p: ["rodilla"], s: ["cadera", "muslo"] },
  "Sentadilla con polea": SENTADILLA,
  "Sentadilla con polea (o prensa)": SENTADILLA,
  "Sentadilla en máquina inclinada (o sentadilla copa pesada)": SENTADILLA,
  "Estocada búlgara": UNA_PIERNA,
  "Estocada caminando": UNA_PIERNA,
  "Estocada hacia atrás": UNA_PIERNA,
  "Subida al cajón o escalón": UNA_PIERNA,
  "Extensión de cuádriceps en máquina": { p: ["rodilla", "muslo"] },
  "Curl femoral en máquina": { p: ["muslo"], s: ["rodilla"] },
  "Curl femoral bajando en 4 seg (o curl nórdico asistido)": { p: ["muslo"], s: ["rodilla"] },
  "Peso muerto rumano": RUMANO,
  "Peso muerto rumano con mancuernas": RUMANO,
  "Peso muerto rumano a una pierna": { ...RUMANO, s: ["cadera", "tobillo_pie"] },
  "Empuje de cadera con barra": CADERA,
  "Empuje de cadera en máquina (o puente con barra)": CADERA,
  "Puente de glúteo": CADERA,
  "Puente de glúteo a una pierna": CADERA,
  "Abducción de cadera (máquina o banda)": { p: ["cadera"] },
  "Abducción de cadera en polea": { p: ["cadera"] },
  "Caminata lateral con banda": { p: ["cadera"], s: ["rodilla", "tobillo_pie"] },
  "Elevación de talones de pie": TALONES,
  "Elevación de talones a una pierna": TALONES,
  "Elevación de talones sentado": TALONES,
  // core
  "Abdominal invertido": { p: ["lumbar"] },
  "Bicho muerto (boca arriba, brazo y pierna opuestos)": { p: [], s: ["lumbar"] },
  "Perro de caza (en cuatro apoyos, brazo y pierna opuestos)": {
    p: [],
    s: ["muneca_mano", "rodilla", "lumbar"],
  },
  "Plancha frontal": { p: [], s: ["hombro", "codo", "lumbar"] },
  "Plancha lateral": { p: [], s: ["hombro", "codo"] },
};

/** Lesión a tener en cuenta en un ejercicio (las activas ese día, sin las graves: esas son reposo). */
export interface Evitar {
  zona: ZonaLesion;
  gravedad: Gravedad;
}

/** true si el ejercicio carga alguna zona lesionada (principal con leve; cualquiera desde moderada). */
export function cargaLesion(nombre: string, evitar: readonly Evitar[]): boolean {
  const c = CARGA_EJERCICIO[nombre];
  // un ejercicio fuera del catálogo (rutinas viejas de la IA) no se sabe qué carga: queda
  if (!c) return false;
  return evitar.some(({ zona, gravedad }) =>
    (gravedad === "leve" ? c.p : [...c.p, ...(c.s ?? [])]).includes(zona),
  );
}

/** Separa los ejercicios que se pueden hacer de los que cargan la lesión. */
export function filtrarPorLesion(
  ejercicios: Exercise[],
  evitar: readonly Evitar[] | undefined,
): { quedan: Exercise[]; sacados: Exercise[] } {
  if (!evitar?.length) return { quedan: ejercicios, sacados: [] };
  const sacados = ejercicios.filter((e) => cargaLesion(e.name, evitar));
  return { quedan: ejercicios.filter((e) => !sacados.includes(e)), sacados };
}
