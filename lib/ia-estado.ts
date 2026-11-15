/**
 * Estado de los planes de IA para las pantallas que los muestran (Coach y Nutrición):
 * cuántas consultas le quedan hoy y si un plan quedó viejo porque cambió el perfil o los
 * eventos después de generarlo. Solo server (usa el cliente de Supabase del request).
 */

import { createClient } from "@/lib/supabase/server";
import { toISO, todayNormalized } from "@/lib/date";

export async function getIaEstado(): Promise<{
  usosHoy: number;
  /** true si `updatedAt` es anterior al último cambio de perfil o de eventos. */
  isStale: (updatedAt?: string) => boolean;
}> {
  const supabase = await createClient();
  const [{ data: uso }, { data: perfil }, { data: ultimoEvento }] = await Promise.all([
    supabase.from("uso_ia").select("usos").eq("fecha", toISO(todayNormalized())).maybeSingle(),
    supabase.from("perfil").select("updated_at").maybeSingle(),
    supabase
      .from("evento")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // shortcut: borrar un evento no deja rastro y no marca el plan de la IA como viejo;
  // si hace falta, guardar la fecha del último cambio en perfil y comparar contra eso.
  const lastChange = [perfil?.updated_at, ultimoEvento?.updated_at]
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  return {
    usosHoy: uso?.usos ?? 0,
    isStale: (updatedAt) => !!updatedAt && !!lastChange && updatedAt < lastChange,
  };
}
