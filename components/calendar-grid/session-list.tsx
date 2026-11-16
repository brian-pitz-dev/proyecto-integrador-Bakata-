import type { Session, SessionTag } from "@/lib/training-plan";
import type { Routine } from "@/lib/gym-exercises";
import { cn } from "@/lib/utils";
import { ExerciseBlock } from "@/components/calendar-grid/exercise-block";

// Franja de color por tipo de sesión: violeta = correr/cardio, azul = fuerza
const TAG_STRIPE: Record<SessionTag, string> = {
  run: "border-run",
  long: "border-run",
  walk: "border-run",
  event: "border-run",
  luj: "border-run",
  gym: "border-gym",
  core: "border-gym",
  rest: "border-border",
};

export function SessionList({
  sessions,
  routines,
  weekNum,
  fecha,
  inverse = false,
}: {
  sessions: Session[];
  /** Día (ISO) de estas sesiones. */
  fecha: string;
  routines?: Record<string, Routine>;
  /** Semana del plan, para la variante A/B/C de las rutinas compartidas. */
  weekNum?: number;
  /** Dentro de la tarjeta destacada de "Hoy" (lila en claro, violeta en oscuro). */
  inverse?: boolean;
}) {
  return (
    <div className="grid min-w-0 flex-1 gap-5">
      {sessions.map((s, i) => (
        <div
          key={i}
          className={cn(
            "min-w-0 rounded-r-md border-l-[3px] pl-3",
            inverse ? "border-primary/60 dark:border-white/60" : TAG_STRIPE[s.tag],
          )}
        >
          <p
            className={cn(
              "font-semibold break-words",
              inverse ? "text-foreground dark:text-white" : "text-foreground",
            )}
          >
            {s.label}
          </p>
          {s.detail && (
            <p
              className={cn(
                "text-sm break-words",
                inverse ? "text-muted-foreground dark:text-white/75" : "text-muted-foreground",
              )}
            >
              {s.detail}
            </p>
          )}
          {s.motivo && (
            <p
              className={cn(
                "mt-1 text-xs font-medium first-letter:uppercase",
                inverse ? "text-primary dark:text-white/80" : "text-primary",
              )}
            >
              {s.reemplaza ? `En lugar de: ${s.reemplaza} · ${s.motivo}` : s.motivo}
            </p>
          )}
          <ExerciseBlock
            gymKey={s.gymKey}
            coreKey={s.coreKey}
            routines={routines}
            maxEjercicios={s.maxEjercicios}
            weekNum={weekNum}
            fecha={fecha}
            evitar={s.evitar}
            inverse={inverse}
          />
        </div>
      ))}
    </div>
  );
}
