-- Run once in Supabase → SQL Editor.
-- The app only talks to Supabase from the server with the secret key,
-- so RLS stays enabled with no public policies: the table is closed to anon clients.

create table if not exists public.wishes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 40),
  message     text not null check (char_length(message) between 1 and 280),
  photo_url   text not null,
  created_at  timestamptz not null default now()
);

create index if not exists wishes_created_at_idx on public.wishes (created_at);

alter table public.wishes enable row level security;

-- Public bucket for the selfies (read-only for the world, writes go through the server).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('selfies', 'selfies', true, 2097152, array['image/jpeg', 'image/webp', 'image/png'])
on conflict (id) do nothing;
