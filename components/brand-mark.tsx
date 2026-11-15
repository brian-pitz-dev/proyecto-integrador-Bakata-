import { BrandIcon } from "@/components/brand-icon";

/** Marca de Bakata para las páginas públicas (login/signup/onboarding) — el h1 de cada página queda sr-only, esto es lo que se ve. */
export function BrandMark() {
  return (
    <div className="grid justify-center gap-1.5 text-center">
      <BrandIcon className="size-11 justify-self-center" />
      <p className="font-heading text-lg font-semibold">Bakata</p>
    </div>
  );
}
