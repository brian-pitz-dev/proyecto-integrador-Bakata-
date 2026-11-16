import Link from "next/link";
import { BrandIcon } from "@/components/brand-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { NavTabs, BottomTabs } from "@/components/nav/nav-tabs";
import { LogoutButton } from "@/components/nav/logout-button";
import { PerfilButton } from "@/components/nav/perfil-button";
import { Tutorial } from "@/components/tutorial";
import { getAuthedUser } from "@/lib/supabase/auth";
import { leerEstadoPlanIa } from "@/lib/preferencias";
import { PlanInicial } from "@/components/plan-inicial";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthedUser();
  const estadoIa = user ? await leerEstadoPlanIa() : null;
  const armandoPlan = !!estadoIa?.planPendiente;

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md lg:px-8">
        <Link
          href="/calendario"
          aria-label="Bakata, ir al calendario"
          className="col-start-1 flex items-center gap-2.5 justify-self-start rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <BrandIcon className="size-9 drop-shadow-sm" />
          <span className="font-heading text-xl font-semibold text-foreground">Bakata</span>
        </Link>
        <div className="col-start-2 min-w-0 justify-self-center">
          <NavTabs />
        </div>
        <div className="col-start-3 flex items-center justify-self-end gap-2">
          <PerfilButton />
          <Tutorial
            abrirAlEntrar={!!user && !user.tutorialVisto && !armandoPlan}
            nombre={user?.nombre ?? null}
          />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-10 pb-32 lg:px-8 lg:pt-14 lg:pb-20">
        {children}
      </main>

      <BottomTabs />

      {armandoPlan && estadoIa && (
        <PlanInicial equipo={estadoIa.preferencias.equipo} zonas={estadoIa.preferencias.zonas} />
      )}
    </div>
  );
}
