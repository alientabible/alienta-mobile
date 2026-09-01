-- Auditoría ejecutable después de aplicar las migraciones.
-- Falla con una excepción si una tabla queda expuesta sin la protección esperada.
do $$
declare
  profiles_policy_count integer;
  consents_policy_count integer;
  reading_policy_count integer;
  favorites_policy_count integer;
  consent_gated_policy_count integer;
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

  if not coalesce((
    select relrowsecurity and relforcerowsecurity
    from pg_class
    where oid = 'public.bible_reading_progress'::regclass
  ), false) then
    raise exception 'bible_reading_progress debe tener RLS habilitado y forzado';
  end if;

  if not coalesce((
    select relrowsecurity and relforcerowsecurity
    from pg_class
    where oid = 'public.bible_favorites'::regclass
  ), false) then
    raise exception 'bible_favorites debe tener RLS habilitado y forzado';
  end if;

  select count(*) into profiles_policy_count
  from pg_policies
  where schemaname = 'public' and tablename = 'profiles';

  select count(*) into consents_policy_count
  from pg_policies
  where schemaname = 'public' and tablename = 'user_consents';

  select count(*) into reading_policy_count
  from pg_policies
  where schemaname = 'public' and tablename = 'bible_reading_progress';

  select count(*) into favorites_policy_count
  from pg_policies
  where schemaname = 'public' and tablename = 'bible_favorites';

  if profiles_policy_count <> 2 then
    raise exception 'profiles esperaba 2 políticas RLS y encontró %', profiles_policy_count;
  end if;

  if consents_policy_count <> 3 then
    raise exception 'user_consents esperaba 3 políticas RLS y encontró %', consents_policy_count;
  end if;

  if reading_policy_count <> 3 then
    raise exception 'bible_reading_progress esperaba 3 políticas RLS y encontró %', reading_policy_count;
  end if;

  if favorites_policy_count <> 3 then
    raise exception 'bible_favorites esperaba 3 políticas RLS y encontró %', favorites_policy_count;
  end if;

  select count(*) into consent_gated_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename in ('bible_reading_progress', 'bible_favorites')
    and concat_ws(' ', qual, with_check) ilike '%bible_sync%';

  if consent_gated_policy_count <> 6 then
    raise exception 'Las 6 políticas bíblicas deben exigir consentimiento bible_sync';
  end if;

  if has_table_privilege('anon', 'public.profiles', 'SELECT')
    or has_table_privilege('anon', 'public.user_consents', 'SELECT')
    or has_table_privilege('anon', 'public.bible_reading_progress', 'SELECT')
    or has_table_privilege('anon', 'public.bible_favorites', 'SELECT') then
    raise exception 'anon no debe tener SELECT sobre datos de cuenta';
  end if;

  if has_table_privilege('authenticated', 'public.profiles', 'INSERT')
    or has_table_privilege('authenticated', 'public.profiles', 'DELETE') then
    raise exception 'authenticated no debe insertar ni eliminar perfiles directamente';
  end if;

  if has_table_privilege('authenticated', 'public.bible_reading_progress', 'DELETE')
    or has_table_privilege('authenticated', 'public.bible_favorites', 'DELETE') then
    raise exception 'authenticated no debe eliminar directamente datos bíblicos sincronizados';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name in (
        'profiles',
        'user_consents',
        'bible_reading_progress',
        'bible_favorites'
      )
      and column_name in (
        'feeling',
        'emotion_text',
        'reflection_text',
        'prompt',
        'verse_text'
      )
  ) then
    raise exception 'Las tablas de cuenta no deben guardar texto emocional';
  end if;
end;
$$;
