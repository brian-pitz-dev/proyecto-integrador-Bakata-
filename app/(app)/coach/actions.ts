"use server";

// Chat con el coach. Las acciones que arman planes están en comidas-, rutinas- y plan-inicial-actions.ts.
import { generate } from "@/lib/ai";
import { toISO, todayNormalized, addDays } from "@/lib/date";
import { COACH_SYSTEM, describeUser } from "@/lib/coach";
import { chatSchema } from "@/lib/validation/coach";
import type { ActionResult } from "@/lib/types";
import { prepare, cobrar, latestPeso } from "@/lib/coach-server";

export async function chatCoach(
  messages: { role: "user" | "model"; text: string }[],
): Promise<ActionResult & { reply?: string; cobrado?: boolean }> {
  const ready = await prepare();
  if (!ready.ok) return ready;
  const parsed = chatSchema.safeParse(messages);
  if (!parsed.success) return { ok: false, message: "Mensaje inválido (máximo 1000 caracteres)." };

  const { supabase, userId, ctx } = ready;
  const desde = toISO(addDays(todayNormalized(), -14));
  const [peso, { data: logs }] = await Promise.all([
    latestPeso(supabase, userId),
    supabase
      .from("registro")
      .select("categoria, fecha, valor")
      .eq("user_id", userId)
      .in("categoria", ["peso", "sueno", "tirada", "caminata", "completado"])
      .gte("fecha", desde)
      .order("fecha", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  const registros = (logs ?? []).map((r) => `- ${r.fecha} ${r.categoria}: ${r.valor}`).join("\n");
  const transcript = parsed.data
    .map((m) => `${m.role === "user" ? "Usuario" : "Coach"}: ${m.text}`)
    .join("\n\n");

  return cobrar(supabase, async () => {
    const result = await generate({
      system: `${COACH_SYSTEM}\n\nContexto del usuario:\n${describeUser(ctx, peso)}\n\nRegistros de los últimos 14 días:\n${registros || "- sin registros"}`,
      input: `${transcript}\n\nCoach:`,
    });
    return result.ok ? { ok: true, reply: result.text.trim() } : result;
  });
}
