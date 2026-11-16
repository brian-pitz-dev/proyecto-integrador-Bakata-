"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Opciones } from "@/components/ui/select";
import { OpcionesTarjeta } from "@/components/forms/opciones-tarjeta";
import { Field, invalid, type Errors } from "@/components/perfil/campos";
import {
  altaSugerida,
  duracionSugerida,
  TIPO_LABEL,
  ZONA_LABEL,
  type Lesion,
} from "@/lib/lesiones";
import {
  TIPOS_LESION,
  ZONAS_LESION,
  ZONAS_SIN_LADO,
  type Gravedad,
  type TipoLesion,
  type ZonaLesion,
} from "@/lib/validation/lesion";
import { toISO, todayNormalized } from "@/lib/date";

/**
 * Campos de una lesión (specs/011-lesiones): los usan la tarjeta de Progreso y el paso "Tu plan"
 * del registro.
 */

const TIPOS = TIPOS_LESION.map((t) => ({ value: t, label: TIPO_LABEL[t] }));
const ZONAS = ZONAS_LESION.map((z) => ({
  value: z,
  label: ZONA_LABEL[z][0].toUpperCase() + ZONA_LABEL[z].slice(1),
}));
const LADOS = [
  { value: "izquierdo", label: "Izquierdo" },
  { value: "derecho", label: "Derecho" },
  { value: "ambos", label: "Ambos" },
];
const GRAVEDADES = [
  { value: "leve", label: "Leve", detalle: "Molesta, pero podés moverte" },
  { value: "moderada", label: "Moderada", detalle: "Duele al hacer fuerza o con impacto" },
  { value: "grave", label: "Grave", detalle: "Inmoviliza o te indicaron reposo" },
] as const;

export interface LesionDraft {
  tipo: TipoLesion | "";
  zona: ZonaLesion | "";
  lado: string;
  gravedad?: Gravedad;
  desde: string;
  hasta: string;
  /** La persona cambió el alta a mano: ya no se pisa con la sugerida. */
  hastaManual: boolean;
  nota: string;
}

export const lesionVacia = (): LesionDraft => ({
  tipo: "",
  zona: "",
  lado: "",
  desde: toISO(todayNormalized()),
  hasta: "",
  hastaManual: false,
  nota: "",
});

export const lesionADraft = (l: Lesion): LesionDraft => ({
  tipo: l.tipo,
  zona: l.zona,
  lado: l.lado ?? "",
  gravedad: l.gravedad,
  desde: l.desde,
  hasta: l.hasta ?? "",
  hastaManual: true,
  nota: l.nota ?? "",
});

/** Lo que se valida con lesionSchema y se manda al servidor. */
export const lesionAInput = (d: LesionDraft) => ({
  tipo: d.tipo,
  zona: d.zona,
  lado: d.zona && !ZONAS_SIN_LADO.includes(d.zona) && d.lado ? d.lado : null,
  gravedad: d.gravedad,
  desde: d.desde,
  hasta: d.hasta || null,
  nota: d.nota.trim() || null,
});

/** Aplica un cambio; si el alta no se tocó a mano, la vuelve a sugerir según tipo y gravedad. */
export function conCambio(prev: LesionDraft, patch: Partial<LesionDraft>): LesionDraft {
  const d = { ...prev, ...patch };
  if (!d.hastaManual && d.tipo && d.gravedad && d.desde) {
    d.hasta = altaSugerida(d.tipo, d.gravedad, d.desde) ?? "";
  }
  return d;
}

export function CamposLesion({
  draft,
  set,
  errors,
  id,
  k = (campo) => campo,
}: {
  draft: LesionDraft;
  set: (patch: Partial<LesionDraft>) => void;
  errors: Errors;
  /** Sufijo de los id de los campos (puede haber más de un formulario en la página). */
  id: string;
  /** Clave de cada campo en `errors` (ej. "lesion.tipo" en el registro). */
  k?: (campo: string) => string;
}) {
  const semanas =
    draft.tipo && draft.gravedad ? duracionSugerida(draft.tipo, draft.gravedad) : null;
  const conLado = draft.zona !== "" && !ZONAS_SIN_LADO.includes(draft.zona);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-6">
        <Field id={`tipo-${id}`} label="Tipo" error={errors[k("tipo")]} className="sm:col-span-2">
          <Opciones
            id={`tipo-${id}`}
            items={TIPOS}
            value={draft.tipo}
            placeholder="Elegí"
            onChange={(v) => set({ tipo: v as TipoLesion })}
            {...invalid(errors, k("tipo"), `tipo-${id}`)}
          />
        </Field>
        <Field id={`zona-${id}`} label="Zona" error={errors[k("zona")]} className="sm:col-span-2">
          <Opciones
            id={`zona-${id}`}
            items={ZONAS}
            value={draft.zona}
            placeholder="Elegí"
            onChange={(v) => set({ zona: v as ZonaLesion })}
            {...invalid(errors, k("zona"), `zona-${id}`)}
          />
        </Field>
        {conLado && (
          <Field id={`lado-${id}`} label="Lado" className="sm:col-span-2">
            <Opciones
              id={`lado-${id}`}
              items={LADOS}
              value={draft.lado}
              placeholder="Elegí"
              onChange={(v) => set({ lado: v })}
            />
          </Field>
        )}
      </div>
      <OpcionesTarjeta
        legend="Gravedad"
        opciones={GRAVEDADES}
        valor={draft.gravedad}
        onChange={(g) => set({ gravedad: g })}
        error={errors[k("gravedad")]}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id={`desde-${id}`} label="Desde" error={errors[k("desde")]}>
          <Input
            id={`desde-${id}`}
            type="date"
            value={draft.desde}
            onChange={(e) => set({ desde: e.target.value })}
            {...invalid(errors, k("desde"), `desde-${id}`)}
          />
        </Field>
        <Field
          id={`hasta-${id}`}
          label="Alta estimada (opcional)"
          error={errors[k("hasta")]}
          hint={
            semanas
              ? `Sugerencia orientativa: ${semanas} ${semanas === 1 ? "semana" : "semanas"}. Seguí lo que te indique tu médico.`
              : "Poné la que te indicó tu médico. Vacía: hasta que marques “Ya estoy bien”."
          }
        >
          <Input
            id={`hasta-${id}`}
            type="date"
            min={draft.desde}
            value={draft.hasta}
            onChange={(e) => set({ hasta: e.target.value, hastaManual: true })}
            {...invalid(errors, k("hasta"), `hasta-${id}`)}
          />
        </Field>
      </div>
      <Field id={`nota-${id}`} label="Nota (opcional)" error={errors[k("nota")]}>
        <Textarea
          id={`nota-${id}`}
          rows={2}
          maxLength={280}
          placeholder="Ej: me lo indicó el traumatólogo"
          value={draft.nota}
          onChange={(e) => set({ nota: e.target.value })}
        />
      </Field>
    </div>
  );
}

/** Consentimiento expreso para guardar datos de salud (Ley 25.326; research.md, Decisión 6). */
export function ConsentimientoSalud({
  checked,
  onChange,
  error,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-primary"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          {...(error ? { "aria-invalid": true, "aria-describedby": "consiento-error" } : {})}
        />
        <span>
          Acepto que Bakata guarde esta información de salud solo para ajustar mi plan (ver{" "}
          <Link
            href="/privacidad"
            target="_blank"
            className="font-semibold underline underline-offset-2"
          >
            privacidad
          </Link>
          ).
        </span>
      </label>
      {error && (
        <p id="consiento-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
