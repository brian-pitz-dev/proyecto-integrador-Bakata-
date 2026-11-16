"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton, useLogSubmit } from "@/components/log-form/registro-category-card";
import type { Categoria } from "@/lib/types";
import { toISO, addDays, todayNormalized } from "@/lib/date";

interface NumericLogFormProps {
  categoria: Categoria;
  fieldLabel: string;
  step?: string;
  successMessage: string;
  /** true para categorías que registran el total de las últimas 24hs (calorías, sueño): la fecha por defecto es ayer. */
  defaultToYesterday?: boolean;
}

/**
 * Cómo pesarse para que el número sirva y no se vuelva una obsesión: el peso sube y baja día a día
 * por agua, sal y comida; lo que importa es la tendencia semana a semana.
 */
export const RECOMENDACION_PESO =
  "Recomendación: pesate una vez por semana, siempre el mismo día, a la mañana en ayunas y después de ir al baño. El peso cambia día a día por agua y comida: lo que importa es la tendencia, no un número suelto.";

/** Formulario genérico para categorías de un solo valor numérico (caminata, calorías, peso). */
export function NumericLogForm({
  categoria,
  fieldLabel,
  step = "0.1",
  successMessage,
  defaultToYesterday,
}: NumericLogFormProps) {
  const { formRef, submit } = useLogSubmit(successMessage);
  const fieldId = `${categoria}-valor`;
  const dateId = `${categoria}-fecha`;
  const defaultDate = toISO(
    defaultToYesterday ? addDays(todayNormalized(), -1) : todayNormalized(),
  );

  async function handleSubmit(formData: FormData) {
    const valor = Number(formData.get("valor"));
    const fecha = String(formData.get("fecha") || defaultDate);

    if (!valor) {
      toast.error(`Completá ${fieldLabel.toLowerCase()}.`);
      return;
    }

    await submit({ categoria, fecha, valor });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor={fieldId}>{fieldLabel}</Label>
        <Input
          id={fieldId}
          name="valor"
          type="number"
          step={step}
          min="0"
          required
          aria-describedby={categoria === "peso" ? `${fieldId}-ayuda` : undefined}
        />
        {categoria === "peso" && (
          <p id={`${fieldId}-ayuda`} className="text-xs text-muted-foreground">
            {RECOMENDACION_PESO}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={dateId}>Fecha</Label>
        <Input id={dateId} name="fecha" type="date" defaultValue={defaultDate} />
      </div>
      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
