import { z } from "zod";
import { NOTA_MAX } from "@/lib/fotos";

export const categoriaSchema = z.enum([
  "tirada",
  "caminata",
  "calorias",
  "peso",
  "sueno",
  "completado",
  "evento",
]);

const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

/**
 * Rango válido de `valor` por categoría. Un error de tipeo (780 kg en vez de 78) no tiene que llegar
 * a la base: el último peso alimenta las calorías, los macros y las porciones de Nutrición.
 * El peso usa el mismo rango que el de las fotos (datosFotoSchema).
 */
export const RANGO_VALOR: Record<
  z.infer<typeof categoriaSchema>,
  { min: number; max: number; texto: string }
> = {
  tirada: { min: 0.1, max: 200, texto: "La distancia va entre 0,1 y 200 km." },
  caminata: { min: 0.1, max: 200, texto: "La distancia va entre 0,1 y 200 km." },
  calorias: { min: 1, max: 10_000, texto: "Las calorías van entre 1 y 10.000." },
  peso: { min: 20, max: 400, texto: "El peso va entre 20 y 400 kg." },
  sueno: { min: 0.1, max: 24, texto: "El sueño va entre 0 y 24 horas." },
  completado: { min: 1, max: 1, texto: "Valor inválido." },
  evento: { min: 0.1, max: 1000, texto: "La distancia va entre 0,1 y 1000 km." },
};

export const saveLogSchema = z
  .object({
    categoria: categoriaSchema,
    fecha: fechaSchema,
    valor: z.number().finite(),
    nota: z.string().max(500).nullish(),
  })
  .superRefine(({ categoria, valor }, ctx) => {
    const { min, max, texto } = RANGO_VALOR[categoria];
    if (valor < min || valor > max)
      ctx.addIssue({ code: "custom", path: ["valor"], message: texto });
  });

export const toggleDayDoneSchema = z.object({
  fecha: fechaSchema,
  isDone: z.boolean(),
});

/** "" = sin dato (null); si no, un número entre `min` y `max`. Llega como texto del formulario. */
const opcional = (min: number, max: number) =>
  z
    .union([z.literal(""), z.coerce.number().min(min).max(max)])
    .transform((v) => (v === "" ? null : v));

/**
 * Datos que acompañan una foto de progreso (spec 007). Parcial: el que no viene no se toca; el
 * que viene vacío (null) se borra.
 */
export const datosFotoSchema = z
  .object({
    nota: z
      .string()
      .trim()
      .max(NOTA_MAX)
      .transform((v) => v || null),
    peso: opcional(20, 400),
    grasa: opcional(2, 70),
  })
  .partial();

export type DatosFoto = z.output<typeof datosFotoSchema>;
