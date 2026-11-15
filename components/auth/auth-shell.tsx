import type { ReactNode } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

// Diseño de Figma "BeFitWithMe-design" (nodo 98:787), compartido por /login y /signup.
// Toda la pantalla es un degradado cónico centrado en el medio; la mitad derecha lleva
// encima una capa blanca al 15%. La versión oscura mantiene la estructura con violetas
// profundos en vez de lila claro.
const CONIC_BG =
  "conic-gradient(from 270deg at 50% 50%, #f7e8fa 0%, #ddbeeb 19.832%, #c294dc 39.663%, #a869cc 59.495%, #8d3fbd 79.327%, #743a98 84.495%, #5c3574 89.663%, #432f4f 94.832%, #2a2a2a 100%)";
const CONIC_BG_DARK =
  "conic-gradient(from 270deg at 50% 50%, #241338 0%, #2e1748 19.832%, #3a1c5c 39.663%, #4c2378 59.495%, #6b2fa3 79.327%, #4f2479 84.495%, #351a54 89.663%, #1f1131 94.832%, #120a1d 100%)";

/** Pantalla de autenticación: mensaje a la izquierda y la tarjeta (children) a la derecha. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`relative grid min-h-dvh [background:var(--auth-bg)] font-sans text-[#1f1f1f] lg:grid-cols-2 dark:[background:var(--auth-bg-dark)]`}
      style={{ "--auth-bg": CONIC_BG, "--auth-bg-dark": CONIC_BG_DARK } as React.CSSProperties}
    >
      <div className="absolute top-4 right-4 z-10 text-[#1f1f1f] dark:text-[#f7e8fa]">
        <ThemeToggle />
      </div>

      <section className="flex flex-col justify-center gap-6 bg-[#f7e8fa] px-8 py-14 sm:px-16 lg:gap-[120px] lg:bg-transparent lg:py-0 lg:pr-10 lg:pb-16 lg:pl-[65px] max-lg:dark:bg-[#241338]">
        <p className="max-w-[313px] font-heading text-5xl leading-none font-semibold [text-shadow:0_4px_4px_rgba(0,0,0,0.3)] lg:text-[72px] dark:text-[#f7e8fa]">
          Alcanza tu <span className="text-[#9f61d5] dark:text-[#b98ae6]">objetivo físico</span>
        </p>
        <p className="max-w-[580px] text-2xl leading-[1.15] text-[#1f1f1f] lg:text-[36px] lg:leading-[40px] lg:text-[#f7e8fa] dark:text-[#f7e8fa]">
          Ya sea por estética o por salud. El cambio está{" "}
          <span className="text-[#8d3fbd] lg:text-[#946fde] dark:text-[#b98ae6]">
            al alcance de tu mano
          </span>
        </p>
      </section>

      <section className="relative grid place-items-center overflow-hidden bg-white/15 px-4 py-12 dark:bg-white/[0.04]">
        <Image
          src="/auth/dumbbell.png"
          alt=""
          width={69}
          height={69}
          className="pointer-events-none absolute top-[15.2%] right-[30px] opacity-35 dark:opacity-25 dark:brightness-[3]"
        />
        <Image
          src="/auth/dumbbell.png"
          alt=""
          width={69}
          height={69}
          className="pointer-events-none absolute bottom-[15.2%] left-[29px] opacity-20 max-lg:hidden dark:opacity-25 dark:brightness-[3]"
        />
        {children}
      </section>
    </div>
  );
}
