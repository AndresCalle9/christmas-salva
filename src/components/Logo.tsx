import styles from "./Logo.module.css";

/** Salva wordmark, tinted with currentColor via a CSS mask. */
export function Logo({ className }: { className?: string }) {
  return <span role="img" aria-label="Salva" className={`${styles.logo} ${className ?? ""}`} />;
}
