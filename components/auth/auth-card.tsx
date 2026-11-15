import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";

// Piezas de la tarjeta de login/registro, según el diseño de Figma (Input Field / Button).
// Se usan elementos nativos en vez de components/ui porque estas pantallas tienen su
// propia paleta (clara y oscura), distinta del resto de la app.

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full max-w-[521px] rounded-[25px] bg-white px-7 pt-12 pb-10 shadow-[0_4px_4px_0_rgba(0,0,0,0.1)] sm:px-11 dark:border dark:border-white/10 dark:bg-[#1b1227] dark:shadow-[0_8px_32px_0_rgba(10,4,20,0.55)]">
      <h1 className="text-center font-sans text-2xl font-semibold text-[#1f1f1f] dark:text-[#f7e8fa]">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-center text-base text-[#6e5f7c] dark:text-[#b3a3c7]">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

/** Aviso dentro de la tarjeta (error del link, cuenta confirmada, etc.). */
export function AuthNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "mt-6 rounded-[16px] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-[#1f1f1f] dark:text-[#f7e8fa]"
          : "mt-6 rounded-[16px] border border-[#8d3fbd]/30 bg-[#8d3fbd]/10 px-4 py-3 text-sm text-[#1f1f1f] dark:text-[#f7e8fa]"
      }
    >
      {children}
    </p>
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
      aria-busy={pending}
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
    <p className="mt-6 text-base leading-none text-[#1f1f1f] dark:text-[#ddd0ea]">
      {question}{" "}
      <Link href={href} className="text-[#9f61d5] hover:underline dark:text-[#b98ae6]">
        {linkLabel}
      </Link>
    </p>
  );
}

/** Link secundario dentro de la tarjeta (ej. "¿Olvidaste tu contraseña?"). */
export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm text-[#9f61d5] hover:underline dark:text-[#b98ae6]">
      {children}
    </Link>
  );
}
