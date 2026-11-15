import { Card, CardContent } from "@/components/ui/card";
import type { DayMeal } from "@/lib/meal-plan";

export function MealCard({ meal }: { meal: DayMeal }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <span className="w-fit shrink-0 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold whitespace-nowrap text-primary sm:w-32 sm:text-center dark:bg-primary/20 dark:text-[#d6b8f2]">
          {meal.label}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-foreground">{meal.meal.name}</p>
          <p className="text-sm text-muted-foreground">{meal.meal.detail}</p>
        </div>
        <p className="shrink-0 text-sm text-muted-foreground tabular-nums sm:text-right">
          <span className="font-heading text-xl font-semibold text-foreground">
            {meal.proteinG.toFixed(1)}
          </span>{" "}
          g proteína
        </p>
      </CardContent>
    </Card>
  );
}
