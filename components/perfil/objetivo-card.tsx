"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AVISO } from "@/lib/styles";
import { OBJETIVOS_ENTRENO } from "@/lib/objetivos";
import type { Preferencias } from "@/lib/validation/coach";
import { CamposNivel } from "@/components/perfil/campos-nivel";
import type { ObjetivoEntreno } from "@/lib/training-plan";
import { guardarObjetivo } from "@/app/(app)/perfil/actions";
import { OpcionesTarjeta } from "@/components/forms/opciones-tarjeta";
import { ZonasChips } from "@/components/forms/zonas-chips";

/** Objetivo y zonas a priorizar: cambian cómo se arma la semana, sin usar IA. */
type Nivel = Pick<Preferencias, "nivelCardio" | "kmSemana" | "nivelGym">;

export function ObjetivoCard({
  objetivo: inicial,
  zonas: zonasIniciales,
  nivel: nivelInicial,
}: {
  objetivo: ObjetivoEntreno | undefined;
  zonas: string[];
  nivel: Nivel;
}) {
  const router = useRouter();
  const [objetivo, setObjetivo] = useState(inicial);
  const [zonas, setZonas] = useState(zonasIniciales);
  const [nivel, setNivel] = useState<Nivel>(nivelInicial);
  const [pending, setPending] = useState(false);

  async function guardar() {
    if (!objetivo || !nivel.nivelCardio || !nivel.nivelGym) {
      toast.error("Elegí tu objetivo y tu nivel de running y de gym.");
      return;
    }
    setPending(true);
    try {
      const result = await guardarObjetivo({
        objetivo,
        zonas,
        nivelCardio: nivel.nivelCardio,
        kmSemana: nivel.kmSemana ?? null,
        nivelGym: nivel.nivelGym,
      });
      if (!result.ok) {
        toast.error(result.message ?? "No se pudo guardar.");
        return;
      }
      toast.success(
        result.cambioObjetivo
          ? "Listo: tu plan se rearmó con tu nuevo objetivo. Si querés rutinas y comidas pensadas para él, pedíselo a la IA en Coach y Nutrición."
          : "Listo: tu plan se rearmó.",
        { duration: result.cambioObjetivo ? 8000 : undefined },
      );
      router.refresh();
    } catch {
      toast.error("No se pudo conectar, probá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu objetivo y tu nivel</CardTitle>
        <CardDescription>
          Decide cómo se arma tu semana: centrada en el gym o en preparar tus eventos, qué zonas
          tienen más días y desde dónde arrancás. El core suma un día por semana salvo que lo
          priorices.
        </CardDescription>
        {(!nivelInicial.nivelCardio || !nivelInicial.nivelGym) && (
          <p className={AVISO}>
            Completá tu nivel: hasta entonces, tu preparación usa la plantilla general en vez de
            armarse según vos.
          </p>
        )}
      </CardHeader>
      <CardContent className="grid gap-5">
        <OpcionesTarjeta
          legend="¿Qué querés lograr?"
          opciones={OBJETIVOS_ENTRENO}
          valor={objetivo}
          onChange={setObjetivo}
        />
        <ZonasChips valor={zonas} onChange={setZonas} />
        <CamposNivel valor={nivel} onChange={setNivel} />
        <Button
          className="justify-self-start"
          onClick={guardar}
          loading={pending}
          disabled={pending}
        >
          {pending ? "Rearmando tu plan…" : "Guardar objetivo"}
        </Button>
      </CardContent>
    </Card>
  );
}
