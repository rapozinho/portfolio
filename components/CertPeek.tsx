"use client";

import { useEffect, useRef } from "react";
import type { Lang, Shard } from "@/lib/content";

/* The hover preview for a certificate card.

   The cards were a title and a subtitle on a panel, and the only thing marking
   them as openable was a background shift. Showing the document itself is the
   affordance: nobody has to be told a picture of a certificate can be opened.

   Which shard is under the cursor lives in React state, because it changes when
   the pointer crosses a card. Where the panel sits does not: that changes with
   every mouse move, so it is written to the node directly rather than through a
   render, the same division lib/engine.ts uses for the canvas.

   It is decorative and duplicates the card's own text, so it is aria-hidden and
   never reachable: a screen reader gets the card, not this. */

export default function CertPeek({
  shard,
  lang,
  at,
}: {
  shard: Shard | null;
  lang: Lang;
  /* where the pointer entered, so the panel can be placed before the first
     mousemove instead of flashing at the top left corner for one frame */
  at: { x: number; y: number } | null;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!shard || !el) return;

    /* Offset from the cursor, and flipped to the other side when the panel
       would run past an edge, so it never leaves the viewport and never sits
       under the pointer. */
    const place = (x: number, y: number) => {
      const m = 16;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const px = x + m + w + m > innerWidth ? x - w - m : x + m;
      const py = y + m + h + m > innerHeight ? y - h - m : y + m;
      el.style.transform =
        `translate3d(${Math.round(Math.max(m, px))}px, ${Math.round(Math.max(m, py))}px, 0)`;
    };

    if (at) place(at.x, at.y);
    const onMove = (e: MouseEvent) => place(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
    /* `at` is read once on open; following it would re-bind on every move */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shard]);

  if (!shard) return null;

  return (
    <div className="peek" ref={box} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/certificados/thumbs/${lang}/${shard.slug}.webp`}
        alt=""
        width={560}
        height={396}
      />
    </div>
  );
}
