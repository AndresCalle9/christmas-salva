import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { Tree } from "@/components/Tree";
import { getWishes } from "@/lib/wishes-server";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "El árbol de Salva",
};

export default function TreePage() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" aria-label="Inicio">
          <Logo />
        </Link>
        <span className={styles.season}>Navidad 2026</span>
      </header>

      <h1 className={styles.title}>El árbol de Salva</h1>

      <Suspense fallback={<Tree initial={[]} />}>
        <TreeWithData />
      </Suspense>
    </main>
  );
}

async function TreeWithData() {
  await connection();
  const wishes = await getWishes().catch((err) => {
    console.error(err);
    return [];
  });
  return <Tree initial={wishes} />;
}
