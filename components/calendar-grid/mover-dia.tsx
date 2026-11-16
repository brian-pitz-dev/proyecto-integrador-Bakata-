"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addDays, formatShort, fromISO, toISO, WEEKDAY_LABELS } from "@/lib/date";
import { getSessionsForDate, type UserEvent, type Week } from "@/lib/training-plan";
import { motivoNoMover } from "@/lib/mover";
import { cn } from "@/lib/utils";
import { moverDia } from "@/app/registro/mover-actions";

/** Resumen corto de un día para la lista: "Gym · Running" o "Descanso". */
function resumen(weeks: Week[], events: UserEvent[], iso: string): string {
  const sesiones = getSessionsForDate(weeks, events, fromISO(iso)).filter((s) => s.tag !== "core");
  return [...new Set(sesiones.map((s) => s.label))].join(" · ") || "Descanso";
}

/**
 * "Mover este día": pasa el entrenamiento a otro día de la misma semana (se intercambian). Los
 * días que no se pueden elegir muestran por qué (días pasados, eventos o el mismo músculo en días
 * seguidos). Solo afecta a esta semana.
 */
export function MoverDia({
  fecha,
  lunes,
  weeks,
  events,
  hoy,
}: {
  fecha: string;
  lunes: string;
  weeks: Week[];
  events: UserEvent[];
  hoy: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const dias = Array.from({ length: 7 }, (_, i) => toISO(addDays(fromISO(lunes), i)));

  async function mover(hasta: string) {
    setPending(hasta);
    try {
      const result = await moverDia({ desde: fecha, hasta });
      if (!result.ok) {
        toast.error(result.message ?? "No se pudo mover.");
        return;
      }
      toast.success("Listo, cambiamos el día. Solo afecta a esta semana.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("No se pudo conectar, probá de nuevo.");
    } finally {
      setPending(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="xs"
            aria-label={`Mover el entrenamiento del ${formatShort(fromISO(fecha))} a otro día`}
            title="Mover a otro día"
          />
        }
      >
        <ArrowLeftRight aria-hidden="true" />
        Mover
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mover a otro día</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Elegí el día: los dos días se intercambian. Solo cambia esta semana, y nunca quedan dos
          días seguidos del mismo músculo.
        </p>
        <ul className="grid gap-2">
          {dias
            .filter((d) => d !== fecha)
            .map((d) => {
              const motivo = motivoNoMover(weeks, events, fecha, d, hoy);
              const i = (fromISO(d).getDay() + 6) % 7;
              return (
                <li key={d}>
                  <button
                    type="button"
                    disabled={!!motivo || !!pending}
                    onClick={() => mover(d)}
                    className={cn(
                      "grid w-full gap-0.5 rounded-xl border p-3 text-left transition-colors",
                      motivo
                        ? "cursor-not-allowed border-dashed border-border opacity-60"
                        : "border-border hover:border-primary hover:bg-primary/8",
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {WEEKDAY_LABELS[i]} {fromISO(d).getDate()}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {resumen(weeks, events, d)}
                      </span>
                      {pending === d && " · moviendo…"}
                    </span>
                    {motivo && <span className="text-xs text-muted-foreground">{motivo}</span>}
                  </button>
                </li>
              );
            })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
