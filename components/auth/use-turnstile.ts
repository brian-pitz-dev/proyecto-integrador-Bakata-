"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action: string;
          theme?: "light" | "dark" | "auto";
          callback: (token: string) => void;
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * Widget de Cloudflare Turnstile compartido por login y registro. Devuelve el ref del
 * contenedor (para <AuthTurnstile>), el token actual y `reset()` — los tokens son de un
 * solo uso, así que hay que pedir uno nuevo después de cada intento fallido.
 */
export function useTurnstile(action: string) {
  const [token, setToken] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Poll instead of relying solely on <Script onLoad> — the callback's
  // firing relative to containerRef being attached isn't guaranteed across
  // Next.js's afterInteractive loading strategy and React's mount order.
  useEffect(() => {
    const sitekey = TURNSTILE_SITE_KEY;
    if (!sitekey) return;
    const interval = setInterval(() => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          action,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          callback: setToken,
        });
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [action]);

  function reset() {
    setToken("");
    if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
  }

  return { token, containerRef, reset };
}
