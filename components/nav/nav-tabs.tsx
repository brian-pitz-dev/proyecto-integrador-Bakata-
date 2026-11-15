"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/nav/nav-items";

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="hidden min-w-0 items-center gap-1 overflow-x-auto rounded-full bg-card p-1 shadow-[0_2px_8px_0_rgba(92,53,116,0.08)] ring-1 ring-foreground/5 lg:flex dark:ring-white/10">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Pestañas fijas abajo en mobile: se alcanzan con el pulgar, con una mano, en el gym. */
export function BottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border/60 bg-background/90 px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+0.375rem)] backdrop-blur-md lg:hidden">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl py-1.5 text-xs font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-14 place-items-center rounded-full transition-colors",
                active && "bg-primary/15",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
