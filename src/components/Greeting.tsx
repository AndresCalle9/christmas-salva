"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { GREETINGS, GREETING_SIGNATURE } from "@/lib/greetings";
import { KEYS, readStorage, writeStorage } from "@/lib/storage";
import styles from "./Greeting.module.css";

type Broadcast = { id: number; createdAt: string } | null;

const POLL_MS = 5000;
// People who open the site a little after the button was pressed still get the note.
const FRESH_FOR_MS = 15 * 60_000;

async function fetchBroadcast(url: string): Promise<Broadcast> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * When the button on the hidden control page is pressed, every open page picks up the new
 * broadcast on its next poll and shows a note from Andrés and Liz in Madrid —
 * each device picks one of the messages at random.
 */
export function Greeting() {
  const [message, setMessage] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useSWR("/api/broadcast", fetchBroadcast, {
    refreshInterval: POLL_MS,
    onSuccess: (broadcast) => {
      if (!broadcast) return;
      const id = String(broadcast.id);
      if (readStorage("local", KEYS.seenBroadcast) === id) return;
      writeStorage("local", KEYS.seenBroadcast, id);
      if (Date.now() - Date.parse(broadcast.createdAt) > FRESH_FOR_MS) return;
      setMessage(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    },
  });

  useEffect(() => {
    if (!message) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMessage(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message]);

  if (!message) return null;

  return (
    <div className={styles.backdrop} onClick={() => setMessage(null)}>
      <section
        className={styles.note}
        role="dialog"
        aria-modal="true"
        aria-labelledby="greeting-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.eyebrow} id="greeting-title">
          <span className={styles.dot} aria-hidden /> Un mensaje para ti
        </p>
        <p className={styles.body}>{message}</p>
        <p className={styles.signature}>— {GREETING_SIGNATURE}</p>
        <button ref={closeRef} className={styles.close} onClick={() => setMessage(null)}>
          Gracias
        </button>
      </section>
    </div>
  );
}
