/**
 * Consultas por día que ve y puede usar el usuario. El tope duro de la base (consumir_uso_ia(),
 * supabase/migrations/20261112120000_coach_ia.sql) es AI_HARD_LIMIT: los 2 de diferencia quedan
 * para el armado inicial del plan después del registro, que no cuenta en estas 18.
 * Archivo aparte (sin imports) para que componentes del cliente, como el tutorial, lo usen sin
 * arrastrar el resto de lib/coach.ts al navegador.
 */
export const AI_DAILY_LIMIT = 18;
/** Igual al límite hardcodeado en consumir_uso_ia(). */
export const AI_HARD_LIMIT = 20;
/** Consultas que usa el armado inicial (comidas + rutinas). */
export const AI_USOS_PLAN_INICIAL = AI_HARD_LIMIT - AI_DAILY_LIMIT;
