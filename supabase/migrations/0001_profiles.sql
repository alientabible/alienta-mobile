-- Perfil mínimo para una cuenta opcional. No almacena texto emocional ni historial bíblico.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  locale text not null default 'es-CO' check (char_length(locale) between 2 and 16),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.profiles is
  'Perfil mínimo de Alienta; nunca contiene el texto libre de cómo se siente una persona.';

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

revoke all on table public.profiles from anon, authenticated;
grant select, update on table public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

revoke all on function public.set_profile_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_profile_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, locale)
  values (
    new.id,
    left(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 80),
    case
      when char_length(trim(new.raw_user_meta_data ->> 'locale')) between 2 and 16
        then trim(new.raw_user_meta_data ->> 'locale')
      else 'es-CO'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
