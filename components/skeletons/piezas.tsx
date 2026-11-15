import type { ReactNode } from "react";
import { SKELETON, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

/**
 * Piezas de los skeletons de carga (loading.tsx de cada sección): imitan la forma y las
 * medidas del contenido real para que, al cargar, todo aparezca en su lugar.
 */

export function Bloque({ className }: { className?: string }) {
  return <div className={cn(SKELETON, className)} />;
}

/** Contenedor de la página con el aviso de carga para lectores de pantalla. */
export function PaginaCargando({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto grid w-full", className)} aria-busy="true" aria-label={label}>
      {children}
    </div>
  );
}

/** Título grande + bajada, como PageHeader. */
export function EncabezadoCargando({ ancho = "w-56" }: { ancho?: string }) {
  return (
    <div className="grid gap-3">
      <Bloque className={cn("h-12 rounded-2xl", ancho)} />
      <Bloque className="h-4 w-96 max-w-full" />
    </div>
  );
}

/** Tarjeta con título, bajada y algunas líneas de contenido. */
export function TarjetaCargando({
  lineas = 3,
  className,
  children,
}: {
  lineas?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn(SURFACE, "grid gap-4 p-6", className)}>
      <div className="grid gap-2">
        <Bloque className="h-6 w-48 rounded-xl" />
        <Bloque className="h-3.5 w-72 max-w-full" />
      </div>
      {children ??
        Array.from({ length: lineas }).map((_, i) => (
          <Bloque key={i} className={cn("h-3.5", i % 2 ? "w-2/3" : "w-full")} />
        ))}
    </div>
  );
}

/** Fila de selector de semanas: mes + pastillas. */
export function SemanasCargando() {
  return (
    <div className="flex flex-wrap gap-2">
      <Bloque className="h-10 w-36" />
      <Bloque className="h-10 w-16" />
      <Bloque className="h-10 w-16" />
      <Bloque className="h-10 w-16" />
      <Bloque className="h-10 w-16" />
    </div>
  );
}
