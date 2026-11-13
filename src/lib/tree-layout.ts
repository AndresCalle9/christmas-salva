// Geometry and decoration for the tree. Everything here is deterministic (seeded by wish ids and
// the current 45 s "epoch"), so every phone and screen renders the exact same tree.

export const MIN_ROWS = 7;
const SPARE_SLOTS = 3; // always leave a few decorated spots inviting the next person
export const DECOR_EPOCH_MS = 45_000;

export type Slot = { x: number; y: number };

export function rowsFor(count: number): number {
  const needed = count + SPARE_SLOTS;
  let rows = MIN_ROWS;
  while ((rows * (rows + 1)) / 2 < needed) rows++;
  return rows;
}

/** Row k holds k + 1 slots; positions are percentages of a square box. */
export function buildSlots(rows: number): Slot[] {
  const cell = 100 / rows;
  const slots: Slot[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
      slots.push({ x: 50 + (col - row / 2) * cell, y: (row + 0.5) * cell });
    }
  }
  return slots;
}

// ── Seeded randomness ─────────────────────────────────────────

/** FNV-1a 32-bit string hash. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic float in [0, 1) for a given key. */
function random(key: string): number {
  // One round of mulberry32 over the hash to spread nearby keys apart.
  let t = (hash(key) + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ── Placement ─────────────────────────────────────────────────

/**
 * Scatters wishes across the tree instead of filling it top-down. Each wish (in arrival order)
 * takes the slot its id hashes to, or the next free one. Positions stay put as people arrive and
 * only reshuffle when the tree grows a row.
 */
export function placeWishes<T extends { id: string }>(wishes: readonly T[], slotCount: number) {
  const bySlot = new Map<number, { wish: T; order: number }>();
  wishes.forEach((wish, order) => {
    let slot = hash(wish.id) % slotCount;
    while (bySlot.has(slot)) slot = (slot + 1) % slotCount;
    bySlot.set(slot, { wish, order });
  });
  return bySlot;
}

// ── Decorations for empty slots ───────────────────────────────

export type DecorColor = "pink" | "red" | "green" | "gold";
export type Decor = { kind: "light" | "star" | "bauble"; color: DecorColor };

const LIGHT_COLORS: DecorColor[] = ["pink", "pink", "red", "green", "gold"];
const BIG_COLORS: DecorColor[] = ["pink", "red", "green"];

/**
 * The emptier the tree, the more "big" decorations (stars, baubles) so it never looks bare;
 * as it fills up, empty spots go back to small lights.
 */
export function decorFor(slot: number, epoch: number, emptyRatio: number): Decor {
  const key = `${epoch}:${slot}`;
  const bigChance = 0.12 + 0.48 * emptyRatio;
  const pick = <V,>(list: V[], salt: string) => list[Math.floor(random(key + salt) * list.length)];

  if (random(key) < bigChance) {
    return random(key + "k") < 0.55
      ? { kind: "star", color: "gold" }
      : { kind: "bauble", color: pick(BIG_COLORS, "c") };
  }
  return { kind: "light", color: pick(LIGHT_COLORS, "c") };
}

export function epochSince(startIso: string | undefined, now: number): number {
  if (!startIso) return 0;
  return Math.max(0, Math.floor((now - Date.parse(startIso)) / DECOR_EPOCH_MS));
}

/** Stable per-slot twinkle offset so lights don't blink in unison. */
export function twinkleDelay(slot: number): string {
  return `${(random(`t${slot}`) * 2.6).toFixed(2)}s`;
}
