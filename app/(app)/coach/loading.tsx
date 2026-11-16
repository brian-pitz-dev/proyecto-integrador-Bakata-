import { SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";
import {
  Bloque,
  EncabezadoCargando,
  PaginaCargando,
  TarjetaCargando,
} from "@/components/skeletons/piezas";

/** Skeleton del Coach: misma estructura que la página real (tu semana, chat y tus rutinas). */
export default function Loading() {
  return (
    <PaginaCargando label="Cargando coach" className="max-w-4xl gap-10">
      <EncabezadoCargando ancho="w-40" />

      <TarjetaCargando lineas={4} />

      {/* Chat */}
      <div className={cn(SURFACE, "grid gap-4 p-6")}>
        <div className="grid gap-3">
          <Bloque className="h-12 w-3/4 rounded-2xl" />
          <Bloque className="ml-auto h-10 w-1/2 rounded-2xl" />
        </div>
        <div className="flex gap-2">
          <Bloque className="h-9 flex-1 rounded-lg" />
          <Bloque className="size-9 rounded-lg" />
        </div>
      </div>

      {/* Tus rutinas de gym */}
      <TarjetaCargando>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bloque key={i} className="h-8 w-24" />
          ))}
        </div>
        <Bloque className="h-20 rounded-lg" />
        <Bloque className="h-9 w-40 rounded-lg" />
      </TarjetaCargando>
    </PaginaCargando>
  );
}
