"use client";

import { useState } from "react";
import styles from "./BroadcastControl.module.css";

const timeFormat = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; at: string } | { kind: "error"; text: string };

export function BroadcastControl() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function send() {
    if (status.kind === "sending") return;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/broadcast", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo enviar.");
      setStatus({ kind: "sent", at: timeFormat.format(new Date(data.createdAt)) });
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "No se pudo enviar." });
    }
  }

  return (
    <div className={styles.form}>
      <button type="button" className={styles.send} onClick={send} disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Enviando…" : "Enviar mensajes a todos"}
      </button>

      <p className={styles.status} role="status" data-kind={status.kind}>
        {status.kind === "sent"
          ? `Enviado a las ${status.at}. Puedes volver a enviarlo cuando quieras.`
          : status.kind === "error"
            ? status.text
            : " "}
      </p>
    </div>
  );
}
