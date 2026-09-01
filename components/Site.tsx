"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CONTACT, CV, FOOT, IDENT, NET, PORTALS, SEC_TITLES,
  SHARDS, SHARD_NOTE, SKILLS, SKILLS_LEDE, STACK,
  STACK_LEDE, TIMELINE, type Shard,
} from "@/lib/content";
import CertModal from "./CertModal";
import CertPeek from "./CertPeek";
import { Rich, useLang } from "./Lang";

/* Act II. Everything here was built with innerHTML in the prototype and rebuilt
   from scratch on every language switch; as JSX it just re-renders. The two
   filters are the only local state on the page. */

/* The channel marks, drawn inline.

   Inline because the page makes no external request for anything, and three
   paths weigh less than the round trip an icon font or a sprite would cost.
   aria-hidden because the label sits right beside each one: a screen reader
   should hear "LinkedIn" once, not twice. */
const ICONS: Record<string, string> = {
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
};

function ChannelIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={ICONS[name]} />
    </svg>
  );
}

function SecHead({ n, title }: { n: string; title: string }) {
  return (
    <div className="sec__h">
      <span className="sec__n">{n}</span>
      <h2 className="sec__t">{title}</h2>
      <span className="sec__r" />
    </div>
  );
}

export default function Site() {
  const { lang, t } = useLang();
  const [openCert, setOpenCert] = useState<Shard | null>(null);
  /* which certificate the cursor is over, and where it came in. Only the shard
     drives a render; the panel's position is written to the node directly. */
  const [peek, setPeek] = useState<Shard | null>(null);
  const [peekAt, setPeekAt] = useState<{ x: number; y: number } | null>(null);


  return (
    <main id="site">
      {/* ── 01 IDENT ── */}
      <section className="sec" id="ident">
        <div className="wrap">
          <SecHead n="01" title={t(SEC_TITLES.ident)} />
          <div className="ident">
            <div className="ph" data-r style={{ "--i": 0 } as React.CSSProperties}>
              <i />
              {/* This was a plain img because the shader built its match-cut texture
                  from the element's resolved src, and a responsive srcset would have
                  handed it a different file per device. The match cut is gone, so
                  that constraint is gone with it and next/image is now open if the
                  srcset is wanted.

                  width/height are the file's real intrinsic size, and .ph img sets
                  height:auto. Both matter: these attributes are presentational hints,
                  so a height here with no height in the CSS wins and overrides the
                  intrinsic ratio. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/eu.jpg" alt="Maurício Raposo" width={751} height={1026} />
            </div>
            <div>
              <h3 className="name" data-r style={{ "--i": 1 } as React.CSSProperties}>
                {IDENT.name}
              </h3>
              <p className="role" data-r style={{ "--i": 2 } as React.CSSProperties}>
                {t(IDENT.role)}
              </p>
              <div className="bio" data-r style={{ "--i": 3 } as React.CSSProperties}>
                {IDENT.bio.map((para, k) => (
                  <Rich key={k} html={t(para)} />
                ))}
              </div>
              <dl className="figs" data-r style={{ "--i": 4 } as React.CSSProperties}>
                {IDENT.figs.map((f) => (
                  <div key={f.dt.pt}>
                    <dt>{t(f.dt)}</dt>
                    <dd>
                      {f.dd}
                      {f.em ? <em>{f.em}</em> : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 PORTAIS ── */}
      <section className="sec" id="projetos">
        <div className="wrap">
          <SecHead n="02" title={t(SEC_TITLES.projetos)} />
          <ul className="gates">
            {PORTALS.map((p, i) => (
              <li
                key={p.label.pt}
                className={"gate" + (p.lead ? " gate--lead" : "")}
                data-r
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="gate-slot">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="gate-label">{t(p.label)}</span>
                <Rich className="gate-note" html={t(p.note)} />
                {p.kv ? (
                  <p className="gate-kv">
                    {p.kv.map((k) => (
                      <Rich as="span" key={k.pt} html={t(k)} />
                    ))}
                  </p>
                ) : null}
                <span className={"gate-status " + p.status.kind}>
                  <em />
                  <span>{t(p.status.label)}</span>
                </span>
                {p.links ? (
                  <span className="gate-go">
                    {p.links.map((l) =>
                      l.internal ? (
                        <Link key={l.href} href={l.href}>
                          {t(l.label)}
                        </Link>
                      ) : (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener">
                          {t(l.label)}
                        </a>
                      ),
                    )}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 03 TRAJETÓRIA ── */}
      <section className="sec" id="traj">
        <div className="wrap">
          <SecHead n="03" title={t(SEC_TITLES.traj)} />
          <ul className="tl">
            {TIMELINE.map((e, i) => (
              <li key={e.when.pt} data-r style={{ "--i": i } as React.CSSProperties}>
                <span className="when">{t(e.when)}</span>
                <h3>{t(e.role)}</h3>
                <span className="where">{e.where}</span>
                <p>{t(e.note)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 04 PERÍCIA ── */}
      <section className="sec" id="competencias">
        <div className="wrap">
          <SecHead n="04" title={t(SEC_TITLES.competencias)} />
          <p className="sk__lede" data-r style={{ "--i": 0 } as React.CSSProperties}>
            {t(SKILLS_LEDE)}
          </p>
          <div className="sk">
            {SKILLS.map((s, i) => (
              <div
                key={s.name.pt}
                className={"sk__row is-" + s.st}
                data-r
                style={{ "--i": i + 1 } as React.CSSProperties}
              >
                <span className="sk__n">
                  {t(s.name)}
                  <i>{t(s.tag)}</i>
                </span>
                <span className="sk__s">
                  <b />
                  {t(s.cad)}
                </span>
                <Rich className="sk__d" html={t(s.note)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 STACK ── */}
      <section className="sec" id="stack">
        <div className="wrap">
          <SecHead n="05" title={t(SEC_TITLES.stack)} />
          <p className="sk__lede" data-r style={{ "--i": 0 } as React.CSSProperties}>
            {t(STACK_LEDE)}
          </p>
          <div className="st">
            {STACK.map((b, i) => (
              <div
                className={"st__b is-" + b.id}
                key={b.id}
                data-r
                style={{ "--i": i + 1 } as React.CSSProperties}
              >
                <div className="st__hd">
                  <h4>{t(b.label)}</h4>
                  <span className="st__n">{b.items.length}</span>
                  <span className="st__note">{t(b.note)}</span>
                </div>
                <ul>
                  {b.items.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 CERTIFICADOS ── */}
      <section className="sec" id="shards">
        <div className="wrap">
          <SecHead n="06" title={t(SEC_TITLES.shards)} />
          <div className="shs" data-r style={{ "--i": 1 } as React.CSSProperties}>
            {SHARDS.map((s) => (
              <a
                key={s.slug}
                className="sh"
                href={`/certificados/${lang}/${s.slug}.pdf`}
                target="_blank"
                rel="noopener"
                /* Guarded on the pointer, not on width: a tap fires mouseenter
                   too, and a preview that appears under the finger that opened
                   the card is noise. */
                onMouseEnter={(e) => {
                  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
                  setPeekAt({ x: e.clientX, y: e.clientY });
                  setPeek(s);
                }}
                onMouseLeave={() => setPeek(null)}
                onClick={(e) => {
                  /* let the browser keep modifier clicks, so "open in new tab"
                     and middle-click go on working */
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  setOpenCert(s);
                }}
              >
                <h4>{t(s.title)}</h4>
                <p>Alura · {t(s.sub)}</p>
              </a>
            ))}
          </div>
          <p
            className="mono"
            data-r
            style={{
              "--i": 2,
              fontSize: "10.5px",
              letterSpacing: ".12em",
              color: "var(--muted)",
              margin: "16px 0 0",
            } as React.CSSProperties}
          >
            {t(SHARD_NOTE)}
          </p>
        </div>
      </section>

      {/* ── 07 CONTATO ── */}
      <section className="sec" id="net">
        <div className="wrap">
          <SecHead n="07" title={t(SEC_TITLES.net)} />

          <div className="net" data-r style={{ "--i": 0 } as React.CSSProperties}>
            <p className="net__lede">{t(NET.lede)}</p>

            {/* the one action this section exists for */}
            <a className="net__mail" href={`mailto:${NET.mail}`}>
              <span>{t(NET.mailCta)}</span>
              <b>{NET.mail}</b>
            </a>

            <ul className="net__ch">
              {CONTACT.map((c) => (
                <li key={c.href}>
                  <a href={c.href} {...(c.ext ? { target: "_blank", rel: "noopener" } : {})}>
                    <span>
                      <ChannelIcon name={c.icon} />
                      {t(c.label)}
                    </span>
                    <b>{c.value}</b>
                  </a>
                </li>
              ))}
            </ul>

            {/* both files exist, so both are offered rather than only the one
                matching the language being read */}
            <p className="net__cv">
              <span>{t(NET.resume)}</span>
              <a href={CV.pt} download="curriculo-mauricio-raposo-pt.pdf">↓ PT</a>
              <a href={CV.en} download="resume-mauricio-raposo-en.pdf">↓ EN</a>
            </p>

            <p className="net__at">{t(NET.based)}</p>
          </div>

          <p className="foot">© 2026 Maurício Raposo · {t(FOOT)}</p>
        </div>
      </section>

      {/* hidden while the modal is up: the document is already on screen, full size */}
      <CertPeek shard={openCert ? null : peek} lang={lang} at={peekAt} />
      <CertModal shard={openCert} onClose={() => setOpenCert(null)} />
    </main>
  );
}
