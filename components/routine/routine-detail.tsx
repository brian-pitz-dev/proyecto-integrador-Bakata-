import type { Routine } from "@/lib/gym-exercises";
import { cn } from "@/lib/utils";

const CHIP = "rounded-full bg-primary/12 text-primary dark:bg-primary/20 dark:text-[#d6b8f2]";

/**
 * Tarjeta de una rutina del plan, con el mismo estilo que las rutinas de mancuernas:
 * título, bajada, chip de entrada en calor y ejercicios separados con series y músculo.
 */
export function RoutineDetail({
  routine,
  eyebrow,
  title,
  className,
}: {
  routine: Routine;
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <article className={cn("grid", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold tracking-wide text-primary uppercase dark:text-[#d6b8f2]">
          {eyebrow}
        </p>
      )}
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{routine.label}</p>
      {routine.warmup && (
        <p className={cn(CHIP, "mt-3 w-fit px-3 py-1 text-xs font-semibold")}>
          Entrada en calor: {routine.warmup}
        </p>
      )}

      <div className="mt-5 grid divide-y divide-border">
        {routine.exercises.map((ex, i) => (
          <div key={`${i}-${ex.name}`} className="grid gap-1.5 py-4 first:pt-0 last:pb-0">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold">{ex.name}</span>
              <span
                className={cn(CHIP, "shrink-0 px-2.5 py-0.5 text-xs font-semibold tabular-nums")}
              >
                {ex.sets}
              </span>
            </div>
            {ex.muscles && (
              <span className="text-xs font-medium text-primary dark:text-[#d6b8f2]">
                {ex.muscles}
              </span>
            )}
          </div>
        ))}
      </div>

      {routine.notes && routine.notes.length > 0 && (
        <ul className="mt-5 grid gap-1.5 text-sm text-muted-foreground">
          {routine.notes.map((note) => (
            <li key={note}>
              <span className="font-semibold text-foreground">Tip:</span> {note}
            </li>
          ))}
        </ul>
      )}
      {routine.cooldown && (
        <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Vuelta a la calma:</span>{" "}
          {routine.cooldown}
        </p>
      )}
    </article>
  );
}
