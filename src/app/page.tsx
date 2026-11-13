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
        <h1 className={styles.title}>Tu luz también hace brillar a Salva ✨</h1>
        <p className={styles.lede}>
          Todos tenemos una luz especial. Hoy queremos que la tuya sea parte de esta historia.
        </p>
        <p className={styles.lede}>
          <strong>
            Comparte tu sonrisa y dedica unas palabras a alguien que haya iluminado tu año.
          </strong>{" "}
          Juntos le daremos vida a nuestro árbol.
        </p>
      </div>

      <SelfieFlow />
    </main>
  );
}
