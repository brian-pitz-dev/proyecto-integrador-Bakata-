import { ajustarRutinaNivel, coreRoutines, getGymRoutine, type Routine } from "@/lib/gym-exercises";
import { cn } from "@/lib/utils";
import { filtrarPorLesion, type Evitar } from "@/lib/ejercicios-zonas";
import { ExerciseThumb, VideoLink } from "@/components/calendar-grid/exercise-media";
import { CargaInput, SetsLabel, useNivelGym } from "@/components/calendar-grid/cargas";

export function ExerciseBlock({
  gymKey,
  coreKey,
  routines,
  maxEjercicios,
  weekNum,
  fecha,
  evitar,
  inverse = false,
}: {
  gymKey?: string;
  coreKey?: string;
  /** Con poco tiempo por sesión se muestran solo los primeros (los compuestos van primero). */
  maxEjercicios?: number;
  /** Rutinas propias del usuario (IA); si no tiene la gymKey, cae a la compartida. */
  routines?: Record<string, Routine>;
  /** Semana del plan: elige la variante A/B/C de la rutina compartida (rota cada 4 semanas). */
  weekNum?: number;
  /** Día (ISO) de la sesión: para anotar el peso usado en cada ejercicio de gym. */
  fecha?: string;
  /** Lesiones activas ese día: se sacan los ejercicios que las cargan (specs/011-lesiones). */
  evitar?: Evitar[];
  /** Dentro de la tarjeta destacada de "Hoy" (lila en claro, violeta en oscuro). */
  inverse?: boolean;
}) {
  const nivelGym = useNivelGym();
  // las rutinas de la IA ya vienen armadas para su nivel; las base se ajustan acá
  const routine = gymKey
    ? (routines?.[gymKey] ?? ajustarRutinaNivel(getGymRoutine(gymKey, weekNum), nivelGym))
    : coreKey
      ? coreRoutines[coreKey]
      : undefined;
  if (!routine) return null;
  // primero se sacan los que cargan la lesión y después va el tope por tiempo
  const { quedan, sacados } = filtrarPorLesion(routine.exercises, evitar);
  const exercises = quedan.slice(0, maxEjercicios);
  // peso por ejercicio solo en gym (el core es con peso corporal) y no en series por tiempo
  const conCarga = (sets: string) => !!gymKey && !!fecha && !/seg\b/.test(sets);
  const trenInferior = !!gymKey?.startsWith("inferior");
  const muted = inverse ? "text-muted-foreground dark:text-white/70" : "text-muted-foreground";

  return (
    <details className="group mt-1 text-sm">
      <summary
        className={cn(
          "cursor-pointer",
          inverse
            ? "text-muted-foreground hover:text-foreground dark:text-white/75 dark:hover:text-white"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {routine.label} ({exercises.length} {exercises.length === 1 ? "ejercicio" : "ejercicios"})
      </summary>
      <div
        className={cn(
          "mt-2 grid gap-2.5 border-l-2 pl-3",
          inverse ? "border-primary/25 dark:border-white/25" : "border-border",
        )}
      >
        {routine.warmup && (
          <p className={cn("text-xs", muted)}>
            <span className="font-semibold">Entrada en calor:</span> {routine.warmup}
          </p>
        )}
        {sacados.length > 0 && (
          <p className="text-xs font-medium text-primary dark:text-[#d6b8f2]">
            {exercises.length === 0
              ? "Ningún ejercicio de esta rutina se puede hacer sin cargar tu lesión: hoy, solo movilidad suave."
              : `Sin ${sacados.map((e) => e.name.toLowerCase()).join(", ")}: cargan tu lesión.`}
          </p>
        )}
        <ul className="grid gap-3">
          {exercises.map((ex, i) => (
            <li key={`${i}-${ex.name}`} className="flex items-start gap-3">
              <ExerciseThumb exercise={ex} />
              <div className="grid min-w-0 flex-1 gap-0.5">
                {/* flex-wrap: en pantallas angostas las series bajan a otra línea en vez de salirse */}
                <div className="flex flex-wrap justify-between gap-x-3">
                  <span className="min-w-0 font-medium">{ex.name}</span>
                  {conCarga(ex.sets) ? (
                    <SetsLabel
                      ejercicio={ex.name}
                      fecha={fecha!}
                      sets={ex.sets}
                      trenInferior={trenInferior}
                      className={cn("ml-auto text-right tabular-nums", muted)}
                    />
                  ) : (
                    <span className={cn("ml-auto text-right tabular-nums", muted)}>{ex.sets}</span>
                  )}
                </div>
                {ex.muscles && <span className={cn("text-xs", muted)}>{ex.muscles}</span>}
                <VideoLink name={ex.name} className="w-fit" />
                {conCarga(ex.sets) && (
                  <CargaInput
                    ejercicio={ex.name}
                    fecha={fecha!}
                    sets={ex.sets}
                    trenInferior={trenInferior}
                    inverse={inverse}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
        {routine.cooldown && (
          <p className={cn("text-xs", muted)}>
            <span className="font-semibold">Vuelta a la calma:</span> {routine.cooldown}
          </p>
        )}
      </div>
    </details>
  );
}
