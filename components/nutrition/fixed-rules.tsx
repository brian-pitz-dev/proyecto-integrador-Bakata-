import { FIXED_RULES } from "@/lib/meal-plan";
import { SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function FixedRules() {
  return (
    <div className={cn(SURFACE, "p-6 text-sm text-muted-foreground")}>
      <p className="mb-3 font-heading text-lg font-semibold text-foreground">Reglas fijas</p>
      <ul className="grid list-disc gap-2 pl-4 marker:text-primary">
        {FIXED_RULES.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}
