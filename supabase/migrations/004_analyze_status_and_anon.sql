-- Add status column to analyses for success/error tracking
alter table public.analyses
  add column if not exists status text not null default 'success' check (status in ('success', 'error'));

-- Make user_id nullable so anonymous analysis requests can be logged
alter table public.analyses
  alter column user_id drop not null;

-- Add index on product for admin product-scoped queries
create index if not exists idx_analyses_product on public.analyses(product);

-- Add index on user_id for admin per-user queries
create index if not exists idx_page_visits_user_id on public.page_visits(user_id);

-- Update RLS policy for analyses to allow insert with nullable user_id
-- Drop the old insert policy and recreate to allow anonymous inserts
drop policy if exists "Users can insert own analyses" on public.analyses;

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id or user_id is null);
