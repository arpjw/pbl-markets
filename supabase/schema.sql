-- PBL Markets — Database Schema
-- Run this in your Supabase SQL editor (Project → SQL Editor → New query)

-- ─── Profiles ───────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid        references auth.users(id) on delete cascade primary key,
  email         text        unique not null,
  full_name     text        not null,
  role          text        default null,
  points_balance integer    not null default 1000,
  is_admin      boolean     not null default false,
  created_at    timestamptz not null default now()
);

-- ─── Markets ────────────────────────────────────────────────────────────────
create table public.markets (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text        default null,
  category    text        not null check (category in ('competition','events','growth','operations')),
  yes_pool    integer     not null default 200,
  no_pool     integer     not null default 200,
  closes_at   timestamptz not null,
  resolved    boolean     not null default false,
  outcome     text        default null check (outcome in ('yes','no')),
  created_by  uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ─── Positions ──────────────────────────────────────────────────────────────
create table public.positions (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles(id) on delete cascade,
  market_id  uuid        not null references public.markets(id) on delete cascade,
  side       text        not null check (side in ('yes','no')),
  amount     integer     not null check (amount > 0),
  created_at timestamptz not null default now()
);

-- ─── Transactions ────────────────────────────────────────────────────────────
create table public.transactions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  amount      integer     not null,
  type        text        not null check (type in ('bet','payout','adjustment')),
  description text        default null,
  created_at  timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index positions_user_id_idx  on public.positions(user_id);
create index positions_market_id_idx on public.positions(market_id);
create index transactions_user_id_idx on public.transactions(user_id);
create index markets_resolved_idx on public.markets(resolved);

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.markets      enable row level security;
alter table public.positions    enable row level security;
alter table public.transactions enable row level security;

-- Profiles
create policy "Profiles viewable by all authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- Markets
create policy "Markets viewable by all authenticated users"
  on public.markets for select to authenticated using (true);

create policy "Admins can insert markets"
  on public.markets for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

create policy "Admins can update markets"
  on public.markets for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Positions
create policy "Positions viewable by all authenticated users"
  on public.positions for select to authenticated using (true);

create policy "Users can insert own positions"
  on public.positions for insert to authenticated
  with check (auth.uid() = user_id);

-- Transactions
create policy "Users can view own transactions"
  on public.transactions for select to authenticated using (auth.uid() = user_id);

create policy "Service role can insert transactions"
  on public.transactions for insert to authenticated
  with check (auth.uid() = user_id);

-- ─── Auto-create profile on signup ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Realtime ────────────────────────────────────────────────────────────────
-- Enable realtime for live probability updates on the market detail page.
-- Run this separately in the Supabase dashboard:
-- Replication → Tables → enable for "markets" and "profiles"
