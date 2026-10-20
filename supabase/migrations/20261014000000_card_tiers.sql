create table public.card_tiers (
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    set_code text not null,
    card_id text not null,
    tier text not null check (tier in ('S', 'A', 'B', 'C', 'D', 'E')),
    updated_at timestamptz not null default now(),
    primary key (user_id, card_id)
);

create index card_tiers_user_set_idx on public.card_tiers (user_id, set_code);

alter table public.card_tiers enable row level security;

create policy "card_tiers_select_own" on public.card_tiers
    for select to authenticated using ((select auth.uid()) = user_id);

create policy "card_tiers_insert_own" on public.card_tiers
    for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "card_tiers_update_own" on public.card_tiers
    for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "card_tiers_delete_own" on public.card_tiers
    for delete to authenticated using ((select auth.uid()) = user_id);
