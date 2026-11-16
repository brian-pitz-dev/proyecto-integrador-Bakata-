"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AVISO } from "@/lib/styles";
import { chatCoach } from "@/app/(app)/coach/actions";
import { armarRutinas } from "@/app/(app)/coach/rutinas-actions";
import { ZonasChips } from "@/components/forms/zonas-chips";
import { Textarea } from "@/components/ui/textarea";

type Msg = { role: "user" | "model"; text: string };
type Busy = null | "chat" | "rutinas";

export function CoachClient({
  resumen,
  usosHoy,
  limite,
  tieneRutinas,
  rutinasDesactualizadas,
  preferencias,
  mes,
  corre = true,
}: {
  /** Resumen de la semana armado en el server sin IA (lib/stats-summary.ts resumenSemanal). */
  resumen: string[];
  usosHoy: number;
  limite: number;
  tieneRutinas: boolean;
  rutinasDesactualizadas: boolean;
  /** Equipo y zonas que contó en el registro o en el último pedido: precargan el formulario. */
  preferencias: { equipo: string; zonas: string[] };
  /** Objetivo músculo / bajar: en qué semana de su mes de rutinas está. */
  mes?: { semana: number; terminado: boolean; diasRestantes: number } | null;
  /** Entrena para una carrera o caminata: cambia los ejemplos del chat. */
  corre?: boolean;
}) {
  const router = useRouter();
  const [usados, setUsados] = useState(usosHoy);
  const [busy, setBusy] = useState<Busy>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [equipo, setEquipo] = useState(preferencias.equipo);
  const [zonas, setZonas] = useState<string[]>(preferencias.zonas);
  const [pedido, setPedido] = useState("");

  const restantes = Math.max(0, limite - usados);
  const sinCuota = restantes === 0;

  async function run<T extends { ok: boolean; message?: string; cobrado?: boolean }>(
    kind: Exclude<Busy, null>,
    action: () => Promise<T>,
  ): Promise<T | null> {
    setBusy(kind);
    try {
      const result = await action();
      if (!result.ok) toast.error(result.message ?? "Algo salió mal.");
      // la cuota se descuenta antes de la IA: un intento fallido también cuenta
      if (result.cobrado) setUsados((u) => u + 1);
      return result.ok ? result : null;
    } catch {
      toast.error("No se pudo conectar, probá de nuevo.");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    // El historial vive solo en el navegador; se mandan los últimos mensajes como contexto.
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setDraft("");
    const result = await run("chat", () => chatCoach(next.slice(-12)));
    if (result?.reply) setMessages([...next, { role: "model", text: result.reply }]);
    else setMessages(messages); // si falló, se saca el mensaje para poder reintentar
    if (!result) setDraft(text);
  }

  async function handleRutinas() {
    const result = await run("rutinas", () => armarRutinas({ pedido, equipo, zonas }));
    if (!result) return;
    toast.success(
      tieneRutinas
        ? "Listo, cambiamos tus rutinas."
        : "Rutinas listas. Las vas a ver en los días de gym del Calendario.",
    );
    setPedido("");
    router.refresh();
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-10">
      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">Coach</h1>
        <p className="mt-2 max-w-prose text-base leading-relaxed text-muted-foreground">
          Preguntale sobre tu plan o tus entrenamientos. Conoce tu perfil, tu objetivo y la fase en
          la que estás.
        </p>
        <p className="mt-1 text-sm font-medium tabular-nums" aria-live="polite">
          Te quedan {restantes}/{limite} consultas hoy.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tu semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid list-disc gap-1 pl-5 text-sm marker:text-primary">
            {resumen.map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4">
          <div className="grid max-h-[28rem] gap-3 overflow-y-auto" aria-live="polite">
            {messages.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {corre
                  ? "Ej: “¿Qué me toca esta semana y por qué?”, “Dormí mal, ¿hago igual la salida larga?”, “¿Qué como antes de la carrera?”"
                  : "Ej: “¿Qué me toca esta semana y por qué?”, “Dormí mal, ¿entreno igual?”, “¿Cuándo subo el peso en sentadilla?”"}
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "justify-self-end bg-primary text-primary-foreground"
                    : "justify-self-start bg-muted text-foreground",
                )}
              >
                {m.text}
              </div>
            ))}
            {busy === "chat" && <p className="text-sm text-muted-foreground">Pensando…</p>}
          </div>
          <form className="flex gap-2" onSubmit={handleSend}>
            <Label htmlFor="coach-msg" className="sr-only">
              Mensaje para el coach
            </Label>
            <Input
              id="coach-msg"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={1000}
              placeholder={sinCuota ? "Sin consultas por hoy" : "Escribí tu consulta…"}
              disabled={!!busy || sinCuota}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Enviar"
              loading={busy === "chat"}
              disabled={!!busy || sinCuota || !draft.trim()}
            >
              <Send aria-hidden="true" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tus rutinas de gym</CardTitle>
            <CardDescription>
              {tieneRutinas
                ? "Las armó la IA con tu objetivo, tus metas, las zonas que priorizás y tu equipo. ¿Querés cambiar algo? Pedíselo (usa 1 consulta)."
                : "Todavía no tenés rutinas armadas para vos: por ahora ves las rutinas base. Armalas con IA según tu objetivo, tus metas, tus zonas y tu equipo."}{" "}
              El plan decide cuál toca cada día según tus días de entrenamiento.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {mes && (
              <p className="text-sm font-medium">
                {mes.terminado
                  ? "Terminaste tu mes: armá el próximo desde el Calendario."
                  : `Semana ${mes.semana} de 4 de tu mes de rutinas. Al terminarlo elegís tu objetivo otra vez y armamos rutinas nuevas.`}
              </p>
            )}
            {rutinasDesactualizadas && (
              <p className={AVISO}>
                Tus eventos o tu perfil cambiaron desde que generaste estas rutinas. Conviene
                rearmarlas.
              </p>
            )}
            <ZonasChips valor={zonas} onChange={setZonas} legend="Zonas a priorizar" />
            <Label htmlFor="equipo">Equipo disponible (opcional)</Label>
            <Textarea
              id="equipo"
              rows={3}
              maxLength={500}
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
              placeholder="Ej: máquinas de gym, mancuernas hasta 20 kg, sin barra olímpica"
            />
            {tieneRutinas && (
              <>
                <Label htmlFor="pedido-rutinas">¿Qué querés cambiar? (opcional)</Label>
                <Textarea
                  id="pedido-rutinas"
                  rows={2}
                  maxLength={1000}
                  value={pedido}
                  onChange={(e) => setPedido(e.target.value)}
                  placeholder="Ej: más trabajo de glúteos, sacá la sentadilla que me molesta la rodilla"
                />
              </>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleRutinas}
                loading={busy === "rutinas"}
                disabled={!!busy || sinCuota}
              >
                {busy === "rutinas"
                  ? "Armando…"
                  : tieneRutinas
                    ? "Pedir cambio"
                    : "Armar mis rutinas"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        El coach usa Google Gemini (tier gratis): Google procesa tus mensajes y puede usarlos para
        mejorar sus productos. No mandamos tu email ni tu nombre. No reemplaza a un médico ni a un
        nutricionista.
      </p>
    </div>
  );
}
