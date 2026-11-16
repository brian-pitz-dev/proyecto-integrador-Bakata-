"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addDays, fromISO, toISO } from "@/lib/date";
import type { Movimiento } from "@/lib/mover";
import { deshacerMovimientos } from "@/app/registro/mover-actions";

/** Si la persona movió días de esta semana: lo avisa y deja volver a como la armó el plan. */
export function SemanaMovida({ lunes, movimientos }: { lunes: string; movimientos: Movimiento[] }) {
  const router = useRouter();
  const domingo = toISO(addDays(fromISO(lunes), 6));
  if (!movimientos.some((m) => m.desde >= lunes && m.desde <= domingo)) return null;

  async function deshacer() {
    const r = await deshacerMovimientos(lunes);
    if (!r.ok) {
      toast.error(r.message ?? "No se pudo deshacer.");
      return;
    }
    toast.success("La semana volvió a como estaba.");
    router.refresh();
  }

  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      Moviste días de esta semana.
      <Button variant="link" size="sm" className="h-auto p-0" onClick={deshacer}>
        Volver a como estaba
      </Button>
    </p>
  );
}
