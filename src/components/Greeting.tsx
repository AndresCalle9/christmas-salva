"use client";

import { useEffect, useRef, useState } from "react";
import { GREETINGS, GREETING_SIGNATURE } from "@/lib/greetings";
import { KEYS, readStorage, writeStorage } from "@/lib/storage";
import styles from "./Greeting.module.css";

const DELAY_MS = 30_000;
const SHOWN = "shown";

/**
 * Thirty seconds after someone first opens the site (counted across pages within the tab),
 * a note from Andrés, Lizz and the Madrid office slides in. Each tab picks one message at random.
 */
export function Greeting() {
  const [message, setMessage] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (readStorage("session", KEYS.greeting) === SHOWN) return;

    const now = Date.now();
    const openedAt = Number(readStorage("session", KEYS.openedAt)) || now;
    writeStorage("session", KEYS.openedAt, String(openedAt));

    const wait = Math.max(0, DELAY_MS - (now - openedAt));
    const timer = window.setTimeout(() => {
      setMessage(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
      writeStorage("session", KEYS.greeting, SHOWN);
    }, wait);
    return () => window.clearTimeout(timer);
  }, []);

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
