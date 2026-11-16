# Data Model: 011-lesiones

## Tabla `lesion`

Una fila por lesión (activa o pasada). Va en tabla y no en `user_metadata` (como las
preferencias) porque: queda el historial, entra sola en "Descargar mis datos" (`todas()` de
`app/(app)/perfil/exportar/route.ts`), se borra en cascada con la cuenta y no agranda el JWT.

| Columna      | Tipo        | Notas                                                                                                                                  |
| ------------ | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | uuid        | PK, `gen_random_uuid()`                                                                                                                |
| `user_id`    | uuid        | `default auth.uid()`, FK `auth.users` `on delete cascade`                                                                              |
| `tipo`       | text        | check: `fractura`, `fisura`, `esguince`, `desgarro`, `contractura`, `tendinitis`, `luxacion`, `cirugia`, `otra`                        |
| `zona`       | text        | check: `cuello`, `hombro`, `codo`, `muneca_mano`, `espalda_alta`, `lumbar`, `cadera`, `muslo`, `rodilla`, `pantorrilla`, `tobillo_pie` |
| `lado`       | text        | check: `izquierdo`, `derecho`, `ambos`; null para cuello / espalda / lumbar                                                            |
| `gravedad`   | text        | check: `leve`, `moderada`, `grave`                                                                                                     |
| `desde`      | date        | not null                                                                                                                               |
| `hasta`      | date        | null = hasta "Ya estoy bien"; check `hasta >= desde`                                                                                   |
| `nota`       | text        | opcional, hasta 280 caracteres (validado con zod)                                                                                      |
| `created_at` | timestamptz | `default now()`                                                                                                                        |
| `updated_at` | timestamptz | `default now()`; marca el plan de la IA como viejo (`lib/ia-estado.ts`)                                                                |

`hasta` es el **alta**: el primer día ya recuperado. **Activa** en una fecha `d` ⇔ `desde <= d` y
(`hasta` es null o `d < hasta`). "Ya estoy bien" pone `hasta = hoy`, así el plan vuelve a la
normalidad ese mismo día; si la lesión todavía no había empezado, se borra.

## Migración propuesta

`supabase/migrations/2026111xxxxxxx_lesion.sql` (mismo patrón que `perfil_evento.sql`):

```sql
create table public.lesion (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tipo        text not null check (tipo in ('fractura', 'fisura', 'esguince', 'desgarro',
                'contractura', 'tendinitis', 'luxacion', 'cirugia', 'otra')),
  zona        text not null check (zona in ('cuello', 'hombro', 'codo', 'muneca_mano',
                'espalda_alta', 'lumbar', 'cadera', 'muslo', 'rodilla', 'pantorrilla', 'tobillo_pie')),
  lado        text check (lado in ('izquierdo', 'derecho', 'ambos')),
  gravedad    text not null check (gravedad in ('leve', 'moderada', 'grave')),
  desde       date not null,
  hasta       date check (hasta is null or hasta >= desde),
  nota        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index lesion_user_desde_idx on public.lesion (user_id, desde desc);

alter table public.lesion enable row level security;

create policy "Individuals can view their own lesion rows"
  on public.lesion for select to authenticated using ((select auth.uid()) = user_id);
create policy "Individuals can insert their own lesion rows"
  on public.lesion for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Individuals can update their own lesion rows"
  on public.lesion for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Individuals can delete their own lesion rows"
  on public.lesion for delete to authenticated using ((select auth.uid()) = user_id);
```

## Consentimiento

`user_metadata.salud_consentida_at` (ISO timestamp), igual que `terminos_aceptados_at` del
registro. Se pide la primera vez que se guarda una lesión; `guardarLesion` lo exige (si falta, no
guarda). Ver research.md, Decisión 6.

## En código

- `lib/validation/lesion.ts`: `lesionSchema` (zod) con los mismos enums, `nota` ≤ 280 y
  `hasta >= desde`.
- `lib/lesiones.ts`: tipos `Lesion`, `ZONA_LABEL`, `TIPO_LABEL`, `duracionSugerida()` y la función
  pura `aplicarLesiones()` (research.md, Decisiones 1-3).
- `UserPlanContext` (`lib/user-plan.ts`) suma `lesiones: Lesion[]` (las activas hoy y las que
  arrancan más adelante, para ajustar semanas futuras).
