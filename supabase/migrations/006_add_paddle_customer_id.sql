alter table public.subscriptions
add column if not exists paddle_customer_id text;
