alter table public.subscriptions
add column if not exists paddle_subscription_id text;
