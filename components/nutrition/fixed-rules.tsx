import { reglasNutricion, type TipoDia } from "@/lib/meal-plan";
import { SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

/** Reglas de alimentación para esta persona y este día (objetivo y lo que entrena). */
export function FixedRules({
  objetivo,
  tipoDia,
}: {
  objetivo?: "musculo" | "bajar" | "evento";
  tipoDia?: TipoDia | null;
}) {
  return (
    <div className={cn(SURFACE, "p-6 text-sm text-muted-foreground")}>
      <p className="mb-3 font-heading text-lg font-semibold text-foreground">
        Para tener en cuenta
      </p>
      <ul className="grid list-disc gap-2 pl-4 marker:text-primary">
        {reglasNutricion({ objetivo, tipoDia }).map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}
