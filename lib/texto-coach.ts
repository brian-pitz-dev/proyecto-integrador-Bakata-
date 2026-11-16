/** Pedazo de una línea de la respuesta del coach: texto común o en negrita. */
export type Tramo = { texto: string; negrita: boolean };
export type Bloque = { tipo: "p"; tramos: Tramo[] } | { tipo: "lista"; items: Tramo[][] };

/** "**clave** y *algo*" → tramos, sin asteriscos: la cursiva suelta queda como texto común. */
function tramosDe(linea: string): Tramo[] {
  return linea
    .split(/\*\*(.+?)\*\*/)
    .map((texto, i) => ({
      texto: texto.replace(/\*(\S(?:.*?\S)?)\*/g, "$1"),
      negrita: i % 2 === 1,
    }))
    .filter((t) => t.texto);
}

/**
 * El Markdown mínimo que devuelve Gemini (negrita, listas con "-" o "*", títulos "#") pasado a
 * bloques para mostrar sin los símbolos. Las líneas vacías solo separan.
 */
export function bloquesDeTexto(texto: string): Bloque[] {
  const bloques: Bloque[] = [];
  for (const cruda of texto.split("\n")) {
    const linea = cruda.trim();
    if (!linea) continue;
    const item = /^[-*•]\s+(.*)$/.exec(linea);
    const titulo = /^#{1,6}\s+(.*)$/.exec(linea);
    const ultimo = bloques.at(-1);
    if (item && ultimo?.tipo === "lista") ultimo.items.push(tramosDe(item[1]));
    else if (item) bloques.push({ tipo: "lista", items: [tramosDe(item[1])] });
    else if (titulo)
      bloques.push({ tipo: "p", tramos: [{ texto: titulo[1].replace(/\*/g, ""), negrita: true }] });
    else bloques.push({ tipo: "p", tramos: tramosDe(linea) });
  }
  return bloques;
}
