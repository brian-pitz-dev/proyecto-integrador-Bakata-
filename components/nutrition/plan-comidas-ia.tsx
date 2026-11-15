"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { borrarPlanIa, generarPlanComidas } from "@/app/(app)/coach/actions";

const TEXTAREA =
  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30";

type Busy = null | "agregar" | "reemplazar" | "borrar";

/**
 * Plan de comidas con IA (antes en Coach): suma platos a la rotación o arma un plan nuevo.
 * Comparte el límite diario de consultas con el Coach.
 */
export function PlanComidasIA({
  tieneComidas,
  desactualizado,
  usosHoy,
  limite,
}: {
  tieneComidas: boolean;
  desactualizado: boolean;
  usosHoy: number;
  limite: number;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [usados, setUsados] = useState(usosHoy);
  const restantes = Math.max(0, limite - usados);
  const sinCuota = restantes === 0;

  async function handleComidas(modo: "agregar" | "reemplazar") {
    setBusy(modo);
    try {
      const result = await generarPlanComidas({ texto, modo });
      // la cuota se descuenta antes de la IA: un intento fallido también cuenta
      if (result.cobrado) setUsados((u) => u + 1);
      if (!result.ok) {
        toast.error(result.message ?? "Algo salió mal.");
        return;
      }
      toast.success(
        modo === "agregar"
          ? `Sumamos ${result.agregados ?? 0} platos a tu rotación.`
          : "Listo, armamos tu plan de comidas nuevo.",
      );
      setTexto("");
      router.refresh();
    } catch {
      toast.error("No se pudo conectar, probá de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  async function handleBorrar() {
    setBusy("borrar");
    try {
      const result = await borrarPlanIa("comidas");
      if (!result.ok) {
        toast.error(result.message ?? "Algo salió mal.");
        return;
      }
      toast.success("Volviste al plan base.");
      router.refresh();
    } catch {
      toast.error("No se pudo conectar, probá de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/12 text-primary dark:bg-primary/20 dark:text-[#d6b8f2]">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          Armá tus comidas con IA
        </CardTitle>
        <CardDescription>
          Contá qué ingredientes o comidas tenés o querés comer. Podés sumarlos a tu rotación o
          armar un plan nuevo desde cero. Las porciones se ajustan solas a tu meta calórica.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {desactualizado && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Tus eventos o tu perfil cambiaron desde que generaste este plan. Conviene rearmarlo.
          </p>
        )}
        <Label htmlFor="comidas-texto">Ingredientes o comidas</Label>
        <textarea
          id="comidas-texto"
          rows={3}
          maxLength={1000}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej: tengo lentejas, atún, batata y huevos; me gustan las tartas; no como pescado"
          className={TEXTAREA}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => handleComidas("agregar")}
            loading={busy === "agregar"}
            disabled={!!busy || sinCuota || texto.trim().length < 3}
          >
            {busy === "agregar" ? "Agregando…" : "Agregar al plan"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleComidas("reemplazar")}
            loading={busy === "reemplazar"}
            disabled={!!busy || sinCuota || texto.trim().length < 3}
          >
            {busy === "reemplazar" ? "Armando…" : "Armar plan nuevo"}
          </Button>
          {tieneComidas && (
            <Button
              variant="ghost"
              onClick={handleBorrar}
              loading={busy === "borrar"}
              disabled={!!busy}
            >
              Volver al plan base
            </Button>
          )}
          <span className="ml-auto text-xs text-muted-foreground tabular-nums" aria-live="polite">
            Te quedan {restantes}/{limite} consultas de IA hoy
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
