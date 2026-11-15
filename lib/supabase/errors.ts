/** Error de PostgREST/Postgres por una columna que no existe (migración pendiente). */
export function isMissingColumnError(error: { code?: string } | null | undefined): boolean {
  return error?.code === "PGRST204" || error?.code === "42703";
}
