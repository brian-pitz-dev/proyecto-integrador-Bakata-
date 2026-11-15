import { HIGHLIGHT, SKELETON, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

/** Skeleton de Estadísticas: misma estructura que la página real (resumen, progreso, registros). */
export default function Loading() {
  return (
    <div
      className="mx-auto grid w-full max-w-5xl gap-12"
      aria-busy="true"
      aria-label="Cargando estadísticas"
    >
      <div className="grid gap-3">
        <div className={cn(SKELETON, "h-12 w-64 rounded-2xl")} />
        <div className={cn(SKELETON, "h-4 w-80 max-w-full")} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn("grid gap-3 p-6", i === 0 ? cn(HIGHLIGHT, "rounded-[20px]") : SURFACE)}
          >
            <div className={cn(SKELETON, "size-9 rounded-xl")} />
            <div className={cn(SKELETON, "h-8 w-20 rounded-xl")} />
            <div className={cn(SKELETON, "h-3.5 w-32 max-w-full")} />
          </div>
        ))}
      </div>

      <div className={cn(SURFACE, "grid gap-5 p-6")}>
        <div className={cn(SKELETON, "h-6 w-48 rounded-xl")} />
        <div className={cn(SKELETON, "h-3")} />
        <div className={cn(SKELETON, "h-3.5 w-40")} />
      </div>

      <div className="grid gap-5">
        <div className={cn(SKELETON, "h-7 w-32 rounded-xl")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn(SURFACE, "grid gap-4 p-6")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(SKELETON, "size-8 rounded-xl")} />
                  <div className={cn(SKELETON, "h-5 w-20")} />
                </div>
                <div className={cn(SKELETON, "h-7 w-20")} />
              </div>
              <div className={cn(SKELETON, "h-3.5")} />
              <div className={cn(SKELETON, "h-3.5 w-3/4")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
