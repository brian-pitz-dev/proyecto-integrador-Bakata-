"use client";

import { cn } from "@/lib/utils";

export interface OpcionTarjeta<T extends string> {
  value: T;
  label: string;
  detalle: string;
}

/**
 * Elegir una opción entre tarjetas (título + detalle), como radios: objetivo, nivel de running,
 * nivel de gym. Accesible como radiogroup.
 */
export function OpcionesTarjeta<T extends string>({
  legend,
  opciones,
  valor,
  onChange,
  error,
  className,
}: {
  legend: string;
  opciones: readonly OpcionTarjeta<T>[];
  valor: T | undefined;
  onChange: (v: T) => void;
  error?: string;
  /** Clases extra para cada tarjeta (ej. fondo sobre una tarjeta destacada). */
  className?: string;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
        {opciones.map((o) => {
          const on = valor === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={cn(
                "grid gap-0.5 rounded-xl border p-3 text-left transition-colors",
                on
                  ? "border-primary bg-primary/12 ring-1 ring-primary"
                  : "border-border hover:bg-muted",
                className,
              )}
            >
              <span className="text-sm font-semibold">{o.label}</span>
              <span className="text-xs text-muted-foreground">{o.detalle}</span>
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </fieldset>
  );
}
