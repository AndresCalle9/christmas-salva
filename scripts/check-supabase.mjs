// Verifies the Supabase project is ready: bucket exists (creates it if missing) and table is reachable.
// Usage: npm run check:supabase
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data: bucket } = await supabase.storage.getBucket("selfies");
if (bucket) {
  console.log("✓ bucket 'selfies' exists (public:", bucket.public + ")");
} else {
  const { error } = await supabase.storage.createBucket("selfies", {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/webp", "image/png"],
  });
  console.log(error ? `✗ bucket: ${error.message}` : "✓ bucket 'selfies' created");
}

// A HEAD request swallows the 404 body, so select a real row to surface "table missing".
const { error, count } = await supabase.from("wishes").select("id", { count: "exact" }).limit(1);
if (error) {
  console.log(`✗ table 'wishes': ${error.message}\n  → run supabase/schema.sql in the Supabase SQL Editor`);
  process.exitCode = 1;
} else {
  console.log(`✓ table 'wishes' reachable (${count} rows)`);
}

const broadcasts = await supabase.from("broadcasts").select("id").limit(1);
if (broadcasts.error) {
  console.log(`✗ table 'broadcasts': ${broadcasts.error.message}\n  → run supabase/002_broadcasts.sql in the Supabase SQL Editor`);
  process.exitCode = 1;
} else {
  console.log("✓ table 'broadcasts' reachable");
}

