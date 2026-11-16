"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Check, TrendingUp } from "lucide-react";
import { saveCarga } from "@/app/registro/carga-actions";
import { formatShort, fromISO, toISO, todayNormalized } from "@/lib/date";
import { calcularProgresion, type Progresion } from "@/lib/progresion";
import type { Carga } from "@/lib/validation/carga";
import { cn } from "@/lib/utils";
import type { NivelGym } from "@/lib/gym-exercises";

interface CargasValue {
  cargas: Carga[];
  /** Nivel de gym de la persona: ajusta las series de las rutinas base. */
  nivelGym?: NivelGym;
  save: (ejercicio: string, fecha: string, kg: number | null) => Promise<boolean>;
}

const CargasContext = createContext<CargasValue | null>(null);

/** Guarda en memoria las cargas del usuario y las actualiza al instante al anotar una nueva. */
export function CargasProvider({
  initial,
  nivelGym,
  children,
}: {
  initial: Carga[];
  nivelGym?: NivelGym;
  children: ReactNode;
}) {
  const [cargas, setCargas] = useState(initial);

  async function save(ejercicio: string, fecha: string, kg: number | null) {
    const result = await saveCarga({ ejercicio, fecha, kg });
    if (!result.ok) {
      toast.error(result.message ?? "No se pudo guardar la carga.");
      return false;
    }
    setCargas((prev) => [
      ...prev.filter((c) => !(c.ejercicio === ejercicio && c.fecha === fecha)),
      ...(kg === null ? [] : [{ ejercicio, fecha, kg }]),
    ]);
    return true;
  }

  return (
    <CargasContext.Provider value={{ cargas, save, nivelGym }}>{children}</CargasContext.Provider>
  );
}

export function useNivelGym(): NivelGym | undefined {
  return useContext(CargasContext)?.nivelGym;
}

interface EjercicioEnSesion {
  ejercicio: string;
  fecha: string;
  sets: string;
  trenInferior: boolean;
}

function useProgresion({ ejercicio, fecha, sets, trenInferior }: EjercicioEnSesion): {
  progresion: Progresion;
  actualKg?: number;
} {
  const ctx = useContext(CargasContext);
  const delEjercicio = (ctx?.cargas ?? []).filter((c) => c.ejercicio === ejercicio);
  const actualKg = delEjercicio.find((c) => c.fecha === fecha)?.kg;
  const progresion = calcularProgresion({
    historial: delEjercicio.filter((c) => c.fecha < fecha),
    actualKg,
    sets,
    trenInferior,
  });
  return { progresion, actualKg };
}

function formatKg(kg: number): string {
  return kg.toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

/** Series del ejercicio, ajustadas a la semana de subir o de consolidar. */
export function SetsLabel(props: EjercicioEnSesion & { className?: string }) {
  const { progresion } = useProgresion(props);
  return <span className={props.className}>{progresion.sets}</span>;
}

/**
 * Peso del ejercicio en la sesión: muestra la carga anterior, precarga la sugerida (se
 * confirma con un toque o se cambia por la que realmente se usó) y explica qué toca.
 */
export function CargaInput({
  inverse = false,
  ...props
}: EjercicioEnSesion & { inverse?: boolean }) {
  const ctx = useContext(CargasContext);
  const { progresion, actualKg } = useProgresion(props);
  const [draft, setDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!ctx) return null;

  const { ejercicio, fecha } = props;
  const { anterior, fase, sugeridoKg, porcentaje } = progresion;
  const futuro = fecha > toISO(todayNormalized());
  const muted = inverse ? "text-muted-foreground dark:text-white/70" : "text-muted-foreground";
  const sinAnotar = actualKg === undefined;
  const value =
    draft ??
    (actualKg !== undefined
      ? String(actualKg)
      : sugeridoKg !== undefined
        ? String(sugeridoKg)
        : "");

  function guardar(kg: number | null) {
    if (kg !== null && (!Number.isFinite(kg) || kg < 0 || kg > 1000)) {
      toast.error("Poné un peso válido en kg.");
      return;
    }
    startTransition(async () => {
      if (await ctx!.save(ejercicio, fecha, kg)) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  }

  function commit() {
    if (draft === null) return;
    const text = draft.trim().replace(",", ".");
    setDraft(null);
    const kg = text === "" ? null : Number(text);
    if (kg === (actualKg ?? null)) return;
    guardar(kg);
  }

  const anteriorTxt = anterior
    ? `${formatKg(anterior.kg)} kg el ${formatShort(fromISO(anterior.fecha))}`
    : null;

  let mensaje: ReactNode = null;
  const diaTxt = formatShort(fromISO(fecha));
  if (!anterior) {
    mensaje = futuro
      ? `Peso: lo anotás el ${diaTxt}, cuando hagas la rutina. Desde la próxima vez te sugerimos cuánto subir.`
      : "Anotá el peso que usaste: la próxima vez te sugerimos cuánto subir.";
  } else if (fase === "subir") {
    mensaje =
      !sinAnotar && actualKg! > anterior.kg ? (
        <span className="inline-flex items-center gap-1 font-medium text-accent">
          <TrendingUp className="size-3.5" aria-hidden="true" />+{formatKg(actualKg! - anterior.kg)}{" "}
          kg vs. el {formatShort(fromISO(anterior.fecha))} · esta vez con menos reps
        </span>
      ) : (
        `Toca subir: ${anteriorTxt} → ${formatKg(sugeridoKg!)} kg (+${porcentaje}%). Esta vez hacé menos reps.`
      );
  } else if (fase === "consolidar") {
    mensaje = `Mantené ${formatKg(sugeridoKg!)} kg (${anteriorTxt}) y volvé a las reps de siempre.`;
  }

  return (
    <div className="grid gap-1 text-xs">
      {!futuro && (
        <div className="flex items-center gap-1.5">
          <label className="inline-flex items-center gap-1.5">
            <span className="sr-only">Peso usado en {ejercicio}</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="—"
              value={value}
              disabled={pending}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              className={cn(
                "w-16 rounded-lg border px-2 py-1 text-right text-sm tabular-nums outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                inverse
                  ? "border-primary/25 bg-white dark:border-white/25 dark:bg-white/10"
                  : "border-border bg-background",
                // sugerido sin confirmar: se ve más tenue hasta que se guarda
                sinAnotar && draft === null && sugeridoKg !== undefined && "italic opacity-70",
              )}
            />
            <span className={muted}>kg</span>
          </label>
          {sinAnotar && draft === null && sugeridoKg !== undefined && (
            <button
              type="button"
              disabled={pending}
              onClick={() => guardar(sugeridoKg)}
              className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 dark:bg-primary/20 dark:text-[#d6b8f2]"
            >
              <Check className="size-3.5" aria-hidden="true" />
              Lo hice con este peso
            </button>
          )}
          {saved && <Check className="size-3.5 text-accent" aria-label="Guardado" />}
        </div>
      )}
      {futuro && sugeridoKg !== undefined && (
        <span className={cn("font-medium", muted)}>
          Peso sugerido: {formatKg(sugeridoKg)} kg (lo confirmás el {diaTxt})
        </span>
      )}
      {mensaje && <span className={muted}>{mensaje}</span>}
    </div>
  );
}
