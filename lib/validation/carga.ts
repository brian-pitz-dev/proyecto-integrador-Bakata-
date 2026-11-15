import { z } from "zod";

/** Categoría de `registro` para la carga de un ejercicio: valor = kg, nota = nombre del ejercicio. */
export const CATEGORIA_CARGA = "carga";

export const cargaSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  ejercicio: z.string().trim().min(1).max(120),
  /** null = borrar la carga de ese día. */
  kg: z.number().finite().min(0).max(1000).nullable(),
});

export interface Carga {
  fecha: string;
  ejercicio: string;
  kg: number;
}
