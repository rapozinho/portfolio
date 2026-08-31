"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Bi, Lang } from "@/lib/content";

type Ctx = {
  lang: Lang;
  toggle: () => void;
  /** pick the current language out of a {pt, en} pair */
  t: (v: Bi) => string;
};

const LangCtx = createContext<Ctx>({ lang: "pt", toggle: () => {}, t: (v) => v.pt });

export function useLang() {
  return useContext(LangCtx);
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  /* Portuguese, to agree with the document the server actually sends. Booting
     in English left <html lang="pt-BR">, a Portuguese title, description,
     keywords, JSON-LD and OG card wrapped around an English body: a screen
     reader read English prose with Portuguese pronunciation until hydration
     corrected it, a crawler or a JS-less visitor never saw the correction, and
     every shared link previewed in Portuguese whatever the visitor was reading.
     English stays one click away on the toggle. */
  const [lang, setLang] = useState<Lang>("pt");

  /* The <html lang> attribute is set on the server as pt-BR and has to follow the
     toggle, or a screen reader keeps reading English copy with Portuguese
     pronunciation rules. */
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === "pt" ? "en" : "pt")), []);
  const t = useCallback((v: Bi) => v[lang], [lang]);

  return <LangCtx.Provider value={{ lang, toggle, t }}>{children}</LangCtx.Provider>;
}

/** Prose authored in lib/content.ts, so the inline markup is ours, not input. */
export function Rich({
  html,
  as: Tag = "p",
  ...rest
}: { html: string; as?: React.ElementType } & React.HTMLAttributes<HTMLElement>) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html }} />;
}
