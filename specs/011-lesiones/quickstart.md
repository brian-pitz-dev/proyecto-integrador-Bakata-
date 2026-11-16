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
6. Cargar además una lesión **leve** de hombro: el gym de empuje/tirón pasa a liviano; el tobillo
   (más grave) sigue mandando en los días de piernas y running.
7. "Ya estoy bien" en las dos → el plan vuelve a ser el de siempre desde hoy; quedan en el
   historial.
8. **Descargar mis datos** (Perfil) → el JSON trae `lesiones`. Borrar una lesión → desaparece.
9. Celular (390 px): el formulario y la lista entran sin scroll horizontal.
