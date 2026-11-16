import { HIGHLIGHT, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  Bloque,
  EncabezadoCargando,
  PaginaCargando,
  SemanasCargando,
} from "@/components/skeletons/piezas";

/** Una sesión: franja a la izquierda + nombre + detalle, como en SessionList. */
function Sesion({ corta = false }: { corta?: boolean }) {
  return (
    <div className="grid gap-2 border-l-[3px] border-primary/15 pl-3">
      <Bloque className="h-4 w-36" />
      {!corta && <Bloque className="h-3.5 w-full max-w-64" />}
    </div>
  );
}

/**
 * Skeleton del Calendario: misma estructura que la página real (título, tus eventos, tarjeta
 * "Hoy", selector de semanas y tarjetas de día).
 */
export default function Loading() {
  return (
    <PaginaCargando
      title="Cargando tu calendario"
      detail="Armando las semanas y sesiones de tu plan."
      className="max-w-4xl gap-14"
    >
      <EncabezadoCargando />

      {/* Tus eventos */}
      <section className="grid gap-4">
        <Bloque className="h-7 w-36 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn(SURFACE, "grid gap-2 p-5")}>
              <div className="flex items-center justify-between">
                <Bloque className="h-3.5 w-20" />
                <Bloque className="h-5 w-16" />
              </div>
              <Bloque className="h-5 w-40 rounded-lg" />
              <Bloque className="h-3.5 w-full max-w-48" />
            </div>
          ))}
        </div>
      </section>

      {/* Hoy */}
      <section className={cn(HIGHLIGHT, "grid gap-6 rounded-[25px] p-6 sm:p-8")}>
        <div className="grid gap-2.5">
          <Bloque className="h-3.5 w-12" />
          <Bloque className="h-8 w-52 rounded-xl" />
        </div>
        <div className="flex items-center gap-5 rounded-2xl bg-white p-5 ring-1 ring-primary/10 sm:p-6 dark:bg-white/10 dark:ring-0">
          <div className="grid flex-1 gap-5">
            <Sesion />
            <Sesion corta />
          </div>
          <Bloque className="size-10 shrink-0" />
        </div>
        <div className="flex gap-2">
          <Bloque className="h-8 w-20" />
          <Bloque className="h-8 w-24" />
          <Bloque className="h-8 w-16" />
        </div>
      </section>

      {/* Semana */}
      <section className="grid gap-7">
        <SemanasCargando />
        <div className="grid gap-2">
          <Bloque className="h-7 w-60 rounded-xl" />
          <Bloque className="h-4 w-44" />
        </div>
        <div className="grid gap-4">
          {[false, true, false, true].map((corta, i) => (
            <div key={i} className={cn(SURFACE, "flex items-center gap-5 p-6")}>
              <div className="h-16 w-12 shrink-0 animate-pulse rounded-2xl bg-muted" />
              <div className="grid flex-1 gap-5">
                <Sesion corta={corta} />
              </div>
              <Bloque className="size-10 shrink-0" />
            </div>
          ))}
        </div>
      </section>
    </PaginaCargando>
  );
}
