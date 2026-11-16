import { expect, test } from "@playwright/test";

/** Lunes de esta semana en Buenos Aires (ISO): así la lesión cubre todos los días de la semana. */
function lunesDeEstaSemana(): string {
  const hoy = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
  const d = new Date(`${hoy}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

test("cargar una lesión grave pone el plan en reposo; ya estoy bien y borrarla lo devuelve", async ({
  page,
}) => {
  await page.goto("/progreso");
  const tarjeta = page.locator("#lesiones");
  await tarjeta.getByRole("button", { name: "Cargar una lesión" }).click();

  await tarjeta.getByLabel("Tipo").click();
  await page.getByRole("option", { name: "Fractura" }).click();
  await tarjeta.getByLabel("Zona").click();
  await page.getByRole("option", { name: "Tobillo/pie" }).click();
  await tarjeta.getByRole("radio", { name: /Grave/ }).click();
  await tarjeta.getByLabel("Desde").fill(lunesDeEstaSemana());
  // el consentimiento se pide solo la primera vez
  const consentimiento = tarjeta.getByRole("checkbox");
  if (await consentimiento.isVisible()) await consentimiento.check();
  await tarjeta.getByRole("button", { name: "Guardar lesión" }).click();

  const fila = tarjeta.getByRole("listitem").filter({ hasText: "fractura de tobillo/pie" });
  await expect(fila).toBeVisible();

  // dentro de main: mientras termina de llegar la página, Next deja un instante una copia oculta
  const main = page.getByRole("main");
  await page.goto("/calendario");
  await expect(
    main.getByText("Tu plan está ajustado por tu fractura de tobillo/pie"),
  ).toBeVisible();
  await expect(main.getByText("Reposo", { exact: true }).first()).toBeVisible();

  await page.goto("/progreso");
  await tarjeta
    .getByRole("listitem")
    .filter({ hasText: "fractura de tobillo/pie" })
    .getByRole("button", { name: "Ya estoy bien" })
    .click();
  // pasa al historial
  await tarjeta.getByText(/Lesiones pasadas/).click();
  const pasada = tarjeta.getByRole("listitem").filter({ hasText: "fractura de tobillo/pie" });
  await expect(pasada).toBeVisible();
  await pasada.getByRole("button", { name: /^Borrar/ }).click();
  await pasada.getByRole("button", { name: "Sí, borrar" }).click();
  await expect(pasada).toBeHidden();

  await page.goto("/calendario");
  await expect(main.getByText("Tu plan está ajustado por tu")).toBeHidden();
});
