"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  TrainingFields,
  readTrainingFields,
  trainingFieldsError,
} from "@/components/training/training-fields";
import { updateTraining } from "@/app/perfil/actions";
import { DAY_SHORT, DEFAULT_DAYS } from "@/lib/strength-schedule";
import {
  LUGAR_LABELS,
  NIVEL_LABELS,
  OBJETIVO_LABELS,
  type TrainingProfile,
} from "@/lib/training-profile";

/** Resumen del perfil de entrenamiento + modal para cambiarlo (usuarios que ya hicieron el onboarding). */
export function TrainingPrefsDialog({ training }: { training: TrainingProfile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = readTrainingFields(new FormData(event.currentTarget));
    const invalid = trainingFieldsError(values);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setPending(true);
    const result = await updateTraining(values);
    setPending(false);
    if (result.ok) {
      toast.success("Listo, adaptamos tu plan.");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message ?? "No se pudo guardar.");
    }
  }

  const summary = [
    NIVEL_LABELS[training.nivel].label,
    OBJETIVO_LABELS[training.objetivo].label,
    `${training.diasGym} días de fuerza: ${(training.diasFuerza ?? DEFAULT_DAYS[training.diasGym]).map((d) => DAY_SHORT[d]).join(", ")}`,
    LUGAR_LABELS[training.lugar].label,
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {summary.map((item) => (
        <span
          key={item}
          className="rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-[#d6b8f2]"
        >
          {item}
        </span>
      ))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="ghost" size="sm" className="rounded-full" />}>
          <SlidersHorizontal className="size-4" aria-hidden="true" /> Ajustar
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Tu entrenamiento</DialogTitle>
          </DialogHeader>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <TrainingFields defaults={training} />
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : "Guardar y adaptar el plan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
