import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "@/lib/turnstile";

/** Respuesta de siteverify que devuelve el fetch falso. */
function siteverify(body: object, ok = true) {
  const fetchMock = vi.fn(
    async () => new Response(JSON.stringify(body), { status: ok ? 200 : 500 }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const verificar = (action = "login") => verifyTurnstileToken("token", "1.2.3.4", action);

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("TURNSTILE_SECRET", "secreto-real");
  vi.stubEnv("TURNSTILE_HOSTNAMES", "bakata.netlify.app");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("verifyTurnstileToken", () => {
  it("acepta un token válido, de la acción y el dominio esperados", async () => {
    siteverify({ success: true, action: "login", hostname: "bakata.netlify.app" });
    expect(await verificar()).toBe(true);
  });

  it("rechaza un token de otra acción (ej. el del registro usado en el login)", async () => {
    siteverify({ success: true, action: "signup", hostname: "bakata.netlify.app" });
    expect(await verificar("login")).toBe(false);
  });

  it("rechaza un token resuelto en otro dominio", async () => {
    siteverify({ success: true, action: "login", hostname: "otro-sitio.com" });
    expect(await verificar()).toBe(false);
  });

  it("rechaza si Cloudflare dice que no, o si siteverify falla", async () => {
    siteverify({ success: false, action: "login", hostname: "bakata.netlify.app" });
    expect(await verificar()).toBe(false);
    siteverify({}, false);
    expect(await verificar()).toBe(false);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("sin red"))),
    );
    expect(await verificar()).toBe(false);
  });

  it("rechaza tokens vacíos o enormes sin llamar a Cloudflare", async () => {
    const fetchMock = siteverify({
      success: true,
      action: "login",
      hostname: "bakata.netlify.app",
    });
    expect(await verifyTurnstileToken("", "1.2.3.4", "login")).toBe(false);
    expect(await verifyTurnstileToken("x".repeat(2049), "1.2.3.4", "login")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("con la clave de prueba, en producción igual exige acción y dominio", async () => {
    vi.stubEnv("TURNSTILE_SECRET", "1x0000000000000000000000000000000AA");
    // lo que devuelven siempre las claves de prueba de Cloudflare
    siteverify({ success: true, action: "test", hostname: "example.com" });
    expect(await verificar()).toBe(false);
  });

  it("con la clave de prueba, en desarrollo alcanza con success", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("TURNSTILE_SECRET", "1x0000000000000000000000000000000AA");
    siteverify({ success: true, action: "test", hostname: "example.com" });
    expect(await verificar()).toBe(true);
  });
});
