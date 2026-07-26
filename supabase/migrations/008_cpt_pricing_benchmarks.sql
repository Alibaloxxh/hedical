-- CMS Medicare Physician Fee Schedule benchmarks by CPT code
-- Populated from the "Medicare Physician & Other Practitioners - by Geography and Service" dataset
create table public.cpt_pricing_benchmarks (
  cpt_code text primary key,
  description text,
  avg_medicare_allowed_national numeric not null,
  avg_medicare_allowed_by_state jsonb,
  source text not null default 'CMS Medicare Physician & Other Practitioners',
  year integer not null,
  created_at timestamptz default now()
);

alter table public.cpt_pricing_benchmarks enable row level security;

create policy "Anyone can read pricing benchmarks"
  on public.cpt_pricing_benchmarks for select
  using (true);

create policy "Service role manages pricing benchmarks"
  on public.cpt_pricing_benchmarks for all
  using (true)
  with check (true);
