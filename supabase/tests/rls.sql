-- Auditoría ejecutable después de aplicar las migraciones.
-- Falla con una excepción si una tabla queda expuesta sin la protección esperada.
do $$
declare
  profiles_policy_count integer;
  consents_policy_count integer;
begin
  if not coalesce((
    select relrowsecurity and relforcerowsecurity
    from pg_class
    where oid = 'public.profiles'::regclass
  ), false) then
    raise exception 'profiles debe tener RLS habilitado y forzado';
  end if;

  if not coalesce((
    select relrowsecurity and relforcerowsecurity
    from pg_class
    where oid = 'public.user_consents'::regclass
  ), false) then
    raise exception 'user_consents debe tener RLS habilitado y forzado';
  end if;

  select count(*) into profiles_policy_count
  from pg_policies
  where schemaname = 'public' and tablename = 'profiles';

  select count(*) into consents_policy_count
  from pg_policies
  where schemaname = 'public' and tablename = 'user_consents';

  if profiles_policy_count <> 2 then
    raise exception 'profiles esperaba 2 políticas RLS y encontró %', profiles_policy_count;
  end if;

  if consents_policy_count <> 3 then
    raise exception 'user_consents esperaba 3 políticas RLS y encontró %', consents_policy_count;
  end if;

  if has_table_privilege('anon', 'public.profiles', 'SELECT')
    or has_table_privilege('anon', 'public.user_consents', 'SELECT') then
    raise exception 'anon no debe tener SELECT sobre datos de cuenta';
  end if;

  if has_table_privilege('authenticated', 'public.profiles', 'INSERT')
    or has_table_privilege('authenticated', 'public.profiles', 'DELETE') then
    raise exception 'authenticated no debe insertar ni eliminar perfiles directamente';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in ('profiles', 'user_consents')
      and column_name in ('feeling', 'emotion_text', 'reflection_text', 'prompt')
  ) then
    raise exception 'Las tablas de cuenta no deben guardar texto emocional';
  end if;
end;
$$;
