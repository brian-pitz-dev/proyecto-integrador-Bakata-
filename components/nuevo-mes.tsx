"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { HIGHLIGHT } from "@/lib/styles";
import { OBJETIVOS_ENTRENO } from "@/lib/objetivos";
import type { ObjetivoEntreno } from "@/lib/training-plan";
import { armarNuevoMes } from "@/app/(app)/coach/rutinas-actions";
import { OpcionesTarjeta } from "@/components/forms/opciones-tarjeta";
import { ZonasChips } from "@/components/forms/zonas-chips";

/**
 * Terminó el mes de rutinas (4 semanas, objetivo músculo / bajar): elige el objetivo otra vez y
 * se arman las rutinas del mes siguiente, distintas a las del que terminó.
 */
export function NuevoMes({
  objetivo: objetivoInicial,
  zonas: zonasIniciales,
  metaPesoKg,
}: {
  objetivo: ObjetivoEntreno;
  zonas: string[];
  metaPesoKg: number | null;
}) {
  const router = useRouter();
  const [objetivo, setObjetivo] = useState<ObjetivoEntreno>(objetivoInicial);
  const [zonas, setZonas] = useState(zonasIniciales);
  const [meta, setMeta] = useState(metaPesoKg ? String(metaPesoKg) : "");
  const [pedido, setPedido] = useState("");
  const [pending, setPending] = useState(false);

  async function armar() {
    setPending(true);
    try {
      const result = await armarNuevoMes({
        objetivo,
        zonas,
        metaPesoKg: meta.trim() ? Number(meta) : null,
        pedido,
      });
      if (!result.ok) {
        toast.error(result.message ?? "No se pudo armar tu próximo mes.");
        return;
      }
      toast.success("¡Listo! Tus rutinas del nuevo mes ya están en el Calendario.");
      router.refresh();
    } catch {
      toast.error("No se pudo conectar, probá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      className={cn(HIGHLIGHT, "mx-auto grid w-full max-w-4xl gap-5 rounded-[25px] p-6 sm:p-8")}
      aria-labelledby="nuevo-mes-titulo"
    >
      <div className="flex items-start gap-3">
        <PartyPopper
          className="mt-1 size-6 shrink-0 text-primary dark:text-white"
          aria-hidden="true"
        />
        <div>
          <h2 id="nuevo-mes-titulo" className="text-2xl font-semibold">
            ¡Terminaste tu mes de entrenamiento!
          </h2>
          <p className="text-sm text-muted-foreground dark:text-white/80">
            Elegí tu objetivo para el próximo mes y armamos rutinas nuevas, distintas a las de este
            mes para que el cuerpo siga progresando. Usa 1 consulta de IA.
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <OpcionesTarjeta
          legend="¿Qué querés lograr este mes?"
          opciones={OBJETIVOS_ENTRENO}
          valor={objetivo}
          onChange={setObjetivo}
          className="bg-background/60 dark:bg-white/5"
        />
        {objetivo === "evento" && (
          <p className="text-sm text-muted-foreground dark:text-white/80">
            Cargá tu carrera o caminata en Mi perfil → Tus eventos y el plan se arma para llegar.
          </p>
        )}
      </div>

      <ZonasChips valor={zonas} onChange={setZonas} />

      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <div className="grid gap-1.5">
          <label htmlFor="nuevo-mes-meta" className="text-sm font-medium">
            Peso al que querés llegar
          </label>
          <Input
            id="nuevo-mes-meta"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={30}
            max={300}
            placeholder="kg"
            value={meta}
            onChange={(e) => setMeta(e.target.value)}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="nuevo-mes-pedido" className="text-sm font-medium">
            ¿Algo que quieras cambiar? (opcional)
          </label>
          <Input
            id="nuevo-mes-pedido"
            maxLength={1000}
            placeholder="Ej: más glúteos, menos tiempo por sesión"
            value={pedido}
            onChange={(e) => setPedido(e.target.value)}
          />
        </div>
      </div>

      <Button className="justify-self-start" onClick={armar} loading={pending} disabled={pending}>
        {pending ? "Armando tu próximo mes…" : "Armar mi próximo mes"}
      </Button>
    </section>
  );
}
