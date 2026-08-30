-- Cada propósito se acepta o revoca por separado. No se infiere consentimiento por crear cuenta.
create table if not exists public.user_consents (
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null check (
    purpose in ('account_terms', 'privacy_policy', 'bible_sync')
  ),
  policy_version text not null check (char_length(policy_version) between 3 and 80),
  granted boolean not null,
  decided_at timestamptz not null default timezone('utc', now()),
  revoked_at timestamptz,
  primary key (user_id, purpose),
  constraint user_consents_revocation_consistent check (
    (granted and revoked_at is null) or (not granted and revoked_at is not null)
  )
);

comment on table public.user_consents is
  'Decisiones granulares y versionadas; bible_sync no incluye texto emocional.';

alter table public.user_consents enable row level security;
alter table public.user_consents force row level security;

revoke all on table public.user_consents from anon, authenticated;
grant select, insert, update on table public.user_consents to authenticated;

drop policy if exists "user_consents_select_own" on public.user_consents;
create policy "user_consents_select_own"
on public.user_consents
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "user_consents_insert_own" on public.user_consents;
create policy "user_consents_insert_own"
on public.user_consents
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "user_consents_update_own" on public.user_consents;
create policy "user_consents_update_own"
on public.user_consents
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
