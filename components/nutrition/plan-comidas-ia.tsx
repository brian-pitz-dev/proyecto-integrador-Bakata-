"use client";

import { AVISO } from "@/lib/styles";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { armarComidas } from "@/app/(app)/coach/comidas-actions";
import { Textarea } from "@/components/ui/textarea";

/**
 * Tu plan de comidas: lo arma la IA al registrarte (eligiendo platos; las porciones las calcula
 * la app). Acá se le piden cambios, con el mismo límite diario de consultas que el Coach.
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
  const [pedido, setPedido] = useState("");
  const [busy, setBusy] = useState(false);
  const [usados, setUsados] = useState(usosHoy);
  const restantes = Math.max(0, limite - usados);
  const sinCuota = restantes === 0;
  // con plan, pedir un cambio necesita texto; sin plan, se puede armar con lo que ya sabemos
  const sinPedido = tieneComidas && pedido.trim().length < 3;

  async function handleArmar() {
    setBusy(true);
    try {
      const result = await armarComidas({ pedido });
      // la cuota se descuenta antes de la IA: un intento fallido también cuenta
      if (result.cobrado) setUsados((u) => u + 1);
      if (!result.ok) {
        toast.error(result.message ?? "Algo salió mal.");
        return;
      }
      toast.success(tieneComidas ? "Listo, cambiamos tu plan." : "Listo, armamos tu plan.");
      setPedido("");
      router.refresh();
    } catch {
      toast.error("No se pudo conectar, probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/12 text-primary dark:bg-primary/20 dark:text-[#d6b8f2]">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          Tu plan de comidas
        </CardTitle>
        <CardDescription>
          {tieneComidas
            ? "Lo armó la IA con tus datos y lo que no comés; las porciones se calculan solas según tu peso, tu meta y lo que entrenás cada día. ¿Querés cambiar algo? Pedíselo (usa 1 consulta)."
            : "Todavía no tenés un plan armado para vos: por ahora ves un plan base. Armalo con IA (podés contar qué querés comer o qué no comés)."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {desactualizado && (
          <p className={AVISO}>
            Tus eventos o tu perfil cambiaron desde que se armó este plan. Las porciones ya se
            ajustan solas; si querés otros platos, pedí un cambio.
          </p>
        )}
        <Label htmlFor="comidas-pedido">
          {tieneComidas
            ? "¿Qué querés cambiar?"
            : "¿Algo que quieras o no quieras comer? (opcional)"}
        </Label>
        <Textarea
          id="comidas-pedido"
          rows={3}
          maxLength={1000}
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
          placeholder="Ej: no como pescado, quiero desayunos dulces, sumá lentejas"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleArmar} loading={busy} disabled={busy || sinCuota || sinPedido}>
            {busy ? "Armando…" : tieneComidas ? "Pedir cambio" : "Armar mi plan"}
          </Button>
          <span className="ml-auto text-xs text-muted-foreground tabular-nums" aria-live="polite">
            Te quedan {restantes}/{limite} consultas de IA hoy
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
