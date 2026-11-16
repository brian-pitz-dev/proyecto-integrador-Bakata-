-- Lesiones que ajustan el plan (specs/011-lesiones). Dato de salud (sensible, Ley 25.326): solo
-- lo ve su dueño (RLS) y se borra con la cuenta (cascade). El consentimiento queda en
-- user_metadata.salud_consentida_at y lo exige guardarLesion.
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
  nota        text check (nota is null or char_length(nota) <= 280),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index lesion_user_desde_idx on public.lesion (user_id, desde desc);

alter table public.lesion enable row level security;

create policy "Individuals can view their own lesion rows"
  on public.lesion for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Individuals can insert their own lesion rows"
  on public.lesion for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Individuals can update their own lesion rows"
  on public.lesion for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Individuals can delete their own lesion rows"
  on public.lesion for delete to authenticated
  using ((select auth.uid()) = user_id);
