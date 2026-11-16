"use client";

import type { ReactNode } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ZonasChips } from "@/components/forms/zonas-chips";
import { CamposNivel } from "@/components/perfil/campos-nivel";
import { Field, type Errors } from "@/components/perfil/campos";
import type { Preferencias } from "@/lib/validation/coach";

/**
 * Paso "Tu plan" del registro: nivel de running y de gym, qué no come, zonas a priorizar y equipo.
 * Con esto la IA arma sus comidas y sus rutinas al entrar.
 */
export function PasoTuPlan({
  preferencias,
  setPreferencias,
  errors,
  extra,
}: {
  preferencias: Preferencias;
  setPreferencias: (p: Preferencias) => void;
  errors: Errors;
  /** Lo que va al final del paso (la verificación anti-bot del registro). */
  extra?: ReactNode;
}) {
  return (
    <div className="grid gap-5">
      <CamposNivel
        valor={preferencias}
        onChange={(v) => setPreferencias({ ...preferencias, ...v })}
        errors={errors}
      />
      <Field id="noCome" label="¿Hay algo que no comas?" error={errors.noCome}>
        <Textarea
          id="noCome"
          rows={2}
          maxLength={500}
          value={preferencias.noCome}
          onChange={(e) => setPreferencias({ ...preferencias, noCome: e.target.value })}
          placeholder="Ej: soy vegetariana, no como pescado, intolerancia a la lactosa"
        />
      </Field>
      <ZonasChips
        valor={preferencias.zonas}
        onChange={(zonas) => setPreferencias({ ...preferencias, zonas })}
        legend="Zonas que querés priorizar en el gym"
      />
      <Field id="equipo" label="¿Con qué equipo entrenás?" error={errors.equipo}>
        <Textarea
          id="equipo"
          rows={2}
          maxLength={500}
          value={preferencias.equipo}
          onChange={(e) => setPreferencias({ ...preferencias, equipo: e.target.value })}
          placeholder="Ej: gimnasio completo / en casa con mancuernas hasta 10 kg y bandas"
        />
      </Field>
      {extra}
    </div>
  );
}
