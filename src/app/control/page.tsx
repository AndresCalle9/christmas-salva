import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { BroadcastControl } from "@/components/BroadcastControl";
import styles from "./page.module.css";

// Not linked from anywhere and hidden from search engines.
export const metadata: Metadata = {
  title: "Control",
  robots: { index: false, follow: false },
};

export default function ControlPage() {
  return (
    <main className={styles.main}>
      <Logo />
      <h1 className={styles.title}>Enviar el mensaje de Navidad</h1>
      <p className={styles.lede}>
        Todas las personas con el sitio abierto recibirán, en unos segundos, uno de los mensajes al
        azar. Quien entre en los 15 minutos siguientes también lo verá.
      </p>
      <BroadcastControl />
    </main>
  );
}
