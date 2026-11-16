import { afterEach, describe, expect, it, vi } from "vitest";

const headersMock = vi.hoisted(() => ({ value: new Headers() }));
vi.mock("next/headers", () => ({ headers: async () => headersMock.value }));

import { getClientKey, loginLimiter } from "@/lib/rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("loginLimiter (5 intentos cada 5 minutos)", () => {
  it("corta en el sexto intento y vuelve a dejar pasar cuando vence la ventana", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T12:00:00Z"));
    const ip = "ventana";
    for (let i = 0; i < 5; i++) {
      expect(loginLimiter.isLimited(ip)).toBe(false);
      loginLimiter.record(ip);
    }
    expect(loginLimiter.isLimited(ip)).toBe(true);

    vi.setSystemTime(new Date("2026-11-16T12:05:00Z")); // justo en el borde: sigue cortado
    expect(loginLimiter.isLimited(ip)).toBe(true);
    vi.setSystemTime(new Date("2026-11-16T12:05:00.001Z"));
    expect(loginLimiter.isLimited(ip)).toBe(false);
  });

  it("cada clave cuenta por separado y clear la libera", () => {
    for (let i = 0; i < 5; i++) loginLimiter.record("a");
    expect(loginLimiter.isLimited("a")).toBe(true);
    expect(loginLimiter.isLimited("b")).toBe(false);
    loginLimiter.clear("a");
    expect(loginLimiter.isLimited("a")).toBe(false);
  });
});

describe("getClientKey", () => {
  it("prefiere la IP que pone Netlify a la de x-forwarded-for, que la puede falsear el cliente", async () => {
    headersMock.value = new Headers({
      "x-nf-client-connection-ip": "200.1.1.1",
      "x-forwarded-for": "6.6.6.6, 200.1.1.1",
    });
    expect(await getClientKey()).toBe("200.1.1.1");
  });

  it("sin el header de Netlify (local) usa el primer valor de x-forwarded-for", async () => {
    headersMock.value = new Headers({ "x-forwarded-for": "10.0.0.1, 10.0.0.2" });
    expect(await getClientKey()).toBe("10.0.0.1");
  });

  it("sin ningún header, todos comparten la clave unknown", async () => {
    headersMock.value = new Headers();
    expect(await getClientKey()).toBe("unknown");
  });
});
