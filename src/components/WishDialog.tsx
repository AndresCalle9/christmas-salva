"use client";

import { useEffect, useRef } from "react";
import type { Wish } from "@/lib/wish";
import styles from "./WishDialog.module.css";

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function WishDialog({ wish, onClose }: { wish: Wish | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (wish && !dialog.open) dialog.showModal();
    if (!wish && dialog.open) dialog.close();
  }, [wish]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="wish-name"
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {wish ? (
        <article className={styles.card}>
          {/* eslint-disable-next-line @next/next/no-img-element -- already resized on upload */}
          <img className={styles.photo} src={wish.photoUrl} alt={`Selfie de ${wish.name}`} />
          <div className={styles.text}>
            <h2 id="wish-name" className={styles.name}>
              {wish.name}
            </h2>
            <p className={styles.message}>{wish.message}</p>
            <time className={styles.time} dateTime={wish.createdAt}>
              {dateFormat.format(new Date(wish.createdAt))}
            </time>
          </div>
          <button type="button" className={styles.close} onClick={onClose}>
            Cerrar
          </button>
        </article>
      ) : null}
    </dialog>
  );
}
