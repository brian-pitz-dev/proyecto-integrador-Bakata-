"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { DayKey } from "@/lib/training-plan";
import {
  DAY_SHORT,
  DEFAULT_DAYS,
  GROUP_LABEL,
  GROUP_PATTERN,
  WEEK_DAYS,
  arrangeGroups,
  validateStrengthDays,
} from "@/lib/strength-schedule";
import {
  DEFAULT_TRAINING,
  DIAS_GYM,
  LUGARES,
  LUGAR_LABELS,
  NIVELES,
  NIVEL_LABELS,
  OBJETIVOS,
  OBJETIVO_LABELS,
  type DiasGym,
  type Lugar,
  type Nivel,
  type Objetivo,
  type TrainingProfile,
} from "@/lib/training-profile";

type TrainingValues = Omit<TrainingProfile, "edad" | "diasFuerzaSemana">;

function ChoiceGroup<T extends string | number>({
  name,
  legend,
  options,
  defaultValue,
  columns = "sm:grid-cols-3",
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string; hint?: string }[];
  defaultValue: T;
  columns?: string;
  onChange?: (value: T) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className={cn("grid gap-2", columns)}>
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer flex-col gap-0.5 rounded-xl border border-border px-3.5 py-2.5 text-sm transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={o.value === defaultValue}
              onChange={() => onChange?.(o.value)}
              className="sr-only"
            />
            <span className="font-semibold">{o.label}</span>
            {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Selector de días de fuerza. `baseline`: días "por defecto" de este contexto (los
 * sugeridos por el plan, o los habituales del usuario al editar una semana puntual).
 */
export function DayPicker({
  diasGym,
  days,
  onChange,
  legend = "¿Qué días hacés fuerza?",
  baseline,
  baselineLabel = "los sugeridos",
}: {
  diasGym: DiasGym;
  days: DayKey[];
  onChange: (days: DayKey[]) => void;
  legend?: string;
  baseline?: DayKey[];
  baselineLabel?: string;
}) {
  const error = validateStrengthDays(diasGym, days);
  const arranged = error ? null : arrangeGroups(days, GROUP_PATTERN[diasGym]);
  const groupOf = (day: DayKey) => arranged?.find((a) => a.day === day)?.group;
  const base = baseline ?? DEFAULT_DAYS[diasGym];
  const isDefault = days.join() === base.join();

  function toggle(day: DayKey) {
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    onChange(WEEK_DAYS.filter((d) => next.includes(d)));
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK_DAYS.map((day) => {
          const active = days.includes(day);
          const group = groupOf(day);
          return (
            <button
              key={day}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(day)}
              className={cn(
                "grid gap-0.5 rounded-xl border px-1 py-2 text-center text-sm transition-colors",
                active
                  ? "border-primary bg-primary/10 font-semibold"
                  : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              {DAY_SHORT[day]}
              <span className="h-4 text-[10px] leading-4 font-medium text-primary dark:text-[#d6b8f2]">
                {active && group ? (group === "sup" ? "Superior" : "Inferior") : ""}
              </span>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="diasFuerza" value={isDefault && !baseline ? "" : days.join(",")} />
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {isDefault ? `Son ${baselineLabel}. ` : ""}
          Nunca repetimos {GROUP_LABEL.sup.toLowerCase()} o {GROUP_LABEL.inf.toLowerCase()} dos días
          seguidos, para que el músculo descanse.
          {!isDefault && (
            <>
              {" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-2 hover:underline dark:text-[#d6b8f2]"
                onClick={() => onChange(base)}
              >
                Volver a {baselineLabel}
              </button>
            </>
          )}
        </p>
      )}
    </fieldset>
  );
}

/** Preguntas de entrenamiento (onboarding y edición); se leen con readTrainingFields. */
export function TrainingFields({ defaults = DEFAULT_TRAINING }: { defaults?: TrainingValues }) {
  const [diasGym, setDiasGym] = useState<DiasGym>(defaults.diasGym);
  const [days, setDays] = useState<DayKey[]>(defaults.diasFuerza ?? DEFAULT_DAYS[defaults.diasGym]);

  return (
    <div className="grid gap-5">
      <ChoiceGroup<Nivel>
        name="nivel"
        legend="Experiencia con pesas"
        defaultValue={defaults.nivel}
        options={NIVELES.map((v) => ({ value: v, ...NIVEL_LABELS[v] }))}
      />
      <ChoiceGroup<Objetivo>
        name="objetivo"
        legend="Objetivo principal"
        defaultValue={defaults.objetivo}
        columns="sm:grid-cols-2"
        options={OBJETIVOS.map((v) => ({ value: v, ...OBJETIVO_LABELS[v] }))}
      />
      <ChoiceGroup<DiasGym>
        name="diasGym"
        legend="Días de fuerza por semana"
        defaultValue={defaults.diasGym}
        columns="grid-cols-4"
        options={DIAS_GYM.map((v) => ({ value: v, label: `${v} días` }))}
        onChange={(v) => {
          setDiasGym(v);
          setDays(DEFAULT_DAYS[v]);
        }}
      />
      <DayPicker diasGym={diasGym} days={days} onChange={setDays} />
      <ChoiceGroup<Lugar>
        name="lugar"
        legend="¿Dónde entrenás?"
        defaultValue={defaults.lugar}
        options={LUGARES.map((v) => ({ value: v, ...LUGAR_LABELS[v] }))}
      />
    </div>
  );
}

export function readTrainingFields(formData: FormData): TrainingValues {
  const dias = String(formData.get("diasFuerza") ?? "");
  return {
    nivel: String(formData.get("nivel") ?? DEFAULT_TRAINING.nivel) as Nivel,
    objetivo: String(formData.get("objetivo") ?? DEFAULT_TRAINING.objetivo) as Objetivo,
    diasGym: Number(formData.get("diasGym") ?? DEFAULT_TRAINING.diasGym) as DiasGym,
    diasFuerza: dias ? (dias.split(",") as DayKey[]) : null,
    lugar: String(formData.get("lugar") ?? DEFAULT_TRAINING.lugar) as Lugar,
  };
}

/** Error de días de fuerza para cortar el submit antes de llamar al servidor. */
export function trainingFieldsError(values: TrainingValues): string | null {
  return values.diasFuerza ? validateStrengthDays(values.diasGym, values.diasFuerza) : null;
}
