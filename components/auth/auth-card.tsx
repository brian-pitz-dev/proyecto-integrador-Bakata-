import type { ComponentProps, ReactNode, RefObject } from "react";
import Link from "next/link";
import Script from "next/script";
import { TURNSTILE_SITE_KEY } from "@/components/auth/use-turnstile";

// Piezas de la tarjeta de login/registro, según el diseño de Figma (Input Field / Button).
// Se usan elementos nativos en vez de components/ui porque estas pantallas tienen su
// propia paleta (clara y oscura), distinta del resto de la app.

export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative w-full max-w-[521px] rounded-[25px] bg-white px-7 pt-12 pb-10 shadow-[0_4px_4px_0_rgba(0,0,0,0.1)] sm:px-11 dark:border dark:border-white/10 dark:bg-[#1b1227] dark:shadow-[0_8px_32px_0_rgba(10,4,20,0.55)]">
      <h1 className="text-center font-sans text-2xl font-semibold text-[#1f1f1f] dark:text-[#f7e8fa]">
        {title}
      </h1>
      {children}
    </div>
  );
}

export function AuthField({
  id,
  label,
  ...inputProps
}: { id: string; label: string } & ComponentProps<"input">) {
  return (
    <div className="grid gap-3">
      <label
        htmlFor={id}
        className="bg-gradient-to-b from-[#2a2a2a] to-[#909090] bg-clip-text text-base leading-[1.4] text-transparent dark:from-[#f1e6fa] dark:to-[#b3a3c7]"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="w-full rounded-[20px] border border-[#d9d9d9] bg-white px-4 py-3 text-base leading-none text-[#1f1f1f] outline-none placeholder:text-[#757575] focus-visible:border-[#8d3fbd] focus-visible:ring-3 focus-visible:ring-[#8d3fbd]/25 dark:border-[#3d2d55] dark:bg-[#24183a] dark:text-[#f7e8fa] dark:placeholder:text-[#9a8bb0]"
        {...inputProps}
      />
    </div>
  );
}

export function AuthTurnstile({
  containerRef,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  if (!TURNSTILE_SITE_KEY) return null;
  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" />
      <div ref={containerRef} />
    </>
  );
}

export function AuthSubmit({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[20px] border border-[#8d3fbd] bg-[#8d3fbd] p-3 text-base leading-none font-semibold text-[#f7e8fa] transition-colors hover:bg-[#7a33a6] focus-visible:ring-3 focus-visible:ring-[#8d3fbd]/40 focus-visible:outline-none disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function AuthFooter({
  question,
  href,
  linkLabel,
}: {
  question: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <p className="mt-10 text-base leading-none text-[#1f1f1f] dark:text-[#ddd0ea]">
      {question}{" "}
      <Link href={href} className="text-[#9f61d5] hover:underline dark:text-[#b98ae6]">
        {linkLabel}
      </Link>
    </p>
  );
}
