import type { Session, UserEvent, Week } from "@/lib/training-plan";
import type { Routine } from "@/lib/gym-exercises";
import { cn } from "@/lib/utils";
import { SURFACE } from "@/lib/styles";
import { SessionList } from "@/components/calendar-grid/session-list";
import { DoneButton } from "@/components/calendar-grid/done-button";
import { MoverDia } from "@/components/calendar-grid/mover-dia";

/**
 * Un día de la semana en el Calendario: descanso (línea punteada) o sus sesiones, con el círculo
 * para marcarlo hecho y el botón para moverlo a otro día de la semana.
 */
export function DiaCard({
  fecha,
  dayLabel,
  sessions,
  routines,
  weekNum,
  isDone,
  hoy,
  disabled,
  onToggle,
  mover,
}: {
  fecha: string;
  dayLabel: string;
  sessions: Session[];
  routines?: Record<string, Routine>;
  weekNum: number;
  isDone: boolean;
  hoy: string;
  disabled: boolean;
  onToggle: () => void;
  mover: { lunes: string; weeks: Week[]; events: UserEvent[] };
}) {
  const dia = Number(fecha.slice(8, 10));
  if (sessions.every((s) => s.tag === "rest")) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border px-6 py-4 text-sm text-muted-foreground">
        <span className="w-14 shrink-0 text-center tabular-nums">
          {dayLabel} {dia}
        </span>
        <span>{sessions[0].label}</span>
      </div>
    );
  }

  const esHoy = fecha === hoy;
  const esEvento = sessions.some((s) => s.tag === "event" || s.tag === "luj");
  return (
    <div
      className={cn(
        SURFACE,
        "flex items-start gap-4 p-4 transition-colors sm:gap-5 sm:p-6",
        isDone ? "bg-accent/10 ring-accent/50" : "ring-foreground/5 dark:ring-white/10",
        esHoy && !isDone && "ring-2 ring-primary",
      )}
    >
      <div
        className={cn(
          "grid w-12 shrink-0 place-items-center rounded-2xl py-2 text-center",
          esHoy ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        <p
          className={cn("text-xs", esHoy ? "text-primary-foreground/80" : "text-muted-foreground")}
        >
          {dayLabel}
        </p>
        <p className="font-heading text-2xl leading-tight font-semibold tabular-nums">{dia}</p>
      </div>
      <SessionList sessions={sessions} fecha={fecha} routines={routines} weekNum={weekNum} />
      <div className="flex shrink-0 flex-col items-center gap-2">
        <DoneButton isDone={isDone} disabled={disabled} onClick={onToggle} />
        {fecha >= hoy && !isDone && !esEvento && <MoverDia fecha={fecha} hoy={hoy} {...mover} />}
      </div>
    </div>
  );
}
