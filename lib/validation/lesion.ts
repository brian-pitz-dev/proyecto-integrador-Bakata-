import { z } from "zod";

/** Mismos valores que los check de supabase/migrations/20261116200000_lesion.sql. */
export const TIPOS_LESION = [
  "fractura",
  "fisura",
  "esguince",
  "desgarro",
  "contractura",
  "tendinitis",
  "luxacion",
  "cirugia",
  "otra",
] as const;
export const ZONAS_LESION = [
  "cuello",
  "hombro",
  "codo",
  "muneca_mano",
  "espalda_alta",
  "lumbar",
  "cadera",
  "muslo",
  "rodilla",
  "pantorrilla",
  "tobillo_pie",
] as const;
export const LADOS = ["izquierdo", "derecho", "ambos"] as const;
export const GRAVEDADES = ["leve", "moderada", "grave"] as const;

export type TipoLesion = (typeof TIPOS_LESION)[number];
export type ZonaLesion = (typeof ZONAS_LESION)[number];
export type Gravedad = (typeof GRAVEDADES)[number];

/** Zonas sin lado (están en el medio del cuerpo). */
export const ZONAS_SIN_LADO: readonly ZonaLesion[] = ["cuello", "espalda_alta", "lumbar"];

const fecha = z.iso.date("Fecha inválida");

/** Lo que se carga en el formulario de Progreso (y valida guardarLesion en el servidor). */
export const lesionSchema = z
  .object({
    tipo: z.enum(TIPOS_LESION, "Elegí el tipo"),
    zona: z.enum(ZONAS_LESION, "Elegí la zona"),
    lado: z.enum(LADOS).nullable(),
    gravedad: z.enum(GRAVEDADES, "Elegí la gravedad"),
    desde: fecha,
    hasta: fecha.nullable(),
    nota: z.string().trim().max(280, "Hasta 280 caracteres").nullable(),
  })
  .refine((l) => !l.hasta || l.hasta >= l.desde, {
    message: "El alta no puede ser antes del inicio",
    path: ["hasta"],
  });

export type LesionInput = z.infer<typeof lesionSchema>;
