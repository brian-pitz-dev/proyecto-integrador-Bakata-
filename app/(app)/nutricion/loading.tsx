import { HIGHLIGHT, SKELETON, SURFACE } from "@/lib/styles";
import { cn } from "@/lib/utils";

/** Skeleton de Nutrición: misma estructura que la página real (semanas, días, proteína, comidas, reglas). */
export default function Loading() {
  return (
    <div
      className="mx-auto grid w-full max-w-4xl gap-10"
      aria-busy="true"
      aria-label="Cargando nutrición"
    >
      <div className="grid gap-3">
        <div className={cn(SKELETON, "h-12 w-52 rounded-2xl")} />
        <div className={cn(SKELETON, "h-4 w-96 max-w-full")} />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className={cn(SKELETON, "h-10 w-36")} />
        <div className={cn(SKELETON, "h-10 w-16")} />
        <div className={cn(SKELETON, "h-10 w-16")} />
        <div className={cn(SKELETON, "h-10 w-16")} />
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "grid place-items-center gap-1.5 rounded-2xl border border-border py-2.5",
              i >= 5 && "border-dashed opacity-70",
            )}
          >
            <div className={cn(SKELETON, "h-2.5 w-7")} />
            <div className={cn(SKELETON, "h-5 w-6 rounded-md")} />
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        <div className={cn(HIGHLIGHT, "mb-2 grid gap-3 rounded-[20px] p-6")}>
          <div className={cn(SKELETON, "h-3.5 w-28")} />
          <div className={cn(SKELETON, "h-8 w-24 rounded-xl")} />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(SURFACE, "flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:gap-5")}
          >
            <div className={cn(SKELETON, "h-6 w-24 shrink-0 sm:w-32")} />
            <div className="grid flex-1 gap-2.5">
              <div className={cn(SKELETON, "h-4 w-56 max-w-full")} />
              <div className={cn(SKELETON, "h-3.5 w-72 max-w-full")} />
            </div>
            <div className={cn(SKELETON, "h-6 w-28 shrink-0")} />
          </div>
        ))}
      </div>

      <div className={cn(SURFACE, "grid gap-3 p-6")}>
        <div className={cn(SKELETON, "h-6 w-32 rounded-xl")} />
        <div className={cn(SKELETON, "h-3.5 w-3/4")} />
        <div className={cn(SKELETON, "h-3.5 w-2/3")} />
        <div className={cn(SKELETON, "h-3.5 w-1/2")} />
      </div>
    </div>
  );
}
