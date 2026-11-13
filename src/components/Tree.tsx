"use client";

import Link from "next/link";
import { memo, useCallback, useMemo, useState, useSyncExternalStore } from "react";
import useSWR from "swr";
import { KEYS, readStorage } from "@/lib/storage";
import {
  buildSlots,
  decorFor,
  epochSince,
  placeWishes,
  rowsFor,
  twinkleDelay,
  type Decor,
} from "@/lib/tree-layout";
import type { Wish } from "@/lib/wish";
import { WishDialog } from "./WishDialog";
import styles from "./Tree.module.css";

const REFRESH_MS = 4000;
const noopSubscribe = () => () => {};
const tickEverySecond = (onTick: () => void) => {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
};

async function fetchWishes(url: string): Promise<Wish[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** Decoration epoch: advances every 45 s, counted from the first photo, the same on every device. */
function useDecorEpoch(firstPhotoAt: string | undefined): number {
  const getSnapshot = useCallback(() => epochSince(firstPhotoAt, Date.now()), [firstPhotoAt]);
  return useSyncExternalStore(tickEverySecond, getSnapshot, () => 0);
}

export function Tree({ initial }: { initial: Wish[] }) {
  const { data: wishes = initial } = useSWR("/api/wishes", fetchWishes, {
    fallbackData: initial,
    refreshInterval: REFRESH_MS,
    revalidateOnMount: true,
  });

  // Wishes present on first paint get a staggered entrance; later arrivals pop in on their own.
  const [initialIds] = useState(() => new Set(initial.map((w) => w.id)));
  const [selected, setSelected] = useState<Wish | null>(null);

  const myId = useSyncExternalStore(
    noopSubscribe,
    () => readStorage("local", KEYS.myWishId),
    () => null,
  );

  const rows = rowsFor(wishes.length);
  const slots = useMemo(() => buildSlots(rows), [rows]);
  const placed = useMemo(() => placeWishes(wishes, slots.length), [wishes, slots.length]);
  const epoch = useDecorEpoch(wishes[0]?.createdAt);
  const emptyRatio = (slots.length - wishes.length) / slots.length;
  const hasMine = myId !== null && wishes.some((w) => w.id === myId);

  return (
    <>
      <p className={styles.count} aria-live="polite">
        {wishes.length === 0
          ? "El árbol espera su primera cara."
          : wishes.length === 1
            ? "1 cara en el árbol. Toca una para leer su mensaje."
            : `${wishes.length} caras en el árbol. Toca una para leer su mensaje.`}
      </p>

      <div className={styles.stage}>
        <TopStar />
        <div className={styles.tree} style={{ "--rows": rows } as React.CSSProperties}>
          <ul className={styles.slots}>
            {slots.map((slot, i) => {
              const style = { left: `${slot.x}%`, top: `${slot.y}%` } as React.CSSProperties;
              const entry = placed.get(i);
              if (entry) {
                const { wish, order } = entry;
                return (
                  <li key={wish.id} className={styles.slot} style={style}>
                    <Ornament
                      wish={wish}
                      mine={wish.id === myId}
                      delayMs={initialIds.has(wish.id) ? Math.min(order * 60, 1600) : 0}
                      onOpen={setSelected}
                    />
                  </li>
                );
              }
              return (
                <li key={`slot-${i}`} className={styles.slot} style={style} aria-hidden>
                  <Decoration
                    key={epoch}
                    decor={decorFor(i, epoch, emptyRatio)}
                    twinkle={twinkleDelay(i)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
        <span className={styles.trunk} aria-hidden />
      </div>

      {hasMine ? null : (
        <Link href="/" className={styles.cta}>
          Cuelga tu foto
        </Link>
      )}

      <WishDialog wish={selected} onClose={() => setSelected(null)} />
    </>
  );
}

const Ornament = memo(function Ornament({
  wish,
  mine,
  delayMs,
  onOpen,
}: {
  wish: Wish;
  mine: boolean;
  delayMs: number;
  onOpen: (wish: Wish) => void;
}) {
  return (
    <button
      type="button"
      className={styles.ornament}
      data-mine={mine}
      style={{ animationDelay: `${delayMs}ms` }}
      onClick={() => onOpen(wish)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- already resized to 720px on upload */}
      <img src={wish.photoUrl} alt="" loading="lazy" decoding="async" />
      <span className="visually-hidden">{mine ? "Tu mensaje" : `Mensaje de ${wish.name}`}</span>
    </button>
  );
});

const STAR_PATH = "M12 1.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 8.7l7.1-.6z";

function Decoration({ decor, twinkle }: { decor: Decor; twinkle: string }) {
  const style = { "--twinkle": twinkle } as React.CSSProperties;
  if (decor.kind === "star") {
    return (
      <svg className={styles.decorStar} data-color={decor.color} viewBox="0 0 24 24" style={style}>
        <path d={STAR_PATH} />
      </svg>
    );
  }
  return (
    <span
      className={decor.kind === "bauble" ? styles.decorBauble : styles.decorLight}
      data-color={decor.color}
      style={style}
    />
  );
}

function TopStar() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden>
      <path d={STAR_PATH} />
    </svg>
  );
}
