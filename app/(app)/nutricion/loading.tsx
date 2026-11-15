import { HIGHLIGHT, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  Bloque,
  EncabezadoCargando,
  PaginaCargando,
  SemanasCargando,
  TarjetaCargando,
} from "@/components/skeletons/piezas";

/**
 * Skeleton de Nutrición: misma estructura que la página real (comidas con IA, semanas, días,
 * "Tu día" con los macros, comidas y reglas).
 */
export default function Loading() {
  return (
    <PaginaCargando label="Cargando nutrición" className="max-w-4xl gap-10">
      <EncabezadoCargando ancho="w-52" />

      {/* Armá tus comidas con IA */}
      <TarjetaCargando>
        <Bloque className="h-20 rounded-lg" />
        <div className="flex gap-2">
          <Bloque className="h-9 w-32 rounded-lg" />
          <Bloque className="h-9 w-36 rounded-lg" />
        </div>
      </TarjetaCargando>

      <SemanasCargando />

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "grid place-items-center gap-1.5 rounded-2xl border border-border py-2.5",
              i >= 5 && "border-dashed opacity-70",
            )}
          >
            <Bloque className="h-2.5 w-7" />
            <Bloque className="h-5 w-6 rounded-md" />
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {/* Tu día: proteína · hidratos · grasas · calorías */}
        <div className={cn(HIGHLIGHT, "mb-2 grid gap-3 rounded-[20px] p-6")}>
          <Bloque className="h-3.5 w-16" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid gap-2">
                <Bloque className="h-3.5 w-16" />
                <Bloque className="h-8 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(SURFACE, "flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:gap-5")}
          >
            <Bloque className="h-6 w-24 shrink-0 sm:w-32" />
            <div className="grid flex-1 gap-2.5">
              <Bloque className="h-4 w-56 max-w-full" />
              <Bloque className="h-3.5 w-72 max-w-full" />
            </div>
            <div className="grid shrink-0 grid-cols-3 gap-4 sm:w-56">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="grid justify-items-center gap-1.5">
                  <Bloque className="h-5 w-10 rounded-md" />
                  <Bloque className="h-2.5 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <TarjetaCargando lineas={4} />
    </PaginaCargando>
  );
}
