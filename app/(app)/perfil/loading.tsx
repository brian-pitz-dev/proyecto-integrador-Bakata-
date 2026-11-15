import {
  Bloque,
  EncabezadoCargando,
  PaginaCargando,
  TarjetaCargando,
} from "@/components/skeletons/piezas";

/** Un campo de formulario: etiqueta + input. */
function Campo() {
  return (
    <div className="grid gap-2">
      <Bloque className="h-3.5 w-24" />
      <Bloque className="h-9 rounded-lg" />
    </div>
  );
}

/** Skeleton de Mi perfil: misma estructura que la página real (semana, datos, eventos, cuenta). */
export default function Loading() {
  return (
    <PaginaCargando label="Cargando perfil" className="max-w-4xl gap-10">
      <EncabezadoCargando ancho="w-48" />

      <TarjetaCargando>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bloque key={i} className="h-10 rounded-lg" />
          ))}
        </div>
        <Bloque className="h-9 w-48 rounded-lg" />
      </TarjetaCargando>

      <TarjetaCargando>
        <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Campo key={i} />
          ))}
        </div>
      </TarjetaCargando>

      <TarjetaCargando>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bloque className="size-10 rounded-lg" />
            <div className="grid flex-1 gap-2">
              <Bloque className="h-4 w-40" />
              <Bloque className="h-3.5 w-56 max-w-full" />
            </div>
          </div>
        ))}
      </TarjetaCargando>

      <TarjetaCargando lineas={2} />
    </PaginaCargando>
  );
}
