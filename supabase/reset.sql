-- Resets the tree: removes every wish and every broadcast.
-- Run in Supabase → SQL Editor whenever you want to start over.
--
-- Photos: Supabase doesn't allow deleting Storage files from SQL. Either empty the
-- 'selfies' bucket from the dashboard (Storage → selfies → select all → Delete),
-- or run `npm run reset:photos` locally.

truncate table public.wishes, public.broadcasts restart identity;
