"use client";

import { useEffect, useRef } from "react";
import { mountEngine, type Engine } from "@/lib/engine";
import { mountWall2D, type Wall2D } from "@/lib/wall2d";
import { GATE, TERM } from "@/lib/content";
import { useLang } from "./Lang";

/* Act I. React renders the overlay; the engine drives the canvas.

   The rAF loop writes shader uniforms and the meter/cue every frame. Routing
   that through React state would re-render the tree sixty times a second to
   change one transform, so the engine writes to those nodes directly and React
   never re-renders during the flight. The only state crossing the boundary is
   language, and it crosses through a ref so a toggle never restarts the
   animation. */
export default function Entry() {
  const { lang, t } = useLang();
  const langRef = useRef(lang);
  const engine = useRef<Engine | null>(null);
  langRef.current = lang;

  useEffect(() => {
    let wall: Wall2D | null = null;
    let eng: Engine | null = null;
    /* A link from another route can name the section it wants to open at, the
       way the case study returns to /#projetos. Reaching that link meant
       crossing the wall already, so the crossing is not asked for a second
       time. */
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = hash ? document.getElementById(hash) : null;
    try {
      wall = mountWall2D();
      eng = mountEngine({
        lines: () => TERM[langRef.current],
        setEnergy: (v) => wall?.setEnergy(v),
        skipEntry: !!target,
      });
      engine.current = eng;
    } catch (err) {
      /* No WebGL, or a shader that failed to compile. The site still has to be
         readable, so drop straight through to Act II instead of leaving the
         visitor on a black screen. */
      console.error("[blackwall] entry failed, skipping to content", err);
      document.body.classList.add("through");
    }
    /* Outside the try: both paths above end with Act II laid out, and a visitor
       who asked for a section should land on it whether or not the shader
       compiled. #site was display:none while the browser made its own attempt
       at the hash, so that attempt had nothing to scroll to. auto, not smooth,
       because this is an arrival rather than a movement. */
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "auto" }));
    }
    return () => {
      eng?.destroy();
      wall?.destroy();
      engine.current = null;
      /* <body> is in the root layout, so it survives client-side navigation while
         this component does not. The engine writes the crossing state onto it and
         a fresh engine starts from zero, so leaving the classes behind means
         coming back from /blackwall lands on a site that believes it is already
         through: #gl hidden, #site visible, and a new #gate drawn over the top. */
      document.body.classList.remove("through", "landed", "gl-ok", "breaching");
    };
  }, []);

  /* Re-type the handshake log in the new language, without remounting WebGL. */
  useEffect(() => {
    engine.current?.retype();
  }, [lang]);

  return (
    <>
      <canvas id="gl" aria-hidden="true" />

      <section id="gate" aria-label={lang === "pt" ? "Entrada" : "Entrance"}>
        <dl className="g-read">
          {GATE.readout.map((r) => (
            <div key={r.dt.pt}>
              <dt>{t(r.dt)}</dt>
              <dd className={r.ok ? "ok" : undefined}>{r.em ? <em>{t(r.dd)}</em> : t(r.dd)}</dd>
            </div>
          ))}
        </dl>

        <div className="g-mid">
          <div className="cue" id="cue">
            <span className="cue__r">
              <i id="cue-f" />
            </span>
            <span className="cue__l">{t(GATE.cue)}</span>
          </div>
        </div>

        <div className="g-bot">
          <div className="term">
            <div className="term__hd">
              <i />
              <span>{t(GATE.handshake)}</span>
            </div>
            <div className="term__bd" id="term" />
          </div>
          <div className="g-act">
            <div className="meter" id="meter">
              <span className="meter__l">{t(GATE.meter)}</span>
              <span className="meter__b">
                <i id="meter-i" />
              </span>
              <span className="meter__v" id="meter-t">
                0%
              </span>
            </div>
            <button className="breach-btn" id="breach" type="button">
              <i />
              <span>{t(GATE.breach)}</span>
            </button>
            <button className="g-skip" id="skip" type="button">
              {t(GATE.skip)}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
