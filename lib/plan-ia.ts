/**
 * Plan armado por la IA a partir de catálogos: la IA elige (platos y ejercicios) y la app calcula
 * (porciones, macros y series según la persona y el día). Acá se arma el texto de los catálogos
 * para el prompt y se convierte la elección de la IA en lo que se guarda en plan_ia, descartando
 * todo lo que no esté en el catálogo.
 */

import {
  catalogoIngredientes,
  esIngredienteConocido,
  esIngredienteFijo,
  mealBank,
  MEAL_TYPES,
  type Meal,
  type MealBank,
  type MealType,
} from "@/lib/meal-plan";
import { catalogoEjercicios, gymRoutines, type Exercise, type Routine } from "@/lib/gym-exercises";
import { GYM_KEYS, type AiEleccionComidas, type AiRutinas } from "@/lib/validation/coach";

/** Platos por tipo en el plan guardado. */
const MIN_POR_TIPO = 3;
const MAX_POR_TIPO = 8;
/** Ejercicios válidos mínimos para usar la rutina de la IA (si no, queda la base). */
const MIN_EJERCICIOS = 3;

/** Para comparar nombres: sin mayúsculas, tildes ni espacios de más. */
export function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

// --- Comidas ---

/** Catálogo de platos (sin repetir nombres) con sus ingredientes, para el prompt. */
export function textoCatalogoComidas(): string {
  return MEAL_TYPES.map((t) => {
    const platos = mealBank[t].map(
      (m) => `  - ${m.name} [${m.ingredientes.map((i) => i.id).join(", ")}]`,
    );
    return `${t}:\n${platos.join("\n")}`;
  }).join("\n");
}

export function textoIngredientes(): string {
  return catalogoIngredientes()
    .map((i) => `- ${i.id}: ${i.nombre}${i.porcion === "fija" ? " (porción fija, gramos 0)" : ""}`)
    .join("\n");
}

function platoDelCatalogo(nombre: string, tipo: MealType): Meal | null {
  const buscado = normalizar(nombre);
  // primero en su tipo; si no, en cualquiera (ej. un desayuno elegido como merienda)
  for (const t of [tipo, ...MEAL_TYPES.filter((x) => x !== tipo)]) {
    const meal = mealBank[t].find((m) => normalizar(m.name) === buscado);
    if (meal) return { ...meal, ingredientes: meal.ingredientes.map((i) => ({ ...i })) };
  }
  return null;
}

function platoNuevo(p: AiEleccionComidas[MealType][number]): Meal | null {
  const ingredientes = p.ingredientes
    .filter((i) => esIngredienteConocido(i.id))
    .map((i) =>
      esIngredienteFijo(i.id)
        ? { id: i.id, cantidad: null }
        : { id: i.id, cantidad: Math.max(5, Math.round(i.gramos / 5) * 5) },
    );
  // sin ingredientes conocidos con cantidad, la app no podría calcular el plato
  if (!ingredientes.some((i) => i.cantidad !== null || esIngredienteFijo(i.id))) return null;
  return {
    name: p.nombre,
    detail: p.detalle,
    ingredientes,
    carbLoad: p.carbLoad,
    liviana: p.liviana,
  };
}

/**
 * Elección de la IA → banco de comidas a guardar. Los platos del catálogo se copian tal cual; los
 * nuevos solo con ingredientes conocidos. Si un tipo queda corto, se completa con el catálogo.
 * Devuelve null si la IA no eligió nada usable.
 */
export function bancoDesdeEleccion(eleccion: AiEleccionComidas): MealBank | null {
  let usables = 0;
  const bank = Object.fromEntries(
    MEAL_TYPES.map((t) => {
      const platos: Meal[] = [];
      const nombres = new Set<string>();
      for (const p of eleccion[t]) {
        const meal = p.nuevo ? platoNuevo(p) : platoDelCatalogo(p.nombre, t);
        if (!meal || nombres.has(normalizar(meal.name))) continue;
        nombres.add(normalizar(meal.name));
        platos.push(meal);
      }
      usables += platos.length;
      for (const m of mealBank[t]) {
        if (platos.length >= MIN_POR_TIPO) break;
        if (!nombres.has(normalizar(m.name))) platos.push(m);
      }
      return [t, platos.slice(0, MAX_POR_TIPO)];
    }),
  ) as MealBank;

  if (usables === 0) return null;
  // la carga de hidratos necesita al menos un almuerzo carbLoad
  if (!bank.almuerzo.some((m) => m.carbLoad)) {
    const carb = mealBank.almuerzo.find((m) => m.carbLoad);
    if (carb) bank.almuerzo = [...bank.almuerzo.slice(0, MAX_POR_TIPO - 1), carb];
  }
  return bank;
}

/** Nombres del plan actual, para pedir cambios sobre lo que ya tiene. */
export function textoPlanActual(bank: MealBank): string {
  return MEAL_TYPES.map((t) => `- ${t}: ${bank[t].map((m) => m.name).join("; ")}`).join("\n");
}

// --- Rutinas ---

export function textoCatalogoEjercicios(): string {
  return catalogoEjercicios()
    .map((e) => `- ${e.name}${e.muscles ? ` (${e.muscles})` : ""}`)
    .join("\n");
}

export type RutinasGuardadas = Record<(typeof GYM_KEYS)[number], Routine>;

/**
 * Rutinas de la IA → rutinas a guardar: solo ejercicios del catálogo (tienen foto, video y
 * músculos); calentamiento y vuelta a la calma de la rutina base. Si una rutina queda con pocos
 * ejercicios válidos, queda la base de esa clave.
 */
export function rutinasDesdeEleccion(eleccion: AiRutinas): RutinasGuardadas {
  const catalogo = new Map<string, Exercise>(
    catalogoEjercicios().map((e) => [normalizar(e.name), e]),
  );
  return Object.fromEntries(
    GYM_KEYS.map((key) => {
      const base = gymRoutines[key];
      const vistos = new Set<string>();
      const exercises: Exercise[] = [];
      for (const ex of eleccion[key].exercises) {
        const enCatalogo = catalogo.get(normalizar(ex.name));
        if (!enCatalogo || vistos.has(enCatalogo.name)) continue;
        vistos.add(enCatalogo.name);
        exercises.push({ name: enCatalogo.name, sets: ex.sets, muscles: enCatalogo.muscles });
      }
      const routine: Routine =
        exercises.length >= MIN_EJERCICIOS
          ? { label: eleccion[key].label, warmup: base.warmup, cooldown: base.cooldown, exercises }
          : base;
      return [key, routine];
    }),
  ) as RutinasGuardadas;
}

// --- Meses de rutinas (objetivo músculo / bajar de peso) ---

export const SEMANAS_POR_MES = 4;

/**
 * En qué mes de rutinas está la persona. Si ya pasaron 4 semanas desde que arrancó, el mes
 * terminó: tiene que elegir el objetivo otra vez y se arman rutinas nuevas.
 */
export function estadoMes(cicloInicio: string | undefined, hoy: string) {
  if (!cicloInicio) return null;
  // antes del lunes en que arranca el mes (registrada a mitad de semana) cuenta como la semana 1
  const dias = Math.max(
    0,
    Math.floor(
      (Date.parse(`${hoy}T00:00:00Z`) - Date.parse(`${cicloInicio}T00:00:00Z`)) / 86_400_000,
    ),
  );
  const semana = Math.floor(dias / 7) + 1;
  return {
    semana: Math.min(semana, SEMANAS_POR_MES),
    terminado: semana > SEMANAS_POR_MES,
    diasRestantes: Math.max(0, SEMANAS_POR_MES * 7 - dias),
  };
}

/**
 * Rutinas del mes nuevo contra las del anterior: si una rutina repite más de la mitad de los
 * ejercicios, los repetidos se cambian por otros del catálogo para el mismo rol (variantes A/B/C
 * de la rutina base), hasta que repita como mucho la mitad.
 */
export function variarContraAnterior(
  nuevas: RutinasGuardadas,
  anteriores: RutinasGuardadas,
  alternativas: (key: (typeof GYM_KEYS)[number]) => Exercise[],
): RutinasGuardadas {
  return Object.fromEntries(
    GYM_KEYS.map((key) => {
      const antes = new Set(anteriores[key].exercises.map((e) => e.name));
      const rutina = nuevas[key];
      const maxRepetidos = Math.floor(rutina.exercises.length / 2);
      let repetidos = rutina.exercises.filter((e) => antes.has(e.name)).length;
      if (repetidos <= maxRepetidos) return [key, rutina];

      const usados = new Set(rutina.exercises.map((e) => e.name));
      const libres = alternativas(key).filter((e) => !antes.has(e.name) && !usados.has(e.name));
      const exercises = rutina.exercises.map((e) => {
        if (repetidos <= maxRepetidos || !antes.has(e.name)) return e;
        const otro = libres.shift();
        if (!otro) return e;
        repetidos--;
        return { ...otro, sets: e.sets };
      });
      return [key, { ...rutina, exercises }];
    }),
  ) as RutinasGuardadas;
}

/** El primer lunes desde `iso` (el mismo día si ya es lunes): las semanas del mes son enteras. */
export function primerLunes(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7));
  return d.toISOString().slice(0, 10);
}

/**
 * Lunes en que arranca el mes de rutinas: 4 semanas ENTERAS, así que si se armó (o se registró)
 * un día que no es lunes, el mes empieza el lunes siguiente; los días sueltos de antes son extra.
 * Sin fecha guardada (cuentas que armaron sus rutinas antes de que existieran los meses), cuenta
 * desde que la IA armó sus rutinas. Nunca antes de la primera semana entera desde el registro.
 */
export function inicioDelMes(
  cicloInicio: string | undefined,
  rutinasUpdatedAt: string | undefined,
  planStart?: string,
): string | undefined {
  const base =
    cicloInicio ??
    (rutinasUpdatedAt
      ? new Date(rutinasUpdatedAt).toLocaleDateString("en-CA", {
          timeZone: "America/Argentina/Buenos_Aires",
        })
      : undefined);
  if (!base) return undefined;
  const inicio = primerLunes(base);
  const desdeRegistro = planStart ? primerLunes(planStart) : inicio;
  return inicio > desdeRegistro ? inicio : desdeRegistro;
}

/** Primer día después del mes de rutinas (4 semanas desde su inicio). */
export function finDelMes(inicio: string): string {
  const d = new Date(`${inicio}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + SEMANAS_POR_MES * 7);
  return d.toISOString().slice(0, 10);
}
