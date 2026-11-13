import "server-only";
import { supabaseAdmin } from "./supabase-server";

export type Broadcast = { id: number; createdAt: string };

export async function getLatestBroadcast(): Promise<Broadcast | null> {
  const { data, error } = await supabaseAdmin()
    .from("broadcasts")
    .select("id, created_at")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Could not load broadcast: ${error.message}`);
  return data ? { id: data.id, createdAt: data.created_at } : null;
}

export async function createBroadcast(): Promise<Broadcast> {
  const { data, error } = await supabaseAdmin()
    .from("broadcasts")
    .insert({})
    .select("id, created_at")
    .single();

  if (error) throw new Error(`Could not create broadcast: ${error.message}`);
  return { id: data.id, createdAt: data.created_at };
}

