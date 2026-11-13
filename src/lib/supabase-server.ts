import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The secret key bypasses RLS, so this module must never reach the browser ("server-only" enforces it).
let client: SupabaseClient | undefined;

export function supabaseAdmin(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables");
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export const SELFIE_BUCKET = "selfies";
