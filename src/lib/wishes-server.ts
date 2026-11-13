import "server-only";
import { LIMITS, PHOTO_TYPES, type Wish } from "./wish";
import { SELFIE_BUCKET, supabaseAdmin } from "./supabase-server";

type WishRow = {
  id: string;
  name: string;
  message: string;
  photo_url: string;
  created_at: string;
};

const COLUMNS = "id, name, message, photo_url, created_at";
const MAX_WISHES = 500;

function toWish(row: WishRow): Wish {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    photoUrl: row.photo_url,
    createdAt: row.created_at,
  };
}

export async function getWishes(): Promise<Wish[]> {
  const { data, error } = await supabaseAdmin()
    .from("wishes")
    .select(COLUMNS)
    .order("created_at", { ascending: true })
    .limit(MAX_WISHES);

  if (error) throw new Error(`Could not load wishes: ${error.message}`);
  return (data as WishRow[]).map(toWish);
}

export class ValidationError extends Error {}

export type NewWish = { name: string; message: string; photo: File };

export function parseNewWish(form: FormData): NewWish {
  const name = String(form.get("name") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  const photo = form.get("photo");

  if (!name || name.length > LIMITS.name) {
    throw new ValidationError(`Escribe tu nombre (máximo ${LIMITS.name} caracteres).`);
  }
  if (!message || message.length > LIMITS.message) {
    throw new ValidationError(`Escribe un mensaje (máximo ${LIMITS.message} caracteres).`);
  }
  if (!(photo instanceof File) || photo.size === 0) {
    throw new ValidationError("Falta la foto.");
  }
  if (!(PHOTO_TYPES as readonly string[]).includes(photo.type)) {
    throw new ValidationError("La foto debe ser JPG, PNG o WebP.");
  }
  if (photo.size > LIMITS.photoBytes) {
    throw new ValidationError("La foto pesa demasiado. Prueba con otra.");
  }
  return { name, message, photo };
}

export async function createWish({ name, message, photo }: NewWish): Promise<Wish> {
  const supabase = supabaseAdmin();
  const ext = photo.type.split("/")[1] ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const upload = await supabase.storage.from(SELFIE_BUCKET).upload(path, photo, {
    contentType: photo.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (upload.error) throw new Error(`Upload failed: ${upload.error.message}`);

  const photoUrl = supabase.storage.from(SELFIE_BUCKET).getPublicUrl(path).data.publicUrl;

  const { data, error } = await supabase
    .from("wishes")
    .insert({ name, message, photo_url: photoUrl })
    .select(COLUMNS)
    .single();

  if (error) {
    // Don't leave orphaned photos behind if the row couldn't be saved.
    await supabase.storage.from(SELFIE_BUCKET).remove([path]);
    throw new Error(`Insert failed: ${error.message}`);
  }
  return toWish(data as WishRow);
}
