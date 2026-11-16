"use client";

import { Input } from "@/components/ui/input";
import { NIVELES_CARDIO_OPCIONES, NIVELES_GYM_OPCIONES } from "@/lib/objetivos";
import type { Preferencias } from "@/lib/validation/coach";
import { OpcionesTarjeta } from "@/components/forms/opciones-tarjeta";

type Nivel = Pick<Preferencias, "nivelCardio" | "kmSemana" | "nivelGym">;

/**
 * Nivel de running/caminata (+ km por semana si ya corre) y de gym: con esto el plan arranca desde
 * donde está la persona (registro y Perfil).
 */
export function CamposNivel({
  valor,
  onChange,
  errors = {},
}: {
  valor: Nivel;
  onChange: (v: Nivel) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="grid gap-5">
      <OpcionesTarjeta
        legend="¿Cómo estás con el running o la caminata?"
        opciones={NIVELES_CARDIO_OPCIONES}
        valor={valor.nivelCardio}
        onChange={(nivelCardio) => onChange({ ...valor, nivelCardio })}
        error={errors.nivelCardio}
      />
      {valor.nivelCardio === "regular" && (
        <div className="grid max-w-xs gap-1.5">
          <label htmlFor="kmSemana" className="text-sm font-medium">
            ¿Cuántos km corrés por semana, más o menos? (opcional)
          </label>
          <Input
            id="kmSemana"
            type="number"
            inputMode="decimal"
            min={0}
            max={250}
            value={valor.kmSemana ?? ""}
            onChange={(e) =>
              onChange({
                ...valor,
                kmSemana: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      )}
      <OpcionesTarjeta
        legend="¿Cuánta experiencia tenés en el gym?"
        opciones={NIVELES_GYM_OPCIONES}
        valor={valor.nivelGym}
        onChange={(nivelGym) => onChange({ ...valor, nivelGym })}
        error={errors.nivelGym}
      />
    </div>
  );
}
