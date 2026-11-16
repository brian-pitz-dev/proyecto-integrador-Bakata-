-- Borrar la cuenta exige la contraseña también en la base. Antes cualquier sesión podía llamar
-- borrar_mi_cuenta() directo por la API (/rest/v1/rpc) y saltear el chequeo de /perfil: con una
-- sesión abierta en otra compu alcanzaba. Ahora la función compara la clave contra el hash de
-- auth.users (bcrypt, pgcrypto en el schema extensions) y solo borra si coincide.
drop function if exists public.borrar_mi_cuenta();

create function public.borrar_mi_cuenta(clave text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  hash text;
begin
  if auth.uid() is null then
    raise exception 'no autenticado';
  end if;
  select encrypted_password into hash from auth.users where id = auth.uid();
  if hash is null or hash = '' or extensions.crypt(clave, hash) <> hash then
    return false;
  end if;
  delete from auth.users where id = auth.uid();
  return true;
end;
$$;

revoke execute on function public.borrar_mi_cuenta(text) from public, anon;
grant execute on function public.borrar_mi_cuenta(text) to authenticated;
