"use client";

import Link from "next/link";
import { memo, useMemo, useState, useSyncExternalStore } from "react";
import useSWR from "swr";
import { KEYS, readStorage } from "@/lib/storage";
import { buildSlots, rowsFor } from "@/lib/tree-layout";
import type { Wish } from "@/lib/wish";
import { WishDialog } from "./WishDialog";
import styles from "./Tree.module.css";

const REFRESH_MS = 4000;
const noopSubscribe = () => () => {};

async function fetchWishes(url: string): Promise<Wish[]> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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
        <Star />
        <div className={styles.tree} style={{ "--rows": rows } as React.CSSProperties}>

          <ul className={styles.slots}>
            {slots.map((slot, i) => {
              const wish = wishes[i];
              const style = { left: `${slot.x}%`, top: `${slot.y}%` } as React.CSSProperties;
              return wish ? (
                <li key={wish.id} className={styles.slot} style={style}>
                  <Ornament
                    wish={wish}
                    mine={wish.id === myId}
                    delayMs={initialIds.has(wish.id) ? Math.min(i * 40, 1600) : 0}
                    onOpen={setSelected}
                  />
                </li>
              ) : (
                <li
                  key={`light-${i}`}
                  className={styles.slot}
                  style={{ ...style, "--twinkle": `${((i * 37) % 23) / 10}s` } as React.CSSProperties}
                  aria-hidden
                >
                  <span className={styles.light} />
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
      <span className="visually-hidden">
        {mine ? "Tu mensaje" : `Mensaje de ${wish.name}`}
      </span>
    </button>
  );
});

function Star() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 1.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 8.7l7.1-.6z" />
    </svg>
  );
}
