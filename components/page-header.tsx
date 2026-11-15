import type { ReactNode } from "react";

/** Título de cada pantalla interna: título en Oswald + bajada corta. */
export function PageHeader({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <header className="grid gap-2">
      <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
      {description && (
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
