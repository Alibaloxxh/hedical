-- Hedical Supabase Schema
-- Run this in your Supabase SQL Editor after creating the project.

-- 1. Users table (syncs with Supabase Auth via trigger)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create public.user row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Subscriptions table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'unlimited')) default 'free',
  status text not null check (status in ('active', 'past_due', 'canceled', 'incomplete')) default 'active',
  current_period_end timestamptz,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- 3. Credits table
create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product text not null check (product in ('bill_navigator', 'doc_tool', 'polypharmacy')),
  remaining_count int not null default 0 check (remaining_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product)
);

alter table public.credits enable row level security;

create policy "Users can read own credits"
  on public.credits for select
  using (auth.uid() = user_id);

-- 4. Analyses table (audit / history)
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product text not null check (product in ('bill_navigator', 'doc_tool', 'polypharmacy')),
  input_summary text,
  output_summary text,
  created_at timestamptz not null default now()
);

alter table public.analyses enable row level security;

create policy "Users can read own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- Indexes for common queries
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_credits_user_id on public.credits(user_id);
create index if not exists idx_analyses_user_id on public.analyses(user_id);
create index if not exists idx_analyses_created_at on public.analyses(created_at desc);
