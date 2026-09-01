"use client";

import Link from "next/link";
import { CASE } from "@/lib/content";
import { useLang } from "./Lang";

/* The body of the case study, split out from app/blackwall/page.tsx because it
   reads the language from context and the page it lives in has to stay a server
   component to keep exporting metadata.

   Laid out as an after-action report because that is what the content already
   is: a header block, a fact sheet, findings in the order they constrained each
   other, and open items. The one loud element is the cost of each decision,
   since that is the half of an engineering write-up that normally goes missing,
   and this page exists to show judgement rather than features. */

/* The label sits in its own column so the three lines of a decision read as a
   table rather than three paragraphs that happen to start in bold. */
function Row({ k, children, cost }: { k: string; children: string; cost?: boolean }) {
  return (
    <div className={cost ? "dec__row dec__row--cost" : "dec__row"}>
      <span className="dec__k">{k}</span>
      <p>{children}</p>
    </div>
  );
}

/* A screenshot with its caption. Plain img: these are fixed assets at a fixed
   width, so there is nothing for next/image to negotiate. */
function Shot({ shot, cap }: { shot: (typeof CASE.shots)[number]; cap: string }) {
  return (
    <figure className="shot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/blackwall/${shot.src}.webp`} alt={cap} width={shot.w} height={shot.h} loading="lazy" />
      <figcaption>{cap}</figcaption>
    </figure>
  );
}

function SecHead({ label }: { label: string }) {
  return (
    <div className="case__sh">
      <h2>{label}</h2>
      <span className="case__rule" />
    </div>
  );
}

export default function CaseStudy() {
  const { lang, toggle, t } = useLang();

  return (
    <>
      <div id="grain" aria-hidden="true" />

      {/* Fixed so the way back is reachable from anywhere in a long read, not
          only after scrolling to the end of it. */}
      <div className="case-rail">
        <div className="wrap">
          <span className="brand">Maurício Raposo</span>
          <Link className="case-rail__back" href="/#projetos">
            {t(CASE.back)}
          </Link>
          {/* The toggle belongs here too. Without it this route is a dead end
              for the language: the header that carries it is only on "/". */}
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
        </div>
      </div>

      <main id="case">
        <div className="wrap">
          <header className="case__hd">
            <span className="case__eyebrow">{t(CASE.eyebrow)}</span>
            <h1 className="case__t">
              BlackWall <span>Analytics</span>
            </h1>
            <p className="case__lede">{t(CASE.lede)}</p>
            <p className="case__go">
              <a
                href="https://rapozinho.github.io/blackwall-analytics/"
                target="_blank"
                rel="noopener"
              >
                {t(CASE.demo)}
              </a>
              <a
                className="case__go--quiet"
                href="https://github.com/rapozinho/blackwall-analytics"
                target="_blank"
                rel="noopener"
              >
                {t(CASE.repo)}
              </a>
            </p>
          </header>

          <dl className="case__figs">
            {CASE.facts.map((f) => (
              <div key={f.k.pt}>
                <dt>{t(f.k)}</dt>
                <dd>{t(f.v)}</dd>
              </div>
            ))}
          </dl>

          {/* The product, before any of the prose about it. */}
          <Shot shot={CASE.shots[0]} cap={t(CASE.shots[0].cap)} />

          <section className="case__s">
            <SecHead label={t(CASE.secProblem)} />
            {CASE.problem.map((p, i) => (
              <p key={i}>{t(p)}</p>
            ))}
          </section>

          <section className="case__s">
            <SecHead label={t(CASE.secDecisions)} />
            {/* Numbered because these are a sequence: each one narrows the next. */}
            <ol className="dec">
              {CASE.decisions.map((d) => (
                <li key={d.n}>
                  <div className="dec__hd">
                    <span className="dec__n">{d.n}</span>
                    <h3>{t(d.title)}</h3>
                  </div>
                  <Row k={t(CASE.rowProblem)}>{t(d.problem)}</Row>
                  <Row k={t(CASE.rowChoice)}>{t(d.choice)}</Row>
                  <Row k={t(CASE.rowCost)} cost>
                    {t(d.cost)}
                  </Row>
                </li>
              ))}
            </ol>
          </section>

          {/* the two steps the decisions above are describing, side by side */}
          <div className="shots">
            {CASE.shots.slice(1).map((s) => (
              <Shot key={s.src} shot={s} cap={t(s.cap)} />
            ))}
          </div>

          <section className="case__s">
            <SecHead label={t(CASE.secStack)} />
            <p className="case__stack">
              {CASE.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </p>
          </section>

          <section className="case__s">
            <SecHead label={t(CASE.secNext)} />
            <ul className="nxt">
              {CASE.next.map((n) => (
                <li key={n.pt.slice(0, 24)}>{t(n)}</li>
              ))}
            </ul>
          </section>

          <footer className="case__foot">
            <Link href="/#projetos">{t(CASE.backFoot)}</Link>
            <span>© 2026 Maurício Raposo</span>
          </footer>
        </div>
      </main>
    </>
  );
}
