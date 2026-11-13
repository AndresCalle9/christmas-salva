// Deletes every file in the 'selfies' bucket. Pair with supabase/reset.sql.
// Usage: npm run reset:photos
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env");
  process.exit(1);
}

const bucket = createClient(url, key, { auth: { persistSession: false } }).storage.from("selfies");
let removed = 0;

for (;;) {
  const { data, error } = await bucket.list("", { limit: 1000 });
  if (error) throw new Error(error.message);
  const names = data.filter((f) => f.id).map((f) => f.name);
  if (names.length === 0) break;
  const { error: rmError } = await bucket.remove(names);
  if (rmError) throw new Error(rmError.message);
  removed += names.length;
}

console.log(`✓ removed ${removed} photo(s) from 'selfies'`);
