import { Logo } from "@/components/Logo";
import { SelfieFlow } from "@/components/SelfieFlow";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Logo />
        <span className={styles.season}>Navidad 2026</span>
      </header>

      <div className={styles.intro}>
        <h1 className={styles.title}>Cuelga tu cara en el árbol</h1>
        <p className={styles.lede}>
          Una selfie y unas palabras de agradecimiento. Aparecerán en el árbol junto a las de todo el
          equipo.
        </p>
      </div>

      <SelfieFlow />
    </main>
  );
}
