"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CONTACT, CV, FOOT, IDENT, NET, PORTALS, SEC_TITLES,
  SHARDS, SHARD_NOTE, SKILLS, SKILLS_LEDE, STACK,
  STACK_LEDE, TIMELINE, type Shard,
} from "@/lib/content";
import CertModal from "./CertModal";
import { Rich, useLang } from "./Lang";

/* Act II. Everything here was built with innerHTML in the prototype and rebuilt
   from scratch on every language switch; as JSX it just re-renders. The two
   filters are the only local state on the page. */

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
              <em>{t(IDENT.badge)}</em>
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
                    <span>{t(c.label)}</span>
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

      <CertModal shard={openCert} onClose={() => setOpenCert(null)} />
    </main>
  );
}
