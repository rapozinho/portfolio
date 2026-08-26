"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Lang, Shard } from "@/lib/content";
import { useLang } from "./Lang";

/* The certificate itself, in the language the visitor is reading.

   Both folders hold all twelve courses under the same slug, so the language is
   just a path segment. The modal opens on the site's current language and offers
   the other one, because a recruiter reading the English page may still want to
   see that the Portuguese original exists.

   The card stays a real <a href> and the click is intercepted, so ctrl-click,
   middle-click and a JS failure all still open the PDF in a tab. */

const UI = {
  close: { pt: "fechar", en: "close" },
  tab: { pt: "nova aba", en: "new tab" },
  download: { pt: "baixar", en: "download" },
  /* Not "your browser cannot show this": it usually can, and this line has no way
     to detect the case where it cannot. It offers the file either way. */
  fallback: {
    pt: "Não carregou? Baixe ou abra em outra aba.",
    en: "Not loading? Download it or open it in another tab.",
  },
  issuer: { pt: "emitido por", en: "issued by" },
} as const;

export default function CertModal({
  shard,
  onClose,
}: {
  shard: Shard | null;
  onClose: () => void;
}) {
  const { lang, t } = useLang();
  const [view, setView] = useState<Lang>(lang);
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  /* Next renders client components on the server too, where document does not
     exist, so the portal target is only available after mount. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* Reopening on a different card must not keep the previous card's language. */
  useEffect(() => {
    if (shard) setView(lang);
  }, [shard, lang]);

  const close = useCallback(() => {
    onClose();
    restore.current?.focus();
  }, [onClose]);

  useEffect(() => {
    if (!shard) return;
    restore.current = document.activeElement as HTMLElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    /* capture, because the entry engine also listens for keys on window */
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prev;
    };
  }, [shard, close]);

  if (!shard || !mounted) return null;
  const href = `/certificados/${view}/${shard.slug}.pdf`;
  /* No open-parameter fragment. It was added to force page-fit and coincided
     exactly with the frame going blank; the PDF renders correctly on its own, and
     the rotation fix means it now arrives upright and readable without help. */
  /* the filename the visitor gets, rather than the slug */
  const file = `${shard.slug}-${view}.pdf`;

  /* Portalled to body on purpose. #site is position:relative with z-index 2,
     so it is a stacking context: a child of it cannot paint above #top, which
     is fixed at z-index 60 in the root context. Rendered in place, the header
     would cover the document. */
  return createPortal(
    <div className="cm" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div
        className="cm__p"
        role="dialog"
        aria-modal="true"
        aria-label={t(shard.title)}
        tabIndex={-1}
        ref={panel}
      >
        <header className="cm__h">
          <span className="cm__t">
            {t(shard.title)}
            <i>
              {t(UI.issuer)} Alura · {t(shard.sub)}
            </i>
          </span>

          <span className="cm__lang" role="group" aria-label="Idioma do documento">
            {(["pt", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={view === l}
                onClick={() => setView(l)}
              >
                {l === "pt" ? "BR" : "US"}
              </button>
            ))}
          </span>

          <a className="cm__d" href={href} download={file}>
            ↓ {t(UI.download)}
          </a>
          <a className="cm__x" href={href} target="_blank" rel="noopener">
            {t(UI.tab)} ↗
          </a>
          <button className="cm__c" type="button" onClick={close} aria-label={t(UI.close)}>
            ✕
          </button>
        </header>

        {/* key on href so switching language reloads rather than caching the old file */}
        <iframe className="cm__f" key={href} src={href} title={t(shard.title)} />

        <p className="cm__fb">
          {t(UI.fallback)}{" "}
          <a href={href} download={file}>
            ↓ {t(UI.download)}
          </a>
          {" · "}
          <a href={href} target="_blank" rel="noopener">
            {t(UI.tab)} ↗
          </a>
        </p>
      </div>
    </div>,
    document.body,
  );
}
