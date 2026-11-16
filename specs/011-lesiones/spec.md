# Feature Specification: Lesiones que ajustan el plan

**Feature**: `011-lesiones` | **Created**: 2026-11-16 | **Status**: Etapa 1 implementada (2026-11-16): tests unitarios, e2e y revisada en Playwright; etapa 2 pendiente

**Input**: "La opción de marcar si tenés lesiones que tu calendario de ejercicios deba tener en
cuenta (fracturas, esguinces, fisuras…): tipo de lesión, zona y gravedad, y con eso ajustar el
plan acortándolo, modificándolo, evitando ciertas partes del cuerpo u obligándolo a no hacer
nada por x tiempo si la lesión lo amerita." Lo que diferencia a Bakata: el plan no te manda a
correr con un esguince.

Decisiones de Brian (2026-11-16): la duración la pone la persona con una sugerencia de la app;
con lesión moderada los días que no puede hacer se **reemplazan** por algo que sí puede (y si
no hay alternativa, descanso); primero esta spec y después la etapa 1.

## US1 — Cargar una lesión (P1)

Al final de **Progreso**, una sección "Lesiones" con el botón "Cargar una lesión":

- **Tipo**: fractura, fisura, esguince, desgarro, contractura, tendinitis, luxación, cirugía u
  otra.
- **Zona** y **lado** (izquierdo / derecho / ambos): cuello, hombro, codo, muñeca o mano,
  espalda alta, lumbar, cadera, muslo, rodilla, pantorrilla, tobillo o pie.
- **Gravedad**: leve, moderada o grave, con una línea que explica cada una ("leve: molesta pero
  podés moverte; moderada: duele al hacer fuerza o impacto; grave: inmoviliza o la indicó un
  médico como reposo").
- **Desde** (hoy por defecto) y **hasta cuándo** (alta estimada). La app **sugiere** una fecha
  según tipo y gravedad (research.md, Decisión 4) y la persona la cambia o la deja vacía. Vacía =
  dura hasta que toque "Ya estoy bien".
- **Nota** opcional (ej. "me lo dijo el traumatólogo").

La lista muestra las activas arriba (con "Ya estoy bien", editar y borrar) y las pasadas abajo,
como historial. "Ya estoy bien" cierra la lesión con fecha de hoy.

La primera vez pide **consentimiento explícito**: es un dato de salud (dato sensible, Ley 25.326)
y se guarda solo para ajustar el plan (ver research.md, Decisión 6).

## US2 — El plan se ajusta solo (P1)

Mientras una lesión está activa, todas las pestañas ven el plan ajustado (Calendario, Nutrición,
Coach, Progreso), igual que con la semana de retome:

| Gravedad     | Qué pasa con las sesiones que usan la zona lesionada                                                                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Leve**     | Siguen, pero más livianas: el gym de esa zona pasa a su versión liviana y el cardio de impacto baja un escalón de minutos.                                                                                                                |
| **Moderada** | Se **reemplazan** por algo que no use la zona (ej. rodilla: el running pasa a core y el gym de piernas a tren superior, así no suma días de gym; hombro: el gym de empuje/tirón pasa a piernas o core). Sin alternativa, descanso activo. |
| **Grave**    | **Reposo total**: todas las sesiones pasan a "Reposo: {tipo} de {zona}" hasta el alta.                                                                                                                                                    |

- El Calendario muestra un aviso arriba (como el de retome): "Tu plan está ajustado por tu
  esguince de tobillo (moderado) hasta el 2/12. Esto no reemplaza a un médico."
- Cada sesión cambiada dice por qué ("En lugar de: Running 30' — por tu lesión de rodilla").
- Varias lesiones a la vez se suman; si dos afectan la misma sesión, manda la más grave.
- Nutrición se ajusta sola en las macros: un día que pasa a reposo es un día "descanso"
  (`tipoDiaPara`). La meta calórica no cambia en la etapa 1 (ver research.md, Decisión 5).

## US3 — El coach sabe de la lesión (P1)

El chat y el armado de rutinas reciben las lesiones activas en el contexto (`describeUser`): no
proponen ejercicios para la zona lesionada y recomiendan consultar a un médico si algo duele.

## US4 — Volver de a poco (P2, etapa 2)

Al cerrarse una lesión moderada o grave, la semana siguiente es de **retome** (un escalón menos
de minutos, spec 009), con el aviso "Volvés de tu lesión: esta semana va más liviana".

## US5 — Cargarla al registrarse (P2, etapa 2)

Un paso opcional en el registro: "¿Tenés alguna lesión ahora?", con los mismos campos, que se
puede saltear.

## US6 — Ejercicio por ejercicio (P3, etapa 2)

Con lesión leve, en vez de pasar toda la rutina a liviana, se sacan solo los ejercicios que
cargan esa zona (ej. hombro: fuera el press de hombros, quedan los de pecho en máquina). Requiere
etiquetar con zonas cada ejercicio del catálogo (`lib/gym-exercises.ts`).

## Avisos y seguridad

- **No es consejo médico**: el aviso del Calendario, el formulario y el coach lo dicen. Con
  fractura, luxación, cirugía o cualquier lesión grave se recomienda consultar.
- **Con lesión grave sin fecha de alta, la app nunca te devuelve sola al entrenamiento**: el
  reposo sigue hasta "Ya estoy bien".
- **Eventos**: si una lesión activa (moderada o grave, en una zona que el evento usa) cae sobre la
  fecha de una carrera o caminata, se avisa ("Tu lesión llega hasta después de tu 10K: hablalo con
  tu médico"). El evento no se borra ni se cambia solo.

## Etapas

- **Etapa 1**: US1, US2 (por tipo de sesión), US3, consentimiento, `/privacidad`, exportación,
  borrado con la cuenta, tests y un e2e.
- **Etapa 2**: US4, US5, US6 y el aviso de eventos.

## Fuera de alcance

- Diagnóstico o recomendaciones de rehabilitación (ejercicios de kinesiología).
- Que la duración la calcule la app sin que la persona la confirme.
- Compartir la lesión con un profesional o subir estudios médicos.
