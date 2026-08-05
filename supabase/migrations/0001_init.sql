-- BELLÉLUXE initial schema: catalog, orders, site content, RLS, storage.
create extension if not exists pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);
create index products_category_id_idx on public.products(category_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_ngn numeric(12,2) not null check (price_ngn >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  sku text,
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_variants_product_id_idx on public.product_variants(product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  is_primary boolean not null default false
);
create index product_images_product_id_idx on public.product_images(product_id);

create table public.currency_rates (
  code text primary key,
  rate_to_ngn numeric(14,6) not null check (rate_to_ngn > 0),
  is_active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

create sequence public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text not null,
  delivery_city text,
  delivery_state text,
  notes text,
  subtotal_ngn numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','fulfilled','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  payment_reference text,
  currency_display text,
  fx_rate_snapshot numeric(14,6),
  order_access_token uuid not null default gen_random_uuid(),
  whatsapp_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_user_id_idx on public.orders(customer_user_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_name_snapshot text,
  unit_price_ngn numeric(12,2) not null,
  quantity int not null check (quantity > 0),
  line_total_ngn numeric(12,2) not null
);
create index order_items_order_id_idx on public.order_items(order_id);

create table public.site_content_blocks (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text,
  is_visible boolean not null default true,
  content jsonb not null default '{}',
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt_text text,
  category text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now(),
  is_active boolean not null default true,
  unsubscribed_at timestamptz
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('order_confirmation','contact_notify','newsletter_broadcast')),
  recipient text not null,
  subject text,
  brevo_message_id text,
  status text,
  related_order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helper functions
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Order creation RPC: server re-reads live prices/stock, never trusts client-submitted amounts.
create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_item jsonb;
  v_variant record;
  v_line_total numeric(12,2);
  v_result jsonb;
begin
  if payload->'items' is null or jsonb_array_length(payload->'items') = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  v_order_number := 'BL-' || to_char(now(), 'YYYYMMDD') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 5, '0');

  insert into public.orders (
    order_number, customer_user_id, customer_name, customer_phone, customer_email,
    delivery_address, delivery_city, delivery_state, notes,
    currency_display, fx_rate_snapshot
  ) values (
    v_order_number, auth.uid(),
    payload->>'customer_name', payload->>'customer_phone', payload->>'customer_email',
    payload->>'delivery_address', payload->>'delivery_city', payload->>'delivery_state', payload->>'notes',
    payload->>'currency_display', nullif(payload->>'fx_rate_snapshot','')::numeric
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(payload->'items')
  loop
    select id, product_id, name, price_ngn, stock_quantity
      into v_variant
      from public.product_variants
      where id = (v_item->>'variant_id')::uuid
      for update;

    if not found then
      raise exception 'Variant % not found', v_item->>'variant_id';
    end if;

    if v_variant.stock_quantity < (v_item->>'quantity')::int then
      raise exception 'Insufficient stock for %', v_variant.name;
    end if;

    v_line_total := v_variant.price_ngn * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_line_total;

    insert into public.order_items (
      order_id, product_id, variant_id, product_name_snapshot, variant_name_snapshot,
      unit_price_ngn, quantity, line_total_ngn
    ) values (
      v_order_id, v_variant.product_id, v_variant.id,
      (select name from public.products where id = v_variant.product_id),
      v_variant.name, v_variant.price_ngn, (v_item->>'quantity')::int, v_line_total
    );

    update public.product_variants
      set stock_quantity = stock_quantity - (v_item->>'quantity')::int
      where id = v_variant.id;
  end loop;

  update public.orders set subtotal_ngn = v_subtotal where id = v_order_id;

  select jsonb_build_object(
    'order', to_jsonb(o.*),
    'items', (select jsonb_agg(to_jsonb(oi.*)) from public.order_items oi where oi.order_id = v_order_id)
  ) into v_result
  from public.orders o where o.id = v_order_id;

  return v_result;
end;
$$;

grant execute on function public.create_order(jsonb) to anon, authenticated;

-- ============================================================
-- Grants (broad table-level grants; RLS below is the real gate)
-- ============================================================

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.currency_rates enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.site_content_blocks enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.email_log enable row level security;

-- profiles: user sees/updates own row; admin sees/updates all
create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or public.is_admin());
create policy "profiles_update" on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());
create policy "profiles_admin_delete" on public.profiles for delete
  using (public.is_admin());

-- simple public-read / admin-write tables
create policy "categories_public_select" on public.categories for select using (true);
create policy "categories_admin_all" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "currency_rates_public_select" on public.currency_rates for select using (is_active = true or public.is_admin());
create policy "currency_rates_admin_all" on public.currency_rates for all using (public.is_admin()) with check (public.is_admin());

create policy "content_blocks_public_select" on public.site_content_blocks for select using (true);
create policy "content_blocks_admin_all" on public.site_content_blocks for all using (public.is_admin()) with check (public.is_admin());

create policy "site_settings_public_select" on public.site_settings for select using (true);
create policy "site_settings_admin_all" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "media_assets_public_select" on public.media_assets for select using (true);
create policy "media_assets_admin_all" on public.media_assets for all using (public.is_admin()) with check (public.is_admin());

-- products: public sees only visible; admin sees/edits all
create policy "products_public_select" on public.products for select using (is_visible = true or public.is_admin());
create policy "products_admin_all" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "variants_public_select" on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.is_visible = true or public.is_admin()))
);
create policy "variants_admin_all" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

create policy "images_public_select" on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.is_visible = true or public.is_admin()))
);
create policy "images_admin_all" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- orders/order_items: no direct public grants — all writes go through create_order() (security definer)
create policy "orders_select_own" on public.orders for select
  using (customer_user_id = auth.uid() or public.is_admin());
create policy "orders_admin_all" on public.orders for all using (public.is_admin()) with check (public.is_admin());

create policy "order_items_select_own" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.customer_user_id = auth.uid() or public.is_admin()))
);
create policy "order_items_admin_all" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- newsletter/contact: public insert-only (no select — privacy), admin full access
create policy "newsletter_insert" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter_admin_all" on public.newsletter_subscribers for all using (public.is_admin()) with check (public.is_admin());

create policy "contact_insert" on public.contact_messages for insert with check (true);
create policy "contact_admin_all" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());

-- email_log: admin only
create policy "email_log_admin_all" on public.email_log for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage buckets
-- ============================================================

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('site-media', 'site-media', true)
  on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product_images_admin_write" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

create policy "site_media_public_read" on storage.objects for select
  using (bucket_id = 'site-media');
create policy "site_media_admin_write" on storage.objects for insert
  with check (bucket_id = 'site-media' and public.is_admin());
create policy "site_media_admin_update" on storage.objects for update
  using (bucket_id = 'site-media' and public.is_admin());
create policy "site_media_admin_delete" on storage.objects for delete
  using (bucket_id = 'site-media' and public.is_admin());

-- ============================================================
-- Seed data
-- ============================================================

insert into public.currency_rates (code, rate_to_ngn, is_active) values
  ('NGN', 1, true),
  ('USD', 1650, true),
  ('GBP', 2100, true);

insert into public.site_settings (key, value) values
  ('social_links', '{"instagram":"@getpretty_w_gift_raphael","tiktok":"@getpretty_w_gift_raphael","whatsapp_number":"2348141620382","contact_email":"gift001raphael@gmail.com"}'),
  ('site_meta', '{"tagline":"Beauty, Attitude, Luxe"}');

insert into public.site_content_blocks (key, label, is_visible, sort_order) values
  ('hero', 'Homepage hero', true, 0),
  ('about_section', 'About BELLÉLUXE', true, 1),
  ('promo_banner', 'Promo banner', false, 2);

insert into public.categories (name, slug, sort_order) values
  ('Bundles', 'bundles', 0),
  ('Braided Ponytails', 'braided-ponytails', 1);

do $$
declare
  v_bundles uuid;
  v_ponytails uuid;
  v_product uuid;
begin
  select id into v_bundles from public.categories where slug = 'bundles';
  select id into v_ponytails from public.categories where slug = 'braided-ponytails';

  insert into public.products (name, slug, description, category_id, tags)
    values ('Luna Bone Straight', 'luna-bone-straight', 'Silky bone-straight bundles.', v_bundles, array['straight'])
    returning id into v_product;
  insert into public.product_variants (product_id, name, price_ngn, stock_quantity, is_default) values
    (v_product, '30"', 8000, 25, true);

  insert into public.products (name, slug, description, category_id, tags)
    values ('Daisy French Curls', 'daisy-french-curls', 'Bouncy French curl bundles.', v_bundles, array['curly'])
    returning id into v_product;
  insert into public.product_variants (product_id, name, price_ngn, stock_quantity, is_default) values
    (v_product, '24"', 7500, 20, true),
    (v_product, '12"', 6500, 20, false);

  insert into public.products (name, slug, description, category_id, tags)
    values ('Zoey Body Waves', 'zoey-body-waves', 'Soft, voluminous body waves.', v_bundles, array['wavy'])
    returning id into v_product;
  insert into public.product_variants (product_id, name, price_ngn, stock_quantity, is_default) values
    (v_product, '22"', 8000, 20, true);

  insert into public.products (name, slug, description, category_id, tags)
    values ('Rosy Deep Wave', 'rosy-deep-wave', 'Rich, defined deep waves.', v_bundles, array['wavy'])
    returning id into v_product;
  insert into public.product_variants (product_id, name, price_ngn, stock_quantity, is_default) values
    (v_product, '24"', 8000, 20, true);

  insert into public.products (name, slug, description, category_id, tags)
    values ('Braided Ponytail', 'braided-ponytail', 'Ready-to-wear braided ponytail.', v_ponytails, array['braided'])
    returning id into v_product;
  insert into public.product_variants (product_id, name, price_ngn, stock_quantity, is_default) values
    (v_product, 'Straight', 20000, 10, true),
    (v_product, 'Boho', 25000, 10, false);
end $$;
