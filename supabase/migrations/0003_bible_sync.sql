-- La sincronización bíblica requiere sesión y consentimiento bible_sync en la aplicación.
-- Solo guarda referencias y estado; nunca almacena el texto de los versículos.
create table if not exists public.bible_reading_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  version_id text not null check (version_id in ('rvr1909', 'webp')),
  book_id text not null check (char_length(book_id) between 2 and 16),
  chapter smallint not null check (chapter between 1 and 200),
  verse smallint check (verse is null or verse between 1 and 200),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.bible_reading_progress is
  'Última referencia bíblica del usuario; no contiene el texto del versículo.';

alter table public.bible_reading_progress enable row level security;
alter table public.bible_reading_progress force row level security;

revoke all on table public.bible_reading_progress from anon, authenticated;
grant select, insert, update on table public.bible_reading_progress to authenticated;

drop policy if exists "bible_reading_progress_select_own" on public.bible_reading_progress;
create policy "bible_reading_progress_select_own"
on public.bible_reading_progress
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_consents as consent
    where consent.user_id = (select auth.uid())
      and consent.purpose = 'bible_sync'
      and consent.granted
  )
);

drop policy if exists "bible_reading_progress_insert_own" on public.bible_reading_progress;
create policy "bible_reading_progress_insert_own"
on public.bible_reading_progress
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_consents as consent
    where consent.user_id = (select auth.uid())
      and consent.purpose = 'bible_sync'
      and consent.granted
  )
);

drop policy if exists "bible_reading_progress_update_own" on public.bible_reading_progress;
create policy "bible_reading_progress_update_own"
on public.bible_reading_progress
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_consents as consent
    where consent.user_id = (select auth.uid())
      and consent.purpose = 'bible_sync'
      and consent.granted
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_consents as consent
    where consent.user_id = (select auth.uid())
      and consent.purpose = 'bible_sync'
      and consent.granted
  )
);

-- favorited=false funciona como una baja lógica. La marca evita que un dispositivo
-- desactualizado vuelva a crear un favorito retirado desde otro dispositivo.
create table if not exists public.bible_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  verse_key text not null check (char_length(verse_key) between 5 and 80),
  favorited boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, verse_key)
);

comment on table public.bible_favorites is
  'Estado sincronizable de favoritos por referencia; no contiene texto bíblico.';

alter table public.bible_favorites enable row level security;
alter table public.bible_favorites force row level security;

revoke all on table public.bible_favorites from anon, authenticated;
grant select, insert, update on table public.bible_favorites to authenticated;

drop policy if exists "bible_favorites_select_own" on public.bible_favorites;
create policy "bible_favorites_select_own"
on public.bible_favorites
for select
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_consents as consent
    where consent.user_id = (select auth.uid())
      and consent.purpose = 'bible_sync'
      and consent.granted
  )
);

drop policy if exists "bible_favorites_insert_own" on public.bible_favorites;
create policy "bible_favorites_insert_own"
on public.bible_favorites
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_consents as consent
    where consent.user_id = (select auth.uid())
      and consent.purpose = 'bible_sync'
      and consent.granted
  )
);

drop policy if exists "bible_favorites_update_own" on public.bible_favorites;
create policy "bible_favorites_update_own"
on public.bible_favorites
for update
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_consents as consent
    where consent.user_id = (select auth.uid())
      and consent.purpose = 'bible_sync'
      and consent.granted
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.user_consents as consent
    where consent.user_id = (select auth.uid())
      and consent.purpose = 'bible_sync'
      and consent.granted
  )
);
