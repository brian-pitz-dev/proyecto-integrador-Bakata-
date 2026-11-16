"use client";

import { cn } from "@/lib/utils";
import { ZONAS } from "@/lib/validation/coach";

type Zona = (typeof ZONAS)[number];

/** Zonas del cuerpo a priorizar (varias a la vez): chips que se prenden y apagan. */
export function ZonasChips({
  valor,
  onChange,
  legend = "Zonas que querés priorizar",
}: {
  valor: readonly string[];
  onChange: (zonas: Zona[]) => void;
  legend?: string;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {ZONAS.map((z) => {
          const on = valor.includes(z);
          return (
            <button
              key={z}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(ZONAS.filter((x) => (x === z ? !on : valor.includes(x))))}
              className={cn(
                "rounded-full border px-3 py-1 text-sm capitalize transition-colors",
                on
                  ? "border-primary bg-primary/15 font-semibold"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {z}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
