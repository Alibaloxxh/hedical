-- Create CARC/RARC code type enum
create type carc_rarc_type as enum ('CARC', 'RARC');

-- Reference table for insurance denial codes
create table public.carc_rarc_codes (
  code text primary key,
  code_type carc_rarc_type not null,
  description text not null,
  category text,
  common_appeal_argument text,
  created_at timestamptz default now()
);

alter table public.carc_rarc_codes enable row level security;

-- Public read — this is reference data, no auth needed
create policy "Anyone can read CARC/RARC codes"
  on public.carc_rarc_codes for select
  using (true);

-- Service role upsert (for seed script / admin)
create policy "Service role manages CARC/RARC codes"
  on public.carc_rarc_codes for all
  using (true)
  with check (true);

-- Index on code_type for filtering
create index idx_carc_rarc_codes_code_type on public.carc_rarc_codes(code_type);
