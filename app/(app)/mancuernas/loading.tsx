import { HIGHLIGHT, SKELETON, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

function RoutineSkeleton({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <section className={cn("p-6", highlighted ? cn(HIGHLIGHT, "rounded-[20px]") : SURFACE)}>
      <div className={cn(SKELETON, "h-7 w-44 rounded-xl")} />
      <div className={cn(SKELETON, "mt-3 h-3.5 w-72 max-w-full")} />
      <div className={cn(SKELETON, "mt-4 h-6 w-64 max-w-full")} />
      <div className="mt-5 grid divide-y divide-border">
        {Array.from({ length: 3 }).map((_, j) => (
          <div key={j} className="grid gap-2.5 py-4 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-2">
              <div className={cn(SKELETON, "h-4 w-32")} />
              <div className={cn(SKELETON, "h-5 w-14")} />
            </div>
            <div className={cn(SKELETON, "h-3 w-40")} />
            <div className={cn(SKELETON, "h-3.5")} />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Skeleton de Mancuernas: misma estructura que la página real (días de la semana + rutina elegida). */
export default function Loading() {
  return (
    <div
      className="mx-auto grid w-full max-w-5xl gap-10"
      aria-busy="true"
      aria-label="Cargando mancuernas"
    >
      <div className="grid gap-3">
        <div className={cn(SKELETON, "h-12 w-60 rounded-2xl")} />
        <div className={cn(SKELETON, "h-4 w-[30rem] max-w-full")} />
      </div>
      <div className="grid gap-5">
        <div className={cn(SKELETON, "h-7 w-56 rounded-xl")} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn(SKELETON, "h-14 w-32 rounded-2xl")} />
          ))}
        </div>
        <RoutineSkeleton />
      </div>
    </div>
  );
}
