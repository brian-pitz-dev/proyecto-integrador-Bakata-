"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DayPicker } from "@/components/training/training-fields";
import { updateWeekDays } from "@/app/perfil/actions";
import { DAY_SHORT, DEFAULT_DAYS, validateStrengthDays } from "@/lib/strength-schedule";
import type { DayKey } from "@/lib/training-plan";
import type { TrainingProfile } from "@/lib/training-profile";

/** Cambiar los días de fuerza de una sola semana, sin tocar los días habituales. */
export function WeekDaysDialog({
  weekStart,
  weekLabel,
  training,
}: {
  weekStart: string;
  weekLabel: string;
  training: TrainingProfile;
}) {
  const router = useRouter();
  const habitual = training.diasFuerza ?? DEFAULT_DAYS[training.diasGym];
  const override = training.diasFuerzaSemana[weekStart];
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<DayKey[]>(override ?? habitual);
  const [pending, setPending] = useState(false);

  async function save(next: DayKey[] | null) {
    if (next) {
      const error = validateStrengthDays(training.diasGym, next);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setPending(true);
    const sameAsHabitual = next?.join() === habitual.join();
    const result = await updateWeekDays({ weekStart, days: sameAsHabitual ? null : next });
    setPending(false);
    if (result.ok) {
      toast.success(
        next && !sameAsHabitual
          ? "Cambiamos los días de esta semana."
          : "Esta semana vuelve a tus días habituales.",
      );
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message ?? "No se pudo guardar.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDays(override ?? habitual);
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" className="rounded-full" />}>
        <CalendarCog className="size-4" aria-hidden="true" />
        {override ? "Días cambiados esta semana" : "Cambiar días de esta semana"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fuerza · {weekLabel}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Solo cambia esta semana. Tus días habituales son{" "}
          {habitual.map((d) => DAY_SHORT[d]).join(", ")}.
        </p>
        <DayPicker
          diasGym={training.diasGym}
          days={days}
          onChange={setDays}
          legend="¿Qué días entrenás esta semana?"
          baseline={habitual}
          baselineLabel="tus días habituales"
        />
        <div className="flex flex-wrap justify-end gap-2">
          {override && (
            <Button variant="ghost" disabled={pending} onClick={() => save(null)}>
              Volver a los habituales
            </Button>
          )}
          <Button disabled={pending} onClick={() => save(days)}>
            {pending ? "Guardando…" : "Guardar esta semana"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
