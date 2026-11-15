import type { Metadata } from "next";
import { getUserPlanContext } from "@/lib/user-plan";
import { NutricionClient } from "@/components/nutrition/nutricion-client";
import { PlanComidasIA } from "@/components/nutrition/plan-comidas-ia";
import { getIaEstado } from "@/lib/ia-estado";
import { AI_DAILY_LIMIT } from "@/lib/coach";

export const metadata: Metadata = {
  title: "Nutrición · Bakata",
  description:
    "Plan de comidas del día: desayuno, almuerzo, merienda y cena, con rotación semanal.",
  alternates: { canonical: "/nutricion" },
};

export default async function NutricionPage() {
  const [planContext, ia] = await Promise.all([getUserPlanContext(), getIaEstado()]);
  if (!planContext) return null; // proxy.ts ya redirige a /onboarding antes de esto
  const { planIa } = planContext;
  return (
    <NutricionClient
      weeks={planContext.weeks}
      mealBank={planIa.comidas}
      planIa={
        <PlanComidasIA
          tieneComidas={!!planIa.comidas}
          desactualizado={ia.isStale(planIa.comidasUpdatedAt)}
          usosHoy={ia.usosHoy}
          limite={AI_DAILY_LIMIT}
        />
      }
    />
  );
}
