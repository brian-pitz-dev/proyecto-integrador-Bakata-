# Research: 011-lesiones

## Decisión 1 — Un ajuste más en la cadena del plan, por día

`getUserPlanContext()` (`lib/user-plan.ts`) ya arma el plan en cadena:
`buildPlan` → `priorizarZonas` → `recortarCore` → `aplicarMovimientos`. Las lesiones van **al
final**: `aplicarLesiones(weeks, lesiones)`. Así un día movido por la persona también se ajusta, y
Calendario, Nutrición, Coach y Progreso ven el mismo plan sin tocarlos uno por uno (como el retome,
spec 009).

- Se aplica **por día**: cada día de cada semana se ajusta con las lesiones activas _ese día_
  (`desde <= día <= hasta`). Una lesión que termina el miércoles no toca el jueves.
- Función **pura** (sin Supabase) en `lib/lesiones.ts`, testeada en `lib/lesiones.test.ts`.
- `motivoNoMover` (`lib/mover.ts`) ya rechaza mover un día sin entrenamiento, así que un día de
  reposo por lesión no se puede mover.
- **Días de evento**: `getSessionsForDate` devuelve el override del evento antes de mirar las
  semanas, así que `aplicarLesiones` no los toca. Es a propósito: correr o no la carrera lo decide
  la persona (con su médico). La etapa 2 suma el aviso.

**Alternativa descartada**: filtrar al mostrar (en `CalendarGrid`). Se evaluó y no: Nutrición
(`tipoDiaPara`), el Coach y los conteos de Progreso verían otro plan.

## Decisión 2 — Qué sesión usa qué zona

Con lo que el plan ya sabe de cada sesión (`tag` + `gymKey`), sin tocar el catálogo:

| Sesión                         | Zonas que la afectan                                     |
| ------------------------------ | -------------------------------------------------------- |
| `run`, `long`, `luj` (impacto) | cadera, muslo, rodilla, pantorrilla, tobillo/pie, lumbar |
| `walk`                         | tobillo/pie, rodilla, cadera (solo desde moderada)       |
| gym `inferior*`                | cadera, muslo, rodilla, pantorrilla, tobillo/pie, lumbar |
| gym `empuje*`                  | hombro, codo, muñeca/mano, cuello                        |
| gym `tiron*`                   | hombro, codo, muñeca/mano, espalda alta, lumbar, cuello  |
| `core`                         | lumbar; cuello y muñeca/mano (planchas) desde moderada   |
| `rest`                         | ninguna                                                  |

Es una tabla en `lib/lesiones.ts` (`ZONAS_POR_SESION`). El lado (izq/der) no cambia el ajuste en la
etapa 1: un esguince de tobillo derecho igual impide correr.

## Decisión 3 — Qué hace cada gravedad

- **Leve**: la sesión sigue. En la etapa 1 el gym afectado pasaba a su versión liviana; desde la
  etapa 2 queda la misma rutina sin los ejercicios que cargan la zona (Decisión 9). El cardio de
  impacto baja un escalón de minutos en las semanas con lesión leve que lo afecte, con el mismo
  mecanismo del retome: `buildPlan` recibía _una_ semana de retome; pasa a recibir una lista
  (`semanasLivianas()`). El resto queda igual.
- **Moderada** — **reemplazar** (decisión de Brian), sin dejar el mismo grupo muscular en días
  seguidos (la regla de `gruposDelDia` en `lib/mover.ts`):
  - cardio (running, salida larga, caminata) con lesión inferior → core (si el core también está
    lesionado, gym superior). No pasa a gym: con 3-4 días de running a la semana se sumaban 5 días
    de gym superior, demasiado volumen (se vio al implementar);
  - gym de piernas con lesión inferior → gym superior (empuje o tirón); si el día de al lado ya es
    de ese grupo, el otro, y si los dos están ocupados, core;
  - gym superior con lesión superior → gym inferior; si el de al lado ya es de piernas, core;
  - lesión lumbar → todo pasa a "Caminata suave 20-30'";
  - sin alternativa posible (ej. la alternativa también está lesionada) → "Descanso activo:
    movilidad suave".
  - La sesión nueva guarda `reemplaza` (label de la original) y `motivo` ("por tu esguince de
    tobillo") para mostrar "En lugar de: Running 30'".
- **Grave**: todos los días activos → `{ tag: "rest", label: "Reposo", detail: "por tu fractura
de muñeca" }`.
- Varias lesiones: se aplican todas; por sesión manda la más grave.

`Session` suma dos campos opcionales: `motivo?: string` y `reemplaza?: string`.

## Decisión 4 — Duración sugerida (la persona la confirma)

Decisión de Brian: la fecha de alta la pone la persona; la app solo sugiere. Valores orientativos
(semanas, desde `desde`), en `duracionSugerida(tipo, gravedad)`:

| Tipo           | Leve                               | Moderada | Grave |
| -------------- | ---------------------------------- | -------- | ----- |
| Contractura    | 1                                  | 2        | 3     |
| Tendinitis     | 2                                  | 4        | 6     |
| Esguince       | 2                                  | 4        | 8     |
| Desgarro       | 2                                  | 5        | 10    |
| Fisura         | 4                                  | 6        | 8     |
| Luxación       | 3                                  | 6        | 10    |
| Fractura       | 6                                  | 8        | 12    |
| Cirugía / otra | sin sugerencia (la pone su médico) |          |       |

El formulario dice "Sugerencia orientativa: seguí lo que te indique tu médico". Con lesión grave sin
fecha, el reposo dura hasta "Ya estoy bien" (nunca termina solo).

## Decisión 5 — Calorías: sin cambios en la etapa 1

La meta calórica (`lib/calorie-target.ts`) depende de la fase y del factor de actividad del perfil,
no de las sesiones; las macros sí siguen el día (`tipoDiaPara`), así que un reposo ya baja los
hidratos solo. Bajar el factor de actividad durante un reposo largo (ej. a 1.2) queda para la
etapa 2: cambia la meta de semanas enteras y conviene validarlo aparte.

## Decisión 6 — Dato sensible: consentimiento, privacidad y borrado

Un dato de salud es **dato sensible** (Ley 25.326, art. 2 y 7): requiere consentimiento expreso y
finalidad clara.

- La primera vez, el formulario pide marcar "Acepto que Bakata guarde esta lesión para ajustar mi
  plan" → `user_metadata.salud_consentida_at`. `guardarLesion` lo exige del lado del servidor.
- `/privacidad` suma: qué se guarda, para qué (solo ajustar el plan y el contexto del coach), que
  el coach lo manda a Gemini como el resto del perfil, y cómo borrarlo.
- Exportación: `lesion` entra en `todas()` del export. Borrado: cascada con la cuenta, y cada
  lesión se puede borrar sola.

## Decisión 7 — Server Actions

`app/(app)/progreso/lesiones-actions.ts`: `guardarLesion` (alta/edición), `cerrarLesion` (hasta =
hoy) y `borrarLesion`. Mismo patrón que `guardarEvento`: `getAuthedUser()`, `lesionSchema` (zod),
filtro por `user_id` además de RLS, `cargaLimiter`, y `revalidatePath("/", "layout")` porque cambia
el plan de todas las pestañas.

## Decisión 8 — Tests

- `lib/lesiones.test.ts`: leve (gym → liviana), moderada inferior (running → superior, sin repetir
  grupo en días seguidos; sin alternativa → descanso activo), lumbar (→ caminata), grave (todo
  reposo), lesión que termina a mitad de semana, dos lesiones (manda la más grave), días de evento
  sin tocar, y `duracionSugerida`.
- `e2e/lesiones.spec.ts`: cargar una lesión grave de tobillo con fecha de hoy → el día de hoy del
  Calendario dice "Reposo" y aparece el aviso; "Ya estoy bien" → vuelve el plan. `global-setup.ts`
  borra las lesiones de la cuenta E2E antes de correr.

## Decisión 9 — Zonas por ejercicio (etapa 2, US6)

`lib/ejercicios-zonas.ts` etiqueta a mano los 65 ejercicios del catálogo con las zonas que
**cargan**, que no son los músculos que trabajan (un press de pecho carga hombro, codo y muñeca).
Dos niveles: principal (el esfuerzo o el riesgo está ahí; se saca con leve) y secundaria (también
se carga; se saca desde moderada). `lib/ejercicios-zonas.test.ts` falla si un ejercicio nuevo del
catálogo no tiene su entrada. Un ejercicio fuera del catálogo (rutinas viejas de la IA) queda: no se
sabe qué carga.

- `aplicarLesiones` deja en cada sesión de gym o core del día la lista `evitar` (zona + gravedad de
  las lesiones activas) y `ExerciseBlock` filtra antes del tope por tiempo y muestra qué sacó.
- Criterio conservador: con hombro leve, el hombro es principal en todos los press, así que el día
  de empuje puede quedar con 1-2 ejercicios. Si se quiere más permisivo, pasar el hombro a
  secundaria en los press de pecho en máquina.

## Decisión 10 — Vuelta gradual (etapa 2, US4)

Los 7 días desde el alta (`hasta`) de una moderada o grave van un escalón más livianos con el
mismo mecanismo del retome (`semanasLivianas()` suma ese período). Por semana: si el alta cae un
jueves, van más livianas esa semana y la siguiente. `vueltaDeLesion()` decide el aviso del
Calendario. "Ya estoy bien" pone el alta en hoy, así que la vuelta arranca ese mismo día.

## Decisión 11 — Aviso de eventos (etapa 2)

`eventosEnRiesgo()`: eventos de hoy en adelante cuya fecha cae con una lesión activa grave
(cualquier zona: es reposo total) o moderada de piernas o lumbar. Solo avisa en el Calendario; el
día del evento no cambia (Decisión 1).

## Decisión 12 — Lesión en el registro (etapa 2, US5)

Va al final del paso "Tu plan" (no suma un paso). `registroSchema` y `onboardingSchema` aceptan
`lesiones` (hasta 3, por defecto ninguna) y `consienteSalud`, y rechazan una lesión sin
consentimiento. El consentimiento queda en `user_metadata.salud_consentida_at` (en el `signUp` o en
el `updateUser` del onboarding). Si hay que confirmar el email, la lesión viaja en
`registro_pendiente.lesiones` y `completarRegistroPendiente` solo la guarda si quedó ese
consentimiento; `guardarPerfilYEventos` la inserta (borrando antes, por si es un reintento).
