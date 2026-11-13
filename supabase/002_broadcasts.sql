-- Run once in Supabase → SQL Editor (after schema.sql).
-- Each row is one press of the "send messages" button on the hidden control page.

create table if not exists public.broadcasts (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now()
);

alter table public.broadcasts enable row level security;
