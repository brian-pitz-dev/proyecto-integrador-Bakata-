/**
 * Superficie de tarjeta de la app, con el mismo lenguaje que la tarjeta de login/registro:
 * esquinas de 20px, sombra violeta suave en claro y borde sutil en oscuro.
 * Para casos donde no conviene usar <Card> (listas, <details>, botones).
 */
export const SURFACE =
  "rounded-[20px] bg-card shadow-[0_4px_12px_0_rgba(92,53,116,0.08)] ring-1 ring-foreground/5 dark:shadow-[0_8px_24px_0_rgba(10,4,20,0.45)] dark:ring-white/10";

/**
 * Tarjeta destacada (Hoy, proteína del día, entrenamientos de la semana): lila suave en
 * claro y violeta del login en oscuro. Sin radio ni padding: cada uso define los suyos.
 */
export const HIGHLIGHT =
  "bg-[linear-gradient(135deg,#ffffff_0%,#f7e8fa_100%)] shadow-[0_4px_12px_0_rgba(92,53,116,0.08)] ring-1 ring-primary/15 dark:bg-[linear-gradient(135deg,#6b2fa3_0%,#2e1748_100%)] dark:text-white dark:shadow-[0_10px_30px_-8px_rgba(10,4,20,0.6)] dark:ring-white/10";

/** Bloque gris de carga (skeleton), con el tinte lila de la app. */
export const SKELETON = "animate-pulse rounded-full bg-primary/10 dark:bg-white/10";

/** Avisos suaves (plan desactualizado, nivel sin completar): violeta de la marca, no amarillo. */
export const AVISO =
  "rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary ring-1 ring-primary/15 dark:bg-primary/15 dark:text-[#d6b8f2] dark:ring-white/10";
