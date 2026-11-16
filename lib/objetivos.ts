import type { ObjetivoEntreno } from "@/lib/training-plan";

/** Opciones de "¿Qué querés lograr?" (registro y perfil). */
export const OBJETIVOS_ENTRENO: { value: ObjetivoEntreno; label: string; detalle: string }[] = [
  { value: "musculo", label: "Ganar músculo / tonificar", detalle: "Plan centrado en el gym" },
  { value: "bajar", label: "Bajar de peso", detalle: "Gym + cardio" },
  {
    value: "evento",
    label: "Preparar una carrera o caminata",
    detalle: "Running o caminata con gym de apoyo",
  },
];

/** "¿Cómo estás con el running/caminata?": decide desde dónde arranca la preparación. */
export const NIVELES_CARDIO_OPCIONES = [
  { value: "nuevo", label: "No corro", detalle: "Camino o arranco de cero" },
  { value: "base", label: "Corro un poco", detalle: "Puedo correr 20-30' seguidos" },
  { value: "regular", label: "Corro seguido", detalle: "Salgo a correr todas las semanas" },
] as const;

/** "¿Cuánta experiencia tenés en el gym?": decide el volumen de las rutinas. */
export const NIVELES_GYM_OPCIONES = [
  { value: "principiante", label: "Principiante", detalle: "Menos de 6 meses o nunca" },
  { value: "intermedio", label: "Intermedio", detalle: "Entreno hace 6 meses a 2 años" },
  { value: "avanzado", label: "Avanzado", detalle: "Más de 2 años, sé mis pesos" },
] as const;
