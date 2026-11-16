# Quickstart: validar 011-lesiones (etapa 1)

1. Aplicar la migración `lesion` (`supabase db push --remote`) y correr `npm test`
   (`lib/lesiones.test.ts`) y `npm run e2e` (`e2e/lesiones.spec.ts`).
2. En **Progreso → Lesiones**, cargar un esguince de tobillo **moderado** desde hoy. La primera vez
   pide el consentimiento; sin marcarlo no guarda. La fecha de alta viene sugerida (4 semanas).
3. **Calendario**: aparece el aviso "Tu plan está ajustado por tu esguince de tobillo…"; los días de
   running y de piernas dicen "En lugar de: …" y pasan a tren superior o core, sin dos días
   seguidos del mismo grupo.
4. Editar la lesión a **grave**: todos los días hasta el alta dicen "Reposo". Nutrición muestra
   esos días como "descanso".
5. **Coach**: preguntar "¿qué hago esta semana?" → la respuesta tiene en cuenta el tobillo.
6. Cargar además una lesión **leve** de hombro: el empuje y el tirón siguen, sin los ejercicios
   que cargan el hombro (etapa 2); el tobillo (más grave) sigue mandando en piernas y running.
7. "Ya estoy bien" en las dos → el plan vuelve a ser el de siempre desde hoy; quedan en el
   historial.
8. **Descargar mis datos** (Perfil) → el JSON trae `lesiones`. Borrar una lesión → desaparece.
9. Celular (390 px): el formulario y la lista entran sin scroll horizontal.

## Etapa 2

10. Lesión **leve** de hombro → en la rutina de empuje aparece "Sin press de …: cargan tu lesión"
    y quedan solo los que no lo cargan; con moderada también salen los que lo cargan como
    secundaria (ej. plancha).
11. Una lesión moderada con alta hace 1-6 días → aviso "Volvés de tu …" y sesiones más cortas.
12. Lesión grave sin alta y una carrera más adelante → aviso "Tenés … y tu … todavía no va a tener
    el alta".
13. Registro (`/signup`) → en "Tu plan", "Tengo una lesión ahora": sin completarla o sin el
    consentimiento no deja terminar; con todo, la cuenta arranca con la lesión cargada.
