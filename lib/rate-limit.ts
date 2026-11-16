import { headers } from "next/headers";

// shortcut: los contadores viven en la memoria de cada instancia. Netlify corre
// las funciones en varias instancias en paralelo (y las reinicia en cada cold
// start), así que el tope real es "N por instancia", no N en total: frena a un
// usuario apurado, no a un ataque distribuido (para eso está Turnstile). Pasar a
// un store compartido (ej. Upstash Ratelimit) si hace falta un tope global.
function limiter(windowMs: number, max: number) {
  const attempts = new Map<string, { count: number; windowStart: number }>();
  return {
    /** true si `key` ya llegó al máximo en la ventana actual. */
    isLimited(key: string): boolean {
      const entry = attempts.get(key);
      if (!entry) return false;
      if (Date.now() - entry.windowStart > windowMs) {
        attempts.delete(key);
        return false;
      }
      return entry.count >= max;
    },
    /** Suma un intento; si la ventana anterior venció, arranca una nueva. */
    record(key: string): void {
      const entry = attempts.get(key);
      const now = Date.now();
      if (!entry || now - entry.windowStart > windowMs) {
        attempts.set(key, { count: 1, windowStart: now });
        return;
      }
      entry.count += 1;
    },
    clear(key: string): void {
      attempts.delete(key);
    },
  };
}

/** Login: 5 intentos fallidos cada 5 minutos, por IP. */
export const loginLimiter = limiter(5 * 60 * 1000, 5);
/** Registro: 5 intentos cada 5 minutos, por IP. */
export const signupLimiter = limiter(5 * 60 * 1000, 5);
/** Recuperar contraseña: 5 pedidos cada 15 minutos, por IP (cada uno manda un mail). */
export const recuperarLimiter = limiter(15 * 60 * 1000, 5);
/** saveLog: 20 registros por minuto, por usuario. */
export const saveLogLimiter = limiter(60 * 1000, 20);
/** Cargas por ejercicio: 60 por minuto, por usuario (una rutina tiene ~6 ejercicios). */
export const cargaLimiter = limiter(60 * 1000, 60);
/** Coach: 5 llamadas por minuto, por usuario (protege el límite por minuto del tier gratis de Gemini). */
export const coachLimiter = limiter(60 * 1000, 5);
/** Strava: 3 importaciones por minuto, por usuario (la API de Strava da 100 pedidos cada 15'). */
export const stravaLimiter = limiter(60 * 1000, 3);

/**
 * IP del cliente para los límites de login y registro. Primero la que pone Netlify: el primer
 * valor de x-forwarded-for lo puede mandar el propio cliente, y cambiándolo en cada pedido nunca
 * llegaría al límite. x-forwarded-for queda para local y otros hosts.
 */
export async function getClientKey(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-nf-client-connection-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
