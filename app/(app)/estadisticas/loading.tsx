import { HIGHLIGHT, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  Bloque,
  EncabezadoCargando,
  PaginaCargando,
  TarjetaCargando,
} from "@/components/skeletons/piezas";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5">
      <Bloque className={cn("h-7 rounded-xl", titulo)} />
      {children}
    </section>
  );
}

/**
 * Skeleton de Estadísticas: misma estructura que la página real (avisos, resumen, progreso,
 * evolución, fotos y registros).
 */
export default function Loading() {
  return (
    <PaginaCargando label="Cargando estadísticas" className="max-w-5xl gap-12">
      <EncabezadoCargando ancho="w-64" />

      <Bloque className="h-9 w-96 max-w-full" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn("grid gap-3 p-6", i === 0 ? cn(HIGHLIGHT, "rounded-[20px]") : SURFACE)}
          >
            <Bloque className="size-9 rounded-xl" />
            <Bloque className="h-8 w-20 rounded-xl" />
            <Bloque className="h-3.5 w-32 max-w-full" />
          </div>
        ))}
      </div>

      <TarjetaCargando lineas={2} />

      <Seccion titulo="w-32">
        <div className="grid gap-5 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <TarjetaCargando key={i}>
              <Bloque className="h-40 rounded-2xl" />
            </TarjetaCargando>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="w-48">
        <TarjetaCargando>
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bloque key={i} className="aspect-[3/4] w-28 rounded-2xl" />
            ))}
          </div>
        </TarjetaCargando>
      </Seccion>

      <Seccion titulo="w-32">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(SURFACE, "grid gap-4 p-6")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bloque className="size-8 rounded-xl" />
                  <Bloque className="h-5 w-20" />
                </div>
                <Bloque className="h-7 w-20" />
              </div>
              <Bloque className="h-3.5" />
              <Bloque className="h-3.5 w-3/4" />
            </div>
          ))}
        </div>
      </Seccion>
    </PaginaCargando>
  );
}
