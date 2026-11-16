"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bandage, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Opciones } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpcionesTarjeta } from "@/components/forms/opciones-tarjeta";
import { Field, errorsOf, invalid, type Errors } from "@/components/perfil/campos";
import { borrarLesion, cerrarLesion, guardarLesion } from "@/app/(app)/progreso/lesiones-actions";
import {
  activaEn,
  altaSugerida,
  describirLesion,
  duracionSugerida,
  GRAVEDAD_LABEL,
  TIPO_LABEL,
  ZONA_LABEL,
  type Lesion,
} from "@/lib/lesiones";
import {
  lesionSchema,
  TIPOS_LESION,
  ZONAS_LESION,
  ZONAS_SIN_LADO,
  type Gravedad,
  type LesionInput,
  type TipoLesion,
  type ZonaLesion,
} from "@/lib/validation/lesion";
import { formatShort, fromISO, toISO, todayNormalized } from "@/lib/date";
import { cn } from "@/lib/utils";

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

interface Draft {
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

const vacio = (): Draft => ({
  tipo: "",
  zona: "",
  lado: "",
  desde: toISO(todayNormalized()),
  hasta: "",
  hastaManual: false,
  nota: "",
});

const aDraft = (l: Lesion): Draft => ({
  tipo: l.tipo,
  zona: l.zona,
  lado: l.lado ?? "",
  gravedad: l.gravedad,
  desde: l.desde,
  hasta: l.hasta ?? "",
  hastaManual: true,
  nota: l.nota ?? "",
});

const aInput = (d: Draft) => ({
  tipo: d.tipo,
  zona: d.zona,
  lado: d.zona && !ZONAS_SIN_LADO.includes(d.zona) && d.lado ? d.lado : null,
  gravedad: d.gravedad,
  desde: d.desde,
  hasta: d.hasta || null,
  nota: d.nota.trim() || null,
});

const fecha = (iso: string) => formatShort(fromISO(iso));

/** Lesiones al final de Progreso (specs/011-lesiones): cargar, "Ya estoy bien", editar, borrar. */
export function LesionesCard({
  lesiones,
  consentida,
}: {
  lesiones: Lesion[];
  /** Ya aceptó guardar datos de salud: no se vuelve a pedir el consentimiento. */
  consentida: boolean;
}) {
  // id en edición, "nueva" para el alta, null si no se edita nada
  const [editando, setEditando] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(vacio);
  const [consiento, setConsiento] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [aBorrar, setABorrar] = useState<string | null>(null);

  const hoy = toISO(todayNormalized());
  const actuales = lesiones.filter((l) => activaEn(l, hoy) || l.desde > hoy);
  const pasadas = lesiones.filter((l) => !actuales.includes(l));

  function abrir(id: string, l?: Lesion) {
    setEditando(id);
    setDraft(l ? aDraft(l) : vacio());
    setErrors({});
    setABorrar(null);
  }

  /** Cambia el borrador; si el alta no la tocó a mano, la vuelve a sugerir. */
  function set(patch: Partial<Draft>) {
    setDraft((prev) => {
      const d = { ...prev, ...patch };
      if (!d.hastaManual && d.tipo && d.gravedad && d.desde) {
        d.hasta = altaSugerida(d.tipo, d.gravedad, d.desde) ?? "";
      }
      return d;
    });
  }

  async function guardar() {
    const input = aInput(draft);
    const errs = errorsOf(lesionSchema.safeParse(input));
    if (!consentida && !consiento) errs.consiento = "Necesitamos tu consentimiento para guardarla.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPending(true);
    const result = await guardarLesion({
      id: editando === "nueva" ? null : editando,
      lesion: input as LesionInput,
      consiento,
    });
    setPending(false);
    if (!result.ok) {
      toast.error(result.message ?? "No se pudo guardar la lesión.");
      return;
    }
    toast.success(
      editando === "nueva" ? "Lesión guardada: tu plan ya la tiene en cuenta." : "Lesión guardada.",
    );
    setEditando(null);
  }

  async function accion(fn: () => Promise<{ ok: boolean; message?: string }>, ok: string) {
    setPending(true);
    const result = await fn();
    setPending(false);
    setABorrar(null);
    if (result.ok) toast.success(ok);
    else toast.error(result.message ?? "No se pudo actualizar.");
  }

  const semanas =
    draft.tipo && draft.gravedad ? duracionSugerida(draft.tipo, draft.gravedad) : null;
  const conLado = draft.zona !== "" && !ZONAS_SIN_LADO.includes(draft.zona);

  const formulario = (id: string) => (
    <div className="grid gap-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
      <div className="grid gap-3 sm:grid-cols-6">
        <Field id={`tipo-${id}`} label="Tipo" error={errors.tipo} className="sm:col-span-2">
          <Opciones
            id={`tipo-${id}`}
            items={TIPOS}
            value={draft.tipo}
            placeholder="Elegí"
            onChange={(v) => set({ tipo: v as TipoLesion })}
            {...invalid(errors, "tipo", `tipo-${id}`)}
          />
        </Field>
        <Field id={`zona-${id}`} label="Zona" error={errors.zona} className="sm:col-span-2">
          <Opciones
            id={`zona-${id}`}
            items={ZONAS}
            value={draft.zona}
            placeholder="Elegí"
            onChange={(v) => set({ zona: v as ZonaLesion })}
            {...invalid(errors, "zona", `zona-${id}`)}
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
        error={errors.gravedad}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field id={`desde-${id}`} label="Desde" error={errors.desde}>
          <Input
            id={`desde-${id}`}
            type="date"
            value={draft.desde}
            onChange={(e) => set({ desde: e.target.value })}
            {...invalid(errors, "desde", `desde-${id}`)}
          />
        </Field>
        <Field
          id={`hasta-${id}`}
          label="Alta estimada (opcional)"
          error={errors.hasta}
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
            {...invalid(errors, "hasta", `hasta-${id}`)}
          />
        </Field>
      </div>
      <Field id={`nota-${id}`} label="Nota (opcional)" error={errors.nota}>
        <Textarea
          id={`nota-${id}`}
          rows={2}
          maxLength={280}
          placeholder="Ej: me lo indicó el traumatólogo"
          value={draft.nota}
          onChange={(e) => set({ nota: e.target.value })}
        />
      </Field>
      {!consentida && (
        <div className="grid gap-1.5">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-primary"
              checked={consiento}
              onChange={(e) => setConsiento(e.target.checked)}
              {...invalid(errors, "consiento", "consiento")}
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
          {errors.consiento && (
            <p id="consiento-error" className="text-sm text-destructive">
              {errors.consiento}
            </p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button loading={pending} onClick={guardar}>
          {pending ? "Guardando…" : id === "nueva" ? "Guardar lesión" : "Guardar cambios"}
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => setEditando(null)}>
          Cancelar
        </Button>
      </div>
    </div>
  );

  const fila = (l: Lesion, pasada: boolean) => {
    if (editando === l.id) return <li key={l.id}>{formulario(l.id)}</li>;
    const titulo = describirLesion(l);
    const cuando = pasada
      ? `Del ${fecha(l.desde)} al ${fecha(l.hasta!)}`
      : l.desde > hoy
        ? `Empieza el ${fecha(l.desde)}`
        : l.hasta
          ? `Desde el ${fecha(l.desde)} · alta estimada el ${fecha(l.hasta)}`
          : `Desde el ${fecha(l.desde)} · hasta que marques “Ya estoy bien”`;
    return (
      <li
        key={l.id}
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl p-4 ring-1 ring-foreground/10",
          pasada && "opacity-70",
        )}
      >
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
          <Bandage className="size-5" aria-hidden="true" />
        </div>
        <div className="grid min-w-0 flex-1 gap-0.5">
          <p className="flex flex-wrap items-center gap-2 font-semibold">
            {titulo.charAt(0).toUpperCase() + titulo.slice(1)}
            <Badge variant={l.gravedad === "grave" ? "destructive" : "outline"}>
              {GRAVEDAD_LABEL[l.gravedad]}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">{cuando}</p>
          {l.nota && <p className="text-sm text-muted-foreground italic">{l.nota}</p>}
        </div>
        {aBorrar === l.id ? (
          <div className="flex items-center gap-2" role="group" aria-label="Confirmar borrado">
            <span className="text-sm">¿Borrar?</span>
            <Button
              size="sm"
              className="bg-destructive text-white hover:bg-destructive/90"
              loading={pending}
              onClick={() => accion(() => borrarLesion(l.id), "Lesión borrada.")}
            >
              Sí, borrar
            </Button>
            <Button variant="outline" size="sm" disabled={pending} onClick={() => setABorrar(null)}>
              No
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {!pasada && (
              <>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    accion(() => cerrarLesion(l.id), "¡Qué bueno! Tu plan vuelve a la normalidad.")
                  }
                >
                  Ya estoy bien
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Editar ${titulo}`}
                  onClick={() => abrir(l.id, l)}
                >
                  <Pencil aria-hidden="true" />
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Borrar ${titulo}`}
              onClick={() => setABorrar(l.id)}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        )}
      </li>
    );
  };

  return (
    <Card id="lesiones" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Lesiones</CardTitle>
        <CardDescription>
          Si tenés una lesión, tu plan se ajusta solo según la gravedad: más liviano, con otros
          ejercicios o con reposo. No reemplaza a un médico: ante una fractura, una cirugía o
          cualquier lesión grave, consultá.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {actuales.length > 0 && (
          <ul className="grid gap-3">{actuales.map((l) => fila(l, false))}</ul>
        )}
        {editando === "nueva" ? (
          formulario("nueva")
        ) : (
          <Button variant="outline" className="justify-self-start" onClick={() => abrir("nueva")}>
            <Plus aria-hidden="true" /> Cargar una lesión
          </Button>
        )}
        {pasadas.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Lesiones pasadas ({pasadas.length})
            </summary>
            <ul className="mt-3 grid gap-3">{pasadas.map((l) => fila(l, true))}</ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
