"use client";

import { NAV } from "@/lib/content";
import { useLang } from "./Lang";

export default function Header() {
  const { lang, toggle, t } = useLang();
  return (
    <header id="top">
      <span className="brand">Raposo</span>
      <nav id="nav">
        {NAV.map((n) => (
          <a key={n.id} href={`#${n.id}`}>
            {t(n.label)}
          </a>
        ))}
      </nav>
      <button
        id="lang"
        type="button"
        onClick={toggle}
        aria-label={lang === "pt" ? "Switch to English" : "Mudar para português"}
      >
        {lang === "pt" ? (
          <>
            <b>PT</b> / EN
          </>
        ) : (
          <>
            PT / <b>EN</b>
          </>
        )}
      </button>
    </header>
  );
}
