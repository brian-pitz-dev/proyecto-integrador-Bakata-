"use client";

import { LogDialog } from "@/components/log-form/registro-category-card";
import { SleepForm } from "@/components/log-form/sleep-form";
import { CalorieForm } from "@/components/log-form/calorie-form";
import { NumericLogForm } from "@/components/log-form/numeric-log-form";

const HERO_BUTTON =
  "rounded-full border-primary/25 bg-white px-3.5 text-primary hover:bg-primary/8 hover:text-primary dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white";

/** Botones para registrar sueño, calorías y peso desde la tarjeta de "Hoy". */
export function RegistrosRapidos() {
  return (
    <div className="relative flex flex-wrap gap-2">
      <LogDialog title="Sueño" buttonLabel="Sueño" triggerClassName={HERO_BUTTON}>
        <SleepForm />
      </LogDialog>
      <LogDialog title="Calorías" buttonLabel="Calorías" triggerClassName={HERO_BUTTON}>
        <CalorieForm />
      </LogDialog>
      <LogDialog title="Peso" buttonLabel="Peso" triggerClassName={HERO_BUTTON}>
        <NumericLogForm
          categoria="peso"
          fieldLabel="Peso (kg)"
          step="0.1"
          successMessage="Peso guardado"
        />
      </LogDialog>
    </div>
  );
}
