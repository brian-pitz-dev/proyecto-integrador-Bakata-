"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Field, invalid, type Errors } from "@/components/perfil/campos";

export interface Cuenta {
  nombre: string;
  email: string;
  password: string;
  passwordConfirm: string;
  aceptaTerminos: boolean;
}

/** Requisitos de la contraseña en una línea, bajo su campo; en rojo los que faltan si se intentó avanzar. */
function Requisitos({
  id,
  items,
  marcar,
}: {
  id: string;
  items: { ok: boolean; label: string }[];
  marcar: boolean;
}) {
  return (
    <ul id={id} className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
      {items.map((r) => (
        <li
          key={r.label}
          className={cn(
            "flex items-center gap-1",
            r.ok ? "text-foreground" : marcar ? "text-destructive" : "text-muted-foreground",
          )}
        >
          <Check
            className={cn("size-3", r.ok ? "text-primary" : "opacity-30")}
            aria-hidden="true"
          />
          {r.label}
          <span className="sr-only">{r.ok ? "(cumplido)" : "(pendiente)"}</span>
        </li>
      ))}
    </ul>
  );
}

/** Paso "Cuenta" del registro: nombre, email, contraseña y términos. */
export function PasoCuenta({
  cuenta,
  setCuenta,
  errors,
}: {
  cuenta: Cuenta;
  setCuenta: (c: Cuenta) => void;
  errors: Errors;
}) {
  const pw = cuenta.password;
  const requisitos = [
    { ok: pw.length >= 8, label: "8+ caracteres" },
    { ok: /[A-Za-z]/.test(pw), label: "una letra" },
    { ok: /\d/.test(pw), label: "un número" },
    { ok: pw.length > 0 && pw === cuenta.passwordConfirm, label: "Coinciden" },
  ];

  return (
    <div className="grid gap-4">
      <Field id="nombre" label="Nombre" error={errors.nombre}>
        <Input
          id="nombre"
          autoComplete="given-name"
          value={cuenta.nombre}
          onChange={(e) => setCuenta({ ...cuenta, nombre: e.target.value })}
          {...invalid(errors, "nombre", "nombre")}
        />
      </Field>
      <Field id="email" label="Email" error={errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          value={cuenta.email}
          onChange={(e) => setCuenta({ ...cuenta, email: e.target.value })}
          {...invalid(errors, "email", "email")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Los requisitos reemplazan al mensaje de error: muestran qué falta y se tildan al escribir */}
        <Field id="password" label="Contraseña">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={cuenta.password}
            onChange={(e) => setCuenta({ ...cuenta, password: e.target.value })}
            {...invalid(errors, "password", "password")}
          />
          <Requisitos
            id="password-error"
            items={requisitos.slice(0, 3)}
            marcar={!!errors.password}
          />
        </Field>
        <Field id="passwordConfirm" label="Repetir contraseña">
          <Input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            value={cuenta.passwordConfirm}
            onChange={(e) => setCuenta({ ...cuenta, passwordConfirm: e.target.value })}
            {...invalid(errors, "passwordConfirm", "passwordConfirm")}
          />
          <Requisitos
            id="passwordConfirm-error"
            items={requisitos.slice(3)}
            marcar={!!errors.passwordConfirm}
          />
        </Field>
      </div>
      <div className="grid gap-1.5">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-primary"
            checked={cuenta.aceptaTerminos}
            onChange={(e) => setCuenta({ ...cuenta, aceptaTerminos: e.target.checked })}
            {...invalid(errors, "aceptaTerminos", "aceptaTerminos")}
          />
          <span>
            Acepto los{" "}
            <Link
              href="/privacidad"
              target="_blank"
              className="font-semibold underline underline-offset-2"
            >
              términos y la política de privacidad
            </Link>
            .
          </span>
        </label>
        {errors.aceptaTerminos && (
          <p id="aceptaTerminos-error" className="text-sm text-destructive">
            {errors.aceptaTerminos}
          </p>
        )}
      </div>
    </div>
  );
}
