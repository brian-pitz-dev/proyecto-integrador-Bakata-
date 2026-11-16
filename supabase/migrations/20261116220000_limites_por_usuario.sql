-- Límites en la base: la clave anon + la sesión permiten escribir directo por la API (/rest/v1,
-- /storage/v1) sin pasar por las Server Actions, así que zod, MAX_FOTOS y los rate limits de la
-- app no alcanzan. RLS solo exige que la fila sea propia; esto acota cuánto puede escribir cada
-- usuario, para que una sola cuenta no llene el plan gratis (500 MB de base, 1 GB de Storage) y
-- deje el proyecto en solo lectura para todos. Los topes son holgados respecto del uso real.

-- `not valid`: no revisa las filas que ya existen (no frena la migración), pero sí cada fila
-- nueva o editada. Para validarlas también: alter table ... validate constraint <nombre>.
alter table public.registro
  add constraint registro_categoria check (categoria in (
    'tirada', 'caminata', 'calorias', 'peso', 'sueno', 'completado', 'evento',
    'foto', 'grasa', 'carga', 'mover'
  )) not valid,
  -- saveLog permite 500; la nota de una foto, 140; la de una carga, el nombre del ejercicio
  add constraint registro_nota_largo check (nota is null or char_length(nota) <= 500) not valid;

alter table public.evento
  add constraint evento_textos_largo check (
    char_length(nombre) <= 100
    and (etiqueta is null or char_length(etiqueta) <= 200)
    and (detalle is null or char_length(detalle) <= 500)
  ) not valid;

-- un plan de comidas o rutinas real pesa unas decenas de KB
alter table public.plan_ia
  add constraint plan_ia_tamano check (pg_column_size(contenido) <= 524288) not valid;

-- Tope de filas por usuario: sin esto, los límites de largo igual dejan insertar millones de
-- filas cortas. Corre como el usuario (RLS incluida): cuenta solo las suyas, por el índice de user_id.
create function public.tope_filas_por_usuario()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  n integer;
begin
  execute format('select count(*) from %I.%I where user_id = $1', tg_table_schema, tg_table_name)
    into n using new.user_id;
  if n >= tg_argv[0]::integer then
    raise exception 'Llegaste al máximo de filas en %', tg_table_name using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

-- registro: ~15 filas por día de uso intenso → 50.000 son unos 9 años
create trigger registro_tope before insert on public.registro
  for each row execute function public.tope_filas_por_usuario('50000');
-- la app permite 20 eventos al registrarse
create trigger evento_tope before insert on public.evento
  for each row execute function public.tope_filas_por_usuario('50');
create trigger lesion_tope before insert on public.lesion
  for each row execute function public.tope_filas_por_usuario('100');

-- Fotos: el mismo tope que MAX_FOTOS (lib/fotos.ts), ahora también para quien sube directo a
-- Storage. Reemplazar la foto de un día que ya existe (upsert) sigue andando con el tope lleno.
drop policy "fotos: subir a la carpeta propia" on storage.objects;

create policy "fotos: subir a la carpeta propia" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'fotos-progreso'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (
      (select count(*) from storage.objects o
        where o.bucket_id = 'fotos-progreso'
          and (storage.foldername(o.name))[1] = auth.uid()::text) < 100
      or exists (select 1 from storage.objects o
        where o.bucket_id = 'fotos-progreso' and o.name = storage.objects.name)
    )
  );
