-- Users table (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.users enable row level security;

create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

-- Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  status text not null default 'inactive',
  current_period_end timestamptz,
  stripe_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, plan)
);
alter table public.subscriptions enable row level security;

create policy "Users can read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Service role manages subscriptions"
  on public.subscriptions for all
  using (true);

-- Credits table
create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  remaining_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, product)
);
alter table public.credits enable row level security;

create policy "Users can read own credits"
  on public.credits for select
  using (auth.uid() = user_id);

-- Analyses log table
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  input_summary text,
  output_summary text,
  created_at timestamptz default now()
);
alter table public.analyses enable row level security;

create policy "Users can read own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- RPC to increment credits (used by Stripe webhook)
create or replace function public.increment_credit(
  p_user_id uuid,
  p_product text,
  p_amount int
) returns void
language plpgsql
security definer
as $$
begin
  insert into public.credits (user_id, product, remaining_count)
  values (p_user_id, p_product, p_amount)
  on conflict (user_id, product)
  do update set remaining_count = credits.remaining_count + p_amount, updated_at = now();
end;
$$;

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
