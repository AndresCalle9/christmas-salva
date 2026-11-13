"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { captureVideoFrame, normalizeFile } from "@/lib/image";
import { KEYS, readStorage, writeStorage } from "@/lib/storage";
import { LIMITS, type Wish } from "@/lib/wish";
import styles from "./SelfieFlow.module.css";

type Camera = "idle" | "starting" | "live" | "unavailable";
type Photo = { blob: Blob; url: string };

const noopSubscribe = () => () => {};

export function SelfieFlow() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camera, setCamera] = useState<Camera>("idle");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const alreadyPosted = useSyncExternalStore(
    noopSubscribe,
    () => readStorage("local", KEYS.myWishId) !== null,
    () => false,
  );

  // Release the camera when leaving the page.
  useEffect(() => () => stopStream(streamRef), []);

  // Free the preview blob URL when it's replaced or on unmount.
  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);

  async function startCamera() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamera("unavailable");
      return;
    }
    setCamera("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setCamera("live");
    } catch {
      stopStream(streamRef);
      setCamera("unavailable");
    }
  }

  async function takePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const blob = await captureVideoFrame(video);
    stopStream(streamRef);
    setCamera("idle");
    setPhoto({ blob, url: URL.createObjectURL(blob) });
    router.prefetch("/arbol");
  }

  async function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const blob = await normalizeFile(file);
      stopStream(streamRef);
      setCamera("idle");
      setPhoto({ blob, url: URL.createObjectURL(blob) });
      router.prefetch("/arbol");
    } catch {
      setError("No pudimos leer esa imagen. Prueba con otra foto.");
    }
  }

  function retake() {
    setPhoto(null);
    void startCamera();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!photo || submitting) return;
    setSubmitting(true);
    setError(null);

    const body = new FormData();
    body.set("name", name.trim());
    body.set("message", message.trim());
    body.set("photo", photo.blob, "selfie.jpg");

    try {
      const res = await fetch("/api/wishes", { method: "POST", body });
      const data = (await res.json()) as Wish | { error: string };
      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "No se pudo guardar tu foto.");
      }
      writeStorage("local", KEYS.myWishId, data.id);
      router.push("/arbol");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar tu foto. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  }

  const ready = photo !== null && name.trim() !== "" && message.trim() !== "";
  const showVideo = camera === "live" || camera === "starting";

  return (
    <form className={styles.flow} onSubmit={submit} noValidate>
      {alreadyPosted ? (
        <p className={styles.notice}>
          Ya estás en el árbol. <Link href="/arbol">Ver el árbol</Link>
        </p>
      ) : null}

      <div className={styles.ornament}>
        <span className={styles.string} aria-hidden />
        <span className={styles.cap} aria-hidden />
        <div className={styles.bauble}>
          <video
            ref={videoRef}
            className={styles.video}
            data-visible={showVideo && !photo}
            playsInline
            muted
            aria-label="Vista previa de la cámara"
          />
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img className={styles.preview} src={photo.url} alt="Tu selfie" />
          ) : null}
          {!photo && !showVideo ? (
            <span className={styles.placeholder} aria-hidden>
              Tu cara aquí
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.cameraControls}>
        {photo ? (
          <button type="button" className={styles.textButton} onClick={retake}>
            Repetir foto
          </button>
        ) : camera === "live" ? (
          <button type="button" className={styles.shutter} onClick={takePhoto}>
            <span className="visually-hidden">Tomar foto</span>
          </button>
        ) : camera === "unavailable" ? (
          <>
            <p className={styles.hint}>
              No pudimos abrir la cámara. Toma o elige una foto desde tu teléfono.
            </p>
            <FileButton onChange={pickFile} primary />
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.primary}
              onClick={startCamera}
              disabled={camera === "starting"}
            >
              {camera === "starting" ? "Abriendo cámara…" : "Abrir cámara"}
            </button>
            <FileButton onChange={pickFile} />
          </>
        )}
      </div>

      <fieldset className={styles.fields} disabled={submitting}>
        <label className={styles.field}>
          <span className={styles.label}>Tu nombre</span>
          <input
            name="name"
            autoComplete="given-name"
            maxLength={LIMITS.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como te conoce el equipo"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.labelRow}>
            <span className={styles.label}>Tu mensaje de agradecimiento</span>
            <span className={styles.counter} aria-hidden>
              {message.length}/{LIMITS.message}
            </span>
          </span>
          <textarea
            name="message"
            rows={4}
            maxLength={LIMITS.message}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="¿A quién le das las gracias este año, y por qué?"
            required
          />
        </label>
      </fieldset>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className={styles.submit} disabled={!ready || submitting}>
        {submitting ? "Colgando en el árbol…" : "Colgar en el árbol"}
      </button>

      {!ready && !submitting ? (
        <p className={styles.hint}>
          {photo ? "Escribe tu nombre y tu mensaje para continuar." : "Primero, una selfie."}
        </p>
      ) : null}

      <Link className={styles.skip} href="/arbol">
        Solo quiero ver el árbol
      </Link>
    </form>
  );
}

function FileButton({
  onChange,
  primary = false,
}: {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  primary?: boolean;
}) {
  return (
    <label className={primary ? styles.primary : styles.textButton}>
      {primary ? "Tomar o elegir foto" : "Subir una foto"}
      <input
        className="visually-hidden"
        type="file"
        accept="image/*"
        capture="user"
        onChange={onChange}
      />
    </label>
  );
}

function stopStream(ref: React.RefObject<MediaStream | null>) {
  ref.current?.getTracks().forEach((t) => t.stop());
  ref.current = null;
}
