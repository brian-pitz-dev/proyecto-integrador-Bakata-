import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import { SKELETON, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

/**
 * Piezas de los skeletons de carga (loading.tsx de cada sección): imitan la forma y las
 * medidas del contenido real para que, al cargar, todo aparezca en su lugar.
 */

export function Bloque({ className }: { className?: string }) {
  return <div className={cn(SKELETON, className)} />;
}

/**
 * Contenedor de la página: el skeleton queda tenue de fondo y encima, centrado en la pantalla,
 * el spinner de marca con qué se está preparando (solos, los bloques parecían una página vacía).
 */
export function PaginaCargando({
  title,
  detail,
  className,
  children,
}: {
  title: string;
  detail: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <>
      <div
        className={cn("mx-auto grid w-full opacity-40", className)}
        aria-busy="true"
        aria-label={title}
      >
        {children}
      </div>
      <LoadingScreen
        className="pointer-events-none fixed inset-0 z-10 min-h-0"
        title={title}
        detail={detail}
      />
    </>
  );
}

/** Título grande + bajada, como PageHeader. */
export function EncabezadoCargando({ ancho = "w-56" }: { ancho?: string }) {
  return (
    <div className="grid gap-3">
      <Bloque className={cn("h-12 rounded-2xl", ancho)} />
      <Bloque className="h-4 w-full max-w-96" />
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
        <Bloque className="h-3.5 w-full max-w-72" />
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
