create table if not exists public.market_price_history (
  id          uuid        primary key default gen_random_uuid(),
  market_id   uuid        not null references public.markets(id) on delete cascade,
  yes_prob    numeric     not null check (yes_prob >= 0 and yes_prob <= 100),
  recorded_at timestamptz not null default now()
);

create index if not exists price_history_market_id_idx on public.market_price_history(market_id, recorded_at);

alter table public.market_price_history enable row level security;

create policy "Price history viewable by all authenticated users"
  on public.market_price_history for select to authenticated using (true);

do $$
declare
  m record;
  current_prob numeric;
  start_prob   numeric;
  prob_step    numeric;
  i            integer;
  jitter       numeric;
  point_prob   numeric;
  point_time   timestamptz;
begin
  for m in select id, yes_pool, no_pool from public.markets loop
    if (m.yes_pool + m.no_pool) = 0 then
      current_prob := 50;
    else
      current_prob := round((m.yes_pool::numeric / (m.yes_pool + m.no_pool)) * 100);
    end if;

    start_prob := 50;
    prob_step  := (current_prob - start_prob) / 28.0;

    for i in 0..28 loop
      jitter     := (random() * 6) - 3;
      point_prob := greatest(2, least(98, start_prob + (prob_step * i) + jitter));
      point_time := now() - interval '7 days' + (interval '6 hours' * i);

      insert into public.market_price_history (market_id, yes_prob, recorded_at)
      values (m.id, round(point_prob), point_time);
    end loop;
  end loop;
end $$;
