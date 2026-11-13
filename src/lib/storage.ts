// Storage can throw (private mode, blocked site data) — never let that break the experience.

type Area = "local" | "session";

function area(kind: Area): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStorage(kind: Area, key: string): string | null {
  try {
    return area(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(kind: Area, key: string, value: string): void {
  try {
    area(kind)?.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export const KEYS = {
  myWishId: "salva:v1:my-wish-id",
  seenBroadcast: "salva:v1:seen-broadcast",
} as const;
