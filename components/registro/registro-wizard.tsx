"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTurnstile } from "@/components/turnstile";
import {
  CamposDisponibilidad,
  CamposPerfil,
  emptyEvento,
  emptyPerfil,
  errorsOf,
  toEvento,
  toPerfil,
  type Errors,
  type EventoDraft,
  type PerfilDraft,
} from "@/components/perfil/campos";
import { cuentaSchema, eventosSchema, perfilSchema } from "@/lib/validation/onboarding";
import { preferenciasSchema, type Preferencias } from "@/lib/validation/coach";
import { registrar } from "@/app/signup/actions";
import { completeOnboarding } from "@/app/onboarding/actions";
import { PasoObjetivo } from "@/components/registro/paso-objetivo";
import { PasoTuPlan } from "@/components/registro/paso-tu-plan";
import { PasoCuenta, type Cuenta } from "@/components/registro/paso-cuenta";
import { AvisoConfirmarEmail } from "@/components/registro/aviso-confirmar-email";
import {
  CamposLesion,
  ConsentimientoSalud,
  conCambio,
  lesionAInput,
  lesionVacia,
  type LesionDraft,
} from "@/components/forms/campos-lesion";
import { lesionSchema, type LesionInput } from "@/lib/validation/lesion";

export function RegistroWizard({ mode }: { mode: "signup" | "onboarding" }) {
  const pasos =
    mode === "signup"
      ? ["Cuenta", "Perfil", "Objetivo", "Tu plan"]
      : ["Perfil", "Objetivo", "Tu plan"];
  const offset = mode === "signup" ? 0 : 1; // índice lógico: 0 cuenta, 1 perfil, 2 eventos, 3 tu plan
  const [paso, setPaso] = useState(0);
  const logico = paso + offset;
  const ultimo = paso === pasos.length - 1;

  const [cuenta, setCuenta] = useState<Cuenta>({
    nombre: "",
    email: "",
    password: "",
    passwordConfirm: "",
    aceptaTerminos: false,
  });
  const [perfil, setPerfil] = useState<PerfilDraft>(emptyPerfil);
  const [eventos, setEventos] = useState<EventoDraft[]>([emptyEvento()]);
  const [preferencias, setPreferencias] = useState<Preferencias>({
    noCome: "",
    zonas: [],
    equipo: "",
  });
  // lesión opcional del paso "Tu plan" (specs/011-lesiones, US5)
  const [conLesion, setConLesion] = useState(false);
  const [lesion, setLesion] = useState<LesionDraft>(lesionVacia);
  const [consienteSalud, setConsienteSalud] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  // email al que se mandó el link de confirmación: reemplaza el formulario por el aviso
  const [enviadoA, setEnviadoA] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Turnstile solo se monta en el último paso: el token vence a los 5 min y completar todo puede tardar más.
  const turnstile = useTurnstile("signup");
  const conTurnstile = mode === "signup" && turnstile.enabled;

  // Al cambiar de paso, foco al primer campo (teclado y lectores de pantalla).
  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>("input, select, textarea")?.focus();
  }, [paso]);

  function validarPaso(): Errors {
    if (logico === 0) return errorsOf(cuentaSchema.safeParse(cuenta));
    if (logico === 1) return errorsOf(perfilSchema.safeParse(toPerfil(perfil)));
    if (logico === 2) {
      if (!preferencias.objetivo) return { objetivo: "Elegí qué querés lograr" };
      if (preferencias.objetivo !== "evento") return validarMeta();
      if (eventos.length === 0) return { "eventos.": "Agregá tu carrera o caminata" };
      return errorsOf(eventosSchema.safeParse(eventos.map(toEvento)), "eventos.");
    }
    const errs = errorsOf(preferenciasSchema.safeParse(preferencias));
    if (!preferencias.nivelCardio) errs.nivelCardio = "Elegí una opción";
    if (!preferencias.nivelGym) errs.nivelGym = "Elegí una opción";
    if (conLesion) {
      Object.assign(errs, errorsOf(lesionSchema.safeParse(lesionAInput(lesion)), "lesion."));
      if (!consienteSalud) errs.consienteSalud = "Necesitamos tu consentimiento para guardarla.";
    }
    return errs;
  }

  /** Los eventos solo van si el objetivo es una carrera o caminata. */
  function eventosAEnviar(): EventoDraft[] {
    return preferencias.objetivo === "evento" ? eventos : [];
  }

  /** Bajar o ganar músculo: el peso al que quiere llegar, coherente con el objetivo. */
  function validarMeta(): Errors {
    const meta = Number(perfil.metaPesoKg);
    const actual = Number(perfil.pesoInicialKg);
    if (!perfil.metaPesoKg.trim() || !(meta >= 30 && meta <= 300))
      return { metaPesoKg: "Contanos a qué peso querés llegar (entre 30 y 300 kg)" };
    if (preferencias.objetivo === "bajar" && meta >= actual)
      return { metaPesoKg: `Para bajar, tiene que ser menos que tu peso actual (${actual} kg)` };
    if (preferencias.objetivo === "musculo" && meta < actual)
      return {
        metaPesoKg: `Para ganar músculo, igual o más que tu peso actual (${actual} kg); si querés bajar, elegí "Bajar de peso"`,
      };
    return {};
  }

  function focusPrimerError() {
    requestAnimationFrame(() =>
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(),
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validarPaso();
    setErrors(errs);
    if (Object.keys(errs).length) {
      if (errs["eventos."]) toast.error(errs["eventos."]);
      if (errs.objetivo) toast.error(errs.objetivo);
      focusPrimerError();
      return;
    }
    if (!ultimo) {
      setPaso(paso + 1);
      return;
    }
    if (conTurnstile && turnstile.verifying) return; // el botón ya está deshabilitado mientras verifica

    setPending(true);
    const perfilData = toPerfil(perfil);
    const eventosData = eventosAEnviar().map(toEvento);
    // ya validada en validarPaso
    const lesiones = conLesion ? [lesionAInput(lesion) as LesionInput] : [];
    const result =
      mode === "signup"
        ? await registrar({
            cuenta,
            perfil: perfilData,
            eventos: eventosData,
            preferencias,
            lesiones,
            consienteSalud,
            turnstileToken: turnstile.token,
          })
        : await completeOnboarding({
            ...perfilData,
            eventos: eventosData,
            preferencias,
            lesiones,
            consienteSalud,
          });

    // Si salió bien, la acción ya redirigió (sin resultado): solo se manejan avisos y errores.
    if (!result) return;
    setPending(false);
    if (result.ok) {
      if ("confirmar" in result && typeof result.confirmar === "string")
        setEnviadoA(result.confirmar);
      return;
    }
    toast.error(result.message ?? "No se pudo completar el registro.");
    if (conTurnstile) turnstile.reset();
    const volverA = "paso" in result && typeof result.paso === "number" ? result.paso - offset : -1;
    if (volverA >= 0 && volverA !== paso) setPaso(volverA);
  }

  if (enviadoA) return <AvisoConfirmarEmail email={enviadoA} />;

  return (
    <Card className="mx-auto w-full max-w-3xl rounded-[25px] shadow-[0_4px_4px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(10,4,20,0.55)]">
      <CardHeader className="gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle className="font-sans text-2xl font-semibold">
            {mode === "signup" ? "Registrarse en Bakata" : "Completá tu perfil"}
          </CardTitle>
          <span className="text-sm text-muted-foreground tabular-nums">
            Paso {paso + 1} de {pasos.length}
          </span>
        </div>
        <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${pasos.length}, 1fr)` }}>
          {pasos.map((label, i) => (
            <li key={label} aria-current={i === paso ? "step" : undefined} className="grid gap-1.5">
              <div
                className={cn("h-1.5 rounded-full", i <= paso ? "bg-primary" : "bg-muted")}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-sm",
                  i === paso ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {i < paso && <Check className="size-3.5" aria-hidden="true" />}
                {label}
              </span>
            </li>
          ))}
        </ol>
        <CardDescription>
          {logico === 0 && "Tus datos de acceso."}
          {logico === 1 && "Con esto calculamos tus calorías y armamos tu plan."}
          {logico === 2 && "Qué querés lograr: tu plan se arma alrededor de esto."}
          {logico === 3 &&
            "Con esto la IA arma tus comidas y tus rutinas de gym. Después le podés pedir cambios."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form ref={formRef} noValidate className="grid gap-6" onSubmit={handleSubmit}>
          {logico === 0 && <PasoCuenta cuenta={cuenta} setCuenta={setCuenta} errors={errors} />}

          {logico === 1 && (
            <div className="grid gap-6">
              <CamposPerfil perfil={perfil} setPerfil={setPerfil} errors={errors} sinMeta />
              <section className="grid gap-3 border-t border-border pt-5">
                <h3 className="font-heading text-base font-semibold">Tu semana de entrenamiento</h3>
                <CamposDisponibilidad perfil={perfil} setPerfil={setPerfil} errors={errors} />
              </section>
            </div>
          )}

          {logico === 2 && (
            <PasoObjetivo
              preferencias={preferencias}
              setPreferencias={setPreferencias}
              perfil={perfil}
              setPerfil={setPerfil}
              eventos={eventos}
              setEventos={setEventos}
              errors={errors}
            />
          )}

          {logico === 3 && (
            <PasoTuPlan
              preferencias={preferencias}
              setPreferencias={setPreferencias}
              errors={errors}
              extra={
                <>
                  <section className="grid gap-3 border-t border-border pt-5">
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-4 accent-primary"
                        checked={conLesion}
                        onChange={(e) => setConLesion(e.target.checked)}
                      />
                      <span>
                        <span className="font-semibold">Tengo una lesión ahora</span>{" "}
                        <span className="text-muted-foreground">
                          (opcional): fractura, esguince, desgarro… Tu plan la va a tener en cuenta.
                        </span>
                      </span>
                    </label>
                    {conLesion && (
                      <div className="grid gap-4 rounded-xl border border-primary/40 bg-primary/5 p-4">
                        <CamposLesion
                          draft={lesion}
                          set={(patch) => setLesion((prev) => conCambio(prev, patch))}
                          errors={errors}
                          id="registro"
                          k={(campo) => `lesion.${campo}`}
                        />
                        <ConsentimientoSalud
                          checked={consienteSalud}
                          onChange={setConsienteSalud}
                          error={errors.consienteSalud}
                        />
                      </div>
                    )}
                  </section>
                  {conTurnstile ? turnstile.widget : null}
                </>
              }
            />
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            {paso > 0 ? (
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  setErrors({});
                  setPaso(paso - 1);
                }}
              >
                Atrás
              </Button>
            ) : (
              <span />
            )}
            <Button
              type="submit"
              loading={pending || (ultimo && conTurnstile && turnstile.verifying)}
            >
              {!ultimo
                ? "Siguiente"
                : pending
                  ? "Creando tu plan…"
                  : conTurnstile && turnstile.verifying
                    ? "Verificando…"
                    : mode === "signup"
                      ? "Crear cuenta y armar mi plan"
                      : "Armar mi plan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
