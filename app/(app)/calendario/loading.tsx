import { HIGHLIGHT, SKELETON, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

/**
 * Skeleton del Calendario: misma estructura y medidas que la página real (título, tarjeta
 * "Hoy", selector de semanas, tarjetas de día), para que al cargar el contenido aparezca
 * en su lugar en vez de reacomodarse.
 */
export default function Loading() {
  return (
    <div className="grid gap-14" aria-busy="true" aria-label="Cargando calendario">
      <div className="mx-auto grid w-full max-w-4xl gap-3">
        <div className={cn(SKELETON, "h-12 w-56 rounded-2xl")} />
        <div className={cn(SKELETON, "h-4 w-64")} />
      </div>

      <div className="mx-auto grid w-full max-w-4xl gap-14">
        {/* Hoy */}
        <section className={cn(HIGHLIGHT, "grid gap-6 rounded-[25px] p-6 sm:p-8")}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="grid gap-2.5">
              <div className={cn(SKELETON, "h-3.5 w-12")} />
              <div className={cn(SKELETON, "h-8 w-52 rounded-xl")} />
            </div>
            <div className={cn(SKELETON, "h-8 w-40")} />
          </div>
          <div className="flex items-center gap-5 rounded-2xl bg-white p-5 ring-1 ring-primary/10 sm:p-6 dark:bg-white/10 dark:ring-0">
            <div className="grid flex-1 gap-5">
              <SessionLines />
              <SessionLines short />
            </div>
            <div className={cn(SKELETON, "size-10 shrink-0")} />
          </div>
          <div className="flex gap-2">
            <div className={cn(SKELETON, "h-8 w-20")} />
            <div className={cn(SKELETON, "h-8 w-24")} />
            <div className={cn(SKELETON, "h-8 w-16")} />
          </div>
        </section>

        {/* Semana */}
        <section className="grid gap-7">
          <div className="flex flex-wrap gap-2">
            <div className={cn(SKELETON, "h-10 w-36")} />
            <div className={cn(SKELETON, "h-10 w-16")} />
            <div className={cn(SKELETON, "h-10 w-16")} />
            <div className={cn(SKELETON, "h-10 w-16")} />
          </div>
          <div className="grid gap-2">
            <div className={cn(SKELETON, "h-7 w-60 rounded-xl")} />
            <div className={cn(SKELETON, "h-4 w-44")} />
          </div>
          <div className="grid gap-4">
            {[false, true, false, true].map((short, i) => (
              <div key={i} className={cn(SURFACE, "flex items-center gap-5 p-6")}>
                <div className="grid h-16 w-12 shrink-0 animate-pulse rounded-2xl bg-muted" />
                <div className="grid flex-1 gap-5">
                  <SessionLines short={short} />
                </div>
                <div className={cn(SKELETON, "size-10 shrink-0")} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/** Una sesión: franja a la izquierda + nombre + detalle, como en SessionList. */
function SessionLines({ short = false }: { short?: boolean }) {
  return (
    <div className="grid gap-2.5 border-l-[3px] border-primary/20 pl-3 dark:border-white/15">
      <div className={cn(SKELETON, "h-4", short ? "w-28" : "w-20")} />
      <div className={cn(SKELETON, "h-3.5", short ? "w-48" : "w-64 max-w-full")} />
    </div>
  );
}
