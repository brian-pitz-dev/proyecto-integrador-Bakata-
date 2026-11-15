import { Card, CardContent } from "@/components/ui/card";
import { formatPortion, type DayMeal } from "@/lib/meal-plan";

export function MealCard({
  meal,
  factor,
  personalizado = false,
}: {
  meal: DayMeal;
  factor: number;
  /** Banco base ajustado a la persona: las cantidades del texto original no aplican. */
  personalizado?: boolean;
}) {
  const portion = personalizado || factor !== 1 ? formatPortion(meal.meal) : "";
  // el texto original trae las cantidades de referencia ("200g pollo…"): con porción propia, confunde
  const detail = personalizado && /\d/.test(meal.meal.detail) ? "" : meal.meal.detail;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <span className="w-fit shrink-0 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold whitespace-nowrap text-primary sm:w-32 sm:text-center dark:bg-primary/20 dark:text-[#d6b8f2]">
          {meal.label}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground">{meal.meal.name}</p>
          {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
          {portion && (
            <p className="text-sm text-foreground">
              {personalizado ? "Tu porción" : "Porción para tu meta"}:{" "}
              <span className="tabular-nums">{portion}</span>
            </p>
          )}
        </div>
        <dl className="grid shrink-0 grid-cols-3 gap-x-4 text-center tabular-nums sm:w-56">
          <Macro label="proteína" value={meal.proteinG} destacado />
          <Macro label="hidratos" value={meal.hcG} />
          <Macro label="grasas" value={meal.grasaG} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Macro({
  label,
  value,
  destacado = false,
}: {
  label: string;
  value: number | null;
  destacado?: boolean;
}) {
  return (
    <div className="grid">
      <dd
        className={
          destacado
            ? "font-heading text-xl font-semibold text-foreground"
            : "font-heading text-lg font-semibold text-foreground/85"
        }
      >
        {value === null ? "—" : `${Math.round(value)} g`}
      </dd>
      <dt className="order-last text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}
