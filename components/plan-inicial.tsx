"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrandIcon } from "@/components/brand-icon";
import { armarComidas } from "@/app/(app)/coach/comidas-actions";
import { armarRutinas } from "@/app/(app)/coach/rutinas-actions";
import { terminarPlanInicial } from "@/app/(app)/coach/plan-inicial-actions";

/**
 * Después del registro: la IA arma el plan de comidas y las rutinas de la persona con lo que
 * contó (perfil, eventos, qué no come, zonas y equipo). Las dos llamadas van en paralelo, cada una
 * en su propia request (cada función tiene su tope de tiempo). Pase lo que pase se baja la marca
 * plan_pendiente: si algo falla queda el plan base y se puede pedir desde Nutrición / Coach.
 */
export function PlanInicial({ equipo, zonas }: { equipo: string; zonas: string[] }) {
  const router = useRouter();
  const [paso, setPaso] = useState("Armando tus comidas y tus rutinas…");
  const arranco = useRef(false);

  useEffect(() => {
    // en desarrollo React monta dos veces: que no se pida el plan dos veces
    if (arranco.current) return;
    arranco.current = true;

    async function armar() {
      const [comidas, rutinas] = await Promise.all([
        armarComidas({ pedido: "", inicial: true }).catch(() => ({ ok: false as const })),
        armarRutinas({ pedido: "", equipo, zonas, inicial: true }).catch(() => ({
          ok: false as const,
        })),
      ]);
      setPaso("¡Listo!");
      const cobradas = [comidas, rutinas].filter((r) => "cobrado" in r && r.cobrado).length;
      await terminarPlanInicial(cobradas).catch(() => null);
      if (comidas.ok && rutinas.ok) toast.success("Tu plan está listo.");
      else
        toast.error(
          `No pudimos armar ${!comidas.ok && !rutinas.ok ? "tu plan" : !comidas.ok ? "tus comidas" : "tus rutinas"} con IA. Por ahora ves el plan base; podés pedirlo desde ${!comidas.ok ? "Nutrición" : "Coach"}.`,
          { duration: 10000 },
        );
      router.refresh();
    }
    void armar();
  }, [equipo, zonas, router]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/95 px-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="grid max-w-sm justify-items-center gap-5 text-center">
        <BrandIcon className="size-16 animate-pulse drop-shadow-sm" />
        <div className="grid gap-2">
          <p className="font-heading text-2xl font-semibold">Estamos armando tu plan</p>
          <p className="text-sm text-muted-foreground">{paso}</p>
          <p className="text-xs text-muted-foreground">
            Puede tardar hasta un minuto. No usa tus consultas de IA del día.
          </p>
        </div>
      </div>
    </div>
  );
}
