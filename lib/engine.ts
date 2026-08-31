import { VERT, FRAG } from "./shader";

/* Act I: the raymarched wall, the entry flight, and the scroll-driven approach.

   This stays imperative on purpose. It runs a rAF loop writing uniforms at 60fps
   -- routing that through React state would re-render the tree sixty times a
   second for no benefit. React owns the markup; the engine reads the nodes it
   animates and writes to them directly, which is the normal division of labour
   for canvas work.

   The prototype's globals become closure state, and everything it registered on
   window is tracked so the effect can unmount cleanly under StrictMode. */
export type EngineOpts = {
  /** terminal lines for the current language: [prefix, html][] */
  lines: () => Array<[string, string]>;
  /** hands the Act II band wall its reaction level */
  setEnergy: (v: number) => void;
  /** land in Act II with no flight, for a link that names a section to open at */
  skipEntry?: boolean;
};

export type Engine = {
  destroy: () => void;
  /** re-type the handshake log, e.g. after a language switch */
  retype: () => void;
};

export function mountEngine(o: EngineOpts): Engine {
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function(s: string, r?: any): any { return (r || document).querySelector(s) };
  var $$ = function(s: string, r?: any): any[] {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  var offs: Array<() => void> = [];
  function on(t: any, type: string, fn: any, opts?: any){
    if(!t) return;
    t.addEventListener(type, fn, opts);
    offs.push(function(){ t.removeEventListener(type, fn, opts) });
  }

  var glc: any = $("#gl"), gl: any = null, prog: any = null, uni: any = {}, glRaf = 0;
  var crossT = 0, crossTarget = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
  /* keyboard and touch contribution to the look, kept separate from the
     pointer so neither erases the other */
  var kx = 0;
  /* charge = how hard you are pushing against the wall (0..1). It decays
     when you stop, so the crossing has to be earned in one sustained push. */
  var charge = 0, chargeT = 0, autoCharge = false;
  /* The entry flight runs itself; scroll does nothing until it lands. */
  var entry = 0, entryDone = false, entryT0 = 0;
  var ENTRY_MS = 4400;
  
  function sh(type: number, src: string){
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.error("shader:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  
  function initGL(){
    try{
      gl = glc.getContext("webgl", {alpha:false, antialias:false, powerPreference:"high-performance"})
        || glc.getContext("experimental-webgl", {alpha:false, antialias:false});
    }catch(e){ gl = null }
    if(!gl) return false;
  
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if(!vs || !fs) return false;
    prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
      console.error("link:", gl.getProgramInfoLog(prog));
      return false;
    }
    gl.useProgram(prog);
  
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  
    ["uRes","uT","uM","uEntry","uAppr","uCross","uReveal","uTarget","uPhoto","uHasPhoto"].forEach(function(n){ uni[n] = gl.getUniformLocation(prog, n) });
    glResize();
    loadPhoto();
    measureTarget();
    return true;
  }
  
  /* Raymarching cost scales with pixels, so budget them instead of trusting
     devicePixelRatio: a 4K screen would otherwise ask for 8M pixels x 78 steps.
     Small screens still render 1:1; big ones scale down and the CSS upscales. */
  
  /* The photograph is already in the DOM for Act II — reuse that data URI as a
     texture instead of shipping the bytes twice. NPOT is fine on WebGL1 with
     CLAMP_TO_EDGE and no mipmaps. */
  var photoTex: any = null, photoReady = false;
  function loadPhoto(){
    var el: any = document.querySelector(".ph img");
    if(!el || !gl) return;
    var img = new Image();
    img.onload = function(){
      photoTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, photoTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      photoReady = true;
    };
    img.src = el.src;
  }
  
  
  /* The shader has to land the photograph exactly where Act II will draw it,
     so measure that rectangle rather than guessing at the CSS. #site is display
     :none before the crossing, so reveal it invisibly for one reflow. */
  var target: number[] = [-0.28, 0.02, 0.075, 0.102];   /* sane default if measuring fails */
  function measureTarget(){
    var site = document.getElementById("site");
    var ph = document.querySelector(".ph");
    if(!site || !ph) return;
    var wasThrough = document.body.classList.contains("through");
    if(!wasThrough){
      /* .through also supplies #site padding-top, so measuring without it
         reported the photo 49px too high and the match cut would jump */
      site.style.visibility = "hidden";
      document.body.classList.add("through");
    }
    var r = ph.getBoundingClientRect();
    if(!wasThrough){
      document.body.classList.remove("through");
      site.style.visibility = "";
    }
    if(r.width < 4 || r.height < 4) return;
    var W = innerWidth, H = innerHeight;
    /* shader uses uv = (frag - 0.5*res)/res.y, and frag.y counts up from the bottom */
    var cx = (r.left + r.width  / 2 - W / 2) / H;
    var cy = (H / 2 - (r.top + r.height / 2)) / H;
    target = [cx, cy, (r.width / 2) / H, (r.height / 2) / H];
  }
  
  function glResize(){
    if(!gl) return;
    var budget = matchMedia("(pointer: coarse)").matches ? 820000 : 1600000;
    var css = Math.max(1, innerWidth * innerHeight);
    var s = Math.min(1, Math.sqrt(budget / css));
    var w = Math.max(1, Math.round(innerWidth  * s));
    var h = Math.max(1, Math.round(innerHeight * s));
    if(glc.width !== w || glc.height !== h){
      glc.width = w; glc.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  
  var glT0 = 0;
  function glFrame(ms: number){
    if(!gl) return;
    if(!glT0) glT0 = ms;
    var t = (ms - glT0) / 1000;
    /* inertia on the pointer: the wall is heavy */
    /* 0.055 made the wall feel heavy, which is right for the approach and
       wrong for looking around. The look tracks at 0.10; the vertical drift
       keeps its weight. */
    mx += (Math.max(-1, Math.min(1, tmx + kx)) - mx) * 0.10;
    my += (tmy - my) * 0.055;
  
    /* the automatic entry flight, then hand over to scroll */
    if(!entryDone){
      if(!entryT0) entryT0 = ms;
      var k = Math.min(1, (ms - entryT0) / (RM ? 1 : ENTRY_MS));
      /* fast through the lattice, then a long glide across the dark gap */
      entry = k < 1 ? 1 - Math.pow(1 - k, 1.4) : 1;
      if(k >= 1){
        entry = 1; entryDone = true;
        document.body.classList.add("landed");
        cueArm(3000);
        typeLines();
      }
    }
  
    /* charge bleeds away unless you keep pushing */
    if(autoCharge) chargeT = Math.min(1, chargeT + 0.0085);
    /* no drain: progress only ever advances. Losing ground while you pause
       reads as the page fighting you, not as the wall resisting. */
    charge += (chargeT - charge) * 0.055;   /* smoothing only, never reverses */
    if(!crossed && chargeT >= 1) cross();
  
    crossT += (crossTarget - crossT) * 0.019;   /* slower still: five curtains to clear */
  
    /* the photograph resolves over the last third of the approach */
    var reveal = Math.min(1, Math.max(0, (charge - 0.34) / 0.52) + crossT * 0.9);
  
    gl.uniform2f(uni.uRes, glc.width, glc.height);
    gl.uniform1f(uni.uT, RM ? 2.4 : t);
    gl.uniform2f(uni.uM, mx, my);
    gl.uniform1f(uni.uEntry, entry);
    gl.uniform1f(uni.uAppr, charge);
    gl.uniform1f(uni.uCross, crossT);
    gl.uniform1f(uni.uReveal, reveal);
    gl.uniform4f(uni.uTarget, target[0], target[1], target[2], target[3]);
    gl.uniform1f(uni.uHasPhoto, photoReady ? 1 : 0);
    if(photoReady){
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, photoTex);
      gl.uniform1i(uni.uPhoto, 0);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  
    if(reveal > 0.9) idLine();
  
    setMeter(charge);
  
    glRaf = requestAnimationFrame(glFrame);
  }
  
  var glOK = initGL();
  if(glOK){
    document.body.classList.add("gl-ok");
    glRaf = requestAnimationFrame(glFrame);
    on(window, "resize", function(){ glResize(); measureTarget() });
    addEventListener("pointermove", function(e){
      tmx = (e.clientX / Math.max(1, innerWidth)  - 0.5) * 2;
      tmy = (e.clientY / Math.max(1, innerHeight) - 0.5) * -2;
    }, {passive:true});
    document.addEventListener("visibilitychange", function(){
      cancelAnimationFrame(glRaf);
      if(!document.hidden && !crossed) glRaf = requestAnimationFrame(glFrame);
    });
  }
  function glStop(){ cancelAnimationFrame(glRaf); glRaf = 0 }
  
  /* Language lives in React now (components/Lang.tsx). The engine only needs the
     terminal lines, which it asks for through o.lines(). */
  var idDone = false;
  function idLine(){
    if(idDone) return;
    idDone = true;
    var el = document.createElement("span");
    el.className = "l";
    el.innerHTML = '> <span class="k">identificado: RAPOSO, M.</span>';
    var t2 = document.getElementById("term");
    if(t2){ var c = t2.querySelector(".caret"); if(c) c.remove(); t2.appendChild(el) }
  }
  
  var term: any = $("#term"), typing: any = null;
  function typeLines(){
    clearTimeout(typing);
    term.innerHTML = "";
    idDone = false;          /* the reveal line must survive a language switch */
    var set = o.lines();
    if(RM){
      set.forEach(function(pair){
        var l = document.createElement("span");
        l.className = "l"; l.innerHTML = pair[0] + pair[1];
        term.appendChild(l);
      });
      return;
    }
    var li = 0;
    function nextLine(){
      if(li >= set.length){
        var c = document.createElement("span");
        c.className = "caret"; term.appendChild(c);
        return;
      }
      var pair = set[li++];
      var el = document.createElement("span");
      el.className = "l"; el.textContent = pair[0];
      term.appendChild(el);
      /* type the plain text, then swap in the marked-up version — keeps the
         reveal character-accurate without re-parsing HTML every frame */
      var plain = pair[1].replace(/<[^>]+>/g, "");
      var i = 0;
      (function tick(){
        i += 2;
        el.textContent = pair[0] + plain.slice(0, i);
        if(i < plain.length){ typing = setTimeout(tick, 16) }
        else { el.innerHTML = pair[0] + pair[1]; typing = setTimeout(nextLine, 190) }
      })();
    }
    nextLine();
  }
  
  var gate: any = $("#gate"), crossed = false;
  function cross(){
    if(crossed) return;
    crossed = true;
    clearTimeout(typing);
    /* the shader flies the camera through the wall; the overlay just clears */
    crossTarget = 1;
    autoCharge = false;
    o.setEnergy(1.4);
    document.body.classList.add("breaching");
    var wait = RM ? 0 : 3200;
    setTimeout(function(){
      gate.classList.add("gone");
      document.body.classList.remove("breaching");
      document.body.classList.add("through");
      glStop();                             /* GL is Act I only — stop paying for it */
      o.setEnergy(0.2);                     /* the 2D wall settles behind the content */
      scrollTo({top:0, behavior:"auto"});
      observe();
    }, wait);
  }
  /* The wall resists. Every push adds charge; letting go lets it drain.
     Reaching full charge is what opens the tear — one gesture never does. */
  var meter: any = $("#meter"), meterFill: any = $("#meter-i"), meterTxt: any = $("#meter-t");
  var cue: any = $("#cue"), cueFill: any = $("#cue-f"), nudgeTm: any = 0;
  
  /* The wheel is not discoverable here: it drives the wall instead of the
     document, so there is no scrollbar to imply it. cueIdle escalates when
     the visitor has been still; cueArm resets that clock. */
  function cueIdle(){
    if(!cue || crossed || chargeT > 0.04) return;
    cue.classList.add("nudge");
  }
  function cueArm(wait: number){
    if(!cue) return;
    clearTimeout(nudgeTm);
    cue.classList.remove("nudge");
    nudgeTm = setTimeout(cueIdle, wait);
  }
  var PUSH = 1 / 1900;   /* ~1900px of scroll, one way */
  
  function push(amount: number){
    if(crossed || !entryDone) return;   /* the entry is not skippable by scroll */
    chargeT = Math.min(1, chargeT + amount);
    /* the first notch of wheel has to change something visible, or the
       gesture reads as ignored */
    if(cue) cue.classList.add("armed");
    cueArm(4600);
  }
  function setMeter(v: number){
    if(!meterFill) return;
    meterFill.style.transform = "scaleX(" + v.toFixed(3) + ")";
    meter.classList.toggle("hot", v > 0.03);
    if(cueFill) cueFill.style.transform = "scaleY(" + v.toFixed(3) + ")";
    if(cue) cue.classList.toggle("done", v > 0.92);   /* out of the way at the end */
    if(meterTxt) meterTxt.textContent = Math.round(v * 100) + "%";
  }
  
  on(window, "wheel", function(e: any){
    if(e.deltaY > 0) push(e.deltaY * PUSH);   /* upward wheel is ignored, not reversed */
  }, {passive:true});
  
  on(window, "keydown", function(e: any){
    if(crossed) return;
    if(e.key === "ArrowDown" || e.key === "PageDown" || e.key === " "){ push(0.085); e.preventDefault() }
    else if(e.key === "ArrowLeft"){  kx = Math.max(-1, kx - 0.22); e.preventDefault() }
    else if(e.key === "ArrowRight"){ kx = Math.min( 1, kx + 0.22); e.preventDefault() }
    else if(e.key === "Enter"){ autoCharge = true }
  });
  
  var touchY: number | null = null, touchX: number | null = null;
  on(window, "touchstart", function(e: any){
    touchY = e.touches[0].clientY;
    touchX = e.touches[0].clientX;
  }, {passive:true});
  on(window, "touchmove", function(e: any){
    if(crossed || touchY === null) return;
    var y = e.touches[0].clientY;
    if(touchY - y > 0) push((touchY - y) * PUSH * 2.2);
    touchY = y;
    /* vertical drag is the push, horizontal is the look: one axis each, so a
       diagonal drag does both instead of neither */
    if(touchX !== null){
      var x = e.touches[0].clientX;
      kx = Math.max(-1, Math.min(1, kx + (x - touchX) / Math.max(1, innerWidth) * 2.4));
      touchX = x;
    }
  }, {passive:true});
  
  /* the button does the pushing for you — nobody is forced to scroll */
  on($("#breach"), "click", function(){ autoCharge = true });
  on($("#skip"), "click", function(){ chargeT = 1 });
  
  var io: any = null, io2: any = null;
  function observe(){
    if(io) return;
    io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting) e.target.classList.add("in") });
    }, {threshold:0.16});
    $$(".sec").forEach(function(s){ io.observe(s) });
  
    io2 = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting) return;
        var id = e.target.id;
        $$("#nav a").forEach(function(a){ a.classList.toggle("on", a.getAttribute("href") === "#" + id) });
      });
    }, {threshold:0.4});
    $$(".sec").forEach(function(s){ io2.observe(s) });
  }
  
  /* the wall breathes with reading depth: a little more alive at the extremes */
  on(window, "scroll", function(){
    if(!crossed) return;
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? scrollY / max : 0;
    o.setEnergy(0.16 + Math.abs(p - 0.5) * 0.34);
  }, {passive:true});
  
  /* ════════════════════════════════════════════════════════════════
     BOOT
     ════════════════════════════════════════════════════════════════ */

  /* Arriving from a link that already names a section, e.g. the case study
     returning to /#projetos. The visitor crossed the wall to reach that link,
     so flying it again would be a toll charged twice, and cross() ends on
     scrollTo(0), which would drop them at the top of the page they asked to
     open halfway down. Take Act II directly and leave the scroll alone. */
  if(o.skipEntry){
    crossed = true; entryDone = true;
    entry = 1; charge = 1; chargeT = 1; crossT = 1; crossTarget = 1;
    clearTimeout(typing);
    if(gate) gate.classList.add("gone");
    document.body.classList.add("through");
    glStop();
    o.setEnergy(0.2);
    observe();
  }

  return {
    destroy: function(){
      cancelAnimationFrame(glRaf);
      clearTimeout(typing);
      clearTimeout(nudgeTm);
      if(io) io.disconnect();
      if(io2) io2.disconnect();
      offs.forEach(function(f){ f() });
      offs = [];
    },
    retype: function(){ if(entryDone) typeLines() }
  };
}
