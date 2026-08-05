-- Wishlist/favorites: strictly private to the owning user.
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index favorites_user_id_idx on public.favorites(user_id);

grant all on public.favorites to anon, authenticated, service_role;

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites for select
  using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites for insert
  with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete
  using (auth.uid() = user_id);
