"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bandage, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { errorsOf, type Errors } from "@/components/perfil/campos";
import {
  CamposLesion,
  ConsentimientoSalud,
  conCambio,
  lesionADraft,
  lesionAInput,
  lesionVacia,
  type LesionDraft,
} from "@/components/forms/campos-lesion";
import { borrarLesion, cerrarLesion, guardarLesion } from "@/app/(app)/progreso/lesiones-actions";
import { activaEn, describirLesion, GRAVEDAD_LABEL, type Lesion } from "@/lib/lesiones";
import { lesionSchema, type LesionInput } from "@/lib/validation/lesion";
import { formatShort, fromISO, toISO, todayNormalized } from "@/lib/date";
import { cn } from "@/lib/utils";

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
  const [draft, setDraft] = useState<LesionDraft>(lesionVacia);
  const [consiento, setConsiento] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [aBorrar, setABorrar] = useState<string | null>(null);

  const hoy = toISO(todayNormalized());
  const actuales = lesiones.filter((l) => activaEn(l, hoy) || l.desde > hoy);
  const pasadas = lesiones.filter((l) => !actuales.includes(l));

  function abrir(id: string, l?: Lesion) {
    setEditando(id);
    setDraft(l ? lesionADraft(l) : lesionVacia());
    setErrors({});
    setABorrar(null);
  }

  /** Cambia el borrador; si el alta no la tocó a mano, la vuelve a sugerir. */
  function set(patch: Partial<LesionDraft>) {
    setDraft((prev) => conCambio(prev, patch));
  }

  async function guardar() {
    const input = lesionAInput(draft);
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

  const formulario = (id: string) => (
    <div className="grid gap-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
      <CamposLesion draft={draft} set={set} errors={errors} id={id} />
      {!consentida && (
        <ConsentimientoSalud checked={consiento} onChange={setConsiento} error={errors.consiento} />
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
      ? `Del ${fecha(l.desde)} · alta el ${fecha(l.hasta!)}`
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
                {l.desde <= hoy && (
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      accion(
                        () => cerrarLesion(l.id),
                        "¡Qué bueno! Tu plan vuelve a la normalidad.",
                      )
                    }
                  >
                    Ya estoy bien
                  </Button>
                )}
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
