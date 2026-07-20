-- Run this in Supabase SQL Editor after the main schema.
-- Atomic credit increment used by the webhook handler.
create or replace function public.increment_credit(
  p_user_id uuid,
  p_product text,
  p_amount int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.credits (user_id, product, remaining_count)
  values (p_user_id, p_product, p_amount)
  on conflict (user_id, product)
  do update set remaining_count = public.credits.remaining_count + p_amount, updated_at = now();
end;
$$;
