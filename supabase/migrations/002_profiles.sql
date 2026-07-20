-- Caregiver profiles table
-- Each user can create multiple profiles (e.g., for themselves, a parent, a child, a spouse).
-- This enables the "caregiver" use case where one user manages bills for multiple people.

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text, -- e.g., "self", "parent", "spouse", "child", "other"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profiles"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profiles"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profiles"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can delete own profiles"
  on public.profiles for delete
  using (auth.uid() = user_id);

-- Add profile_id to analyses table
alter table public.analyses
  add column if not exists profile_id uuid references public.profiles(id) on delete set null;

create index if not exists idx_analyses_profile_id on public.analyses(profile_id);
