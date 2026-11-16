"use client";

import type { Dispatch, SetStateAction } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OpcionesTarjeta } from "@/components/forms/opciones-tarjeta";
import {
  CamposEvento,
  emptyEvento,
  Field,
  invalid,
  type Errors,
  type EventoDraft,
  type PerfilDraft,
} from "@/components/perfil/campos";
import { OBJETIVOS_ENTRENO as OBJETIVOS } from "@/lib/objetivos";
import type { Preferencias } from "@/lib/validation/coach";

/**
 * Paso "Objetivo" del registro: qué quiere lograr y, según eso, el peso al que quiere llegar
 * (músculo / bajar) o sus carreras y caminatas (evento).
 */
export function PasoObjetivo({
  preferencias,
  setPreferencias,
  perfil,
  setPerfil,
  eventos,
  setEventos,
  errors,
}: {
  preferencias: Preferencias;
  setPreferencias: (p: Preferencias) => void;
  perfil: PerfilDraft;
  setPerfil: (p: PerfilDraft) => void;
  eventos: EventoDraft[];
  setEventos: Dispatch<SetStateAction<EventoDraft[]>>;
  errors: Errors;
}) {
  return (
    <div className="grid gap-3">
      <OpcionesTarjeta
        legend="¿Qué querés lograr?"
        opciones={OBJETIVOS}
        valor={preferencias.objetivo}
        onChange={(objetivo) => setPreferencias({ ...preferencias, objetivo })}
        error={errors.objetivo}
      />
      {preferencias.objetivo && preferencias.objetivo !== "evento" && (
        <Field
          id="metaPesoKg"
          label="¿A qué peso querés llegar? (kg)"
          error={errors.metaPesoKg}
          className="max-w-xs"
        >
          <Input
            id="metaPesoKg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="30"
            max="300"
            placeholder={perfil.pesoInicialKg ? `Hoy: ${perfil.pesoInicialKg} kg` : "kg"}
            value={perfil.metaPesoKg}
            onChange={(e) => setPerfil({ ...perfil, metaPesoKg: e.target.value })}
            {...invalid(errors, "metaPesoKg", "metaPesoKg")}
          />
        </Field>
      )}
      {preferencias.objetivo === "evento" &&
        eventos.map((ev, i) => {
          const k = (f: string) => `eventos.${i}.${f}`;
          const set = (patch: Partial<EventoDraft>) =>
            setEventos((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
          return (
            <fieldset key={i} className="rounded-lg border border-border p-3">
              <legend className="px-1 text-sm font-medium">Evento {i + 1}</legend>
              <CamposEvento
                ev={ev}
                set={set}
                errors={errors}
                idSuffix={String(i)}
                k={k}
                onRemove={
                  eventos.length > 1
                    ? () => setEventos((prev) => prev.filter((_, idx) => idx !== i))
                    : undefined
                }
                removeLabel={`Quitar evento ${i + 1}`}
              />
            </fieldset>
          );
        })}
      {preferencias.objetivo === "evento" && (
        <Button
          type="button"
          variant="outline"
          className="justify-self-start"
          onClick={() => setEventos((prev) => [...prev, emptyEvento()])}
        >
          <Plus aria-hidden="true" /> Agregar otro evento
        </Button>
      )}
    </div>
  );
}
