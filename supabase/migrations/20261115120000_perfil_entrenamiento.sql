-- Personalización del entrenamiento por usuario (nivel, objetivo, días de fuerza, lugar).
-- Los defaults reproducen el plan original: las filas existentes no cambian de comportamiento.
-- Las políticas RLS de `perfil` ya cubren estas columnas (son por fila, por user_id).

alter table public.perfil
  add column if not exists nivel text not null default 'intermedio'
    check (nivel in ('principiante', 'intermedio', 'avanzado')),
  add column if not exists objetivo text not null default 'rendimiento'
    check (objetivo in ('bajar_grasa', 'ganar_musculo', 'rendimiento', 'salud')),
  add column if not exists dias_gym smallint not null default 3
    check (dias_gym between 2 and 5),
  add column if not exists lugar text not null default 'gimnasio'
    check (lugar in ('gimnasio', 'casa', 'peso_corporal')),
  -- Días elegidos para fuerza (null = los sugeridos por el plan). La regla de no repetir
  -- zona en días seguidos se valida en la app (lib/strength-schedule.ts).
  add column if not exists dias_fuerza text[]
    check (dias_fuerza <@ array['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  -- Cambios puntuales por semana: {"2026-11-16": ["tue", "thu", "sun"], ...}, clave = lunes
  -- de la semana. Pisan a dias_fuerza solo esa semana.
  add column if not exists dias_fuerza_semana jsonb not null default '{}'::jsonb
    check (jsonb_typeof(dias_fuerza_semana) = 'object');

-- Que la API (PostgREST) vea las columnas nuevas sin esperar.
notify pgrst, 'reload schema';
