-- Page visits for lightweight analytics
-- No IPs or location data stored

create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  visited_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null,
  referrer text,
  session_id text
);

alter table public.page_visits enable row level security;

create policy "Anyone can insert page_visits"
  on public.page_visits for insert
  with check (true);

create policy "Admins can read page_visits"
  on public.page_visits for select
  using (auth.uid() in (select id from public.users where is_admin = true));

create index if not exists idx_page_visits_visited_at on public.page_visits(visited_at);
create index if not exists idx_page_visits_path on public.page_visits(path);
create index if not exists idx_page_visits_session_id on public.page_visits(session_id);

-- Admin flag on users table
alter table public.users
  add column if not exists is_admin boolean not null default false;
