
(function(){
  "use strict";
  var RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function(s,r){ return (r||document).querySelector(s) };
  var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)) };

  /* ════════════════════════════════════════════════════════════════
     THE BLACKWALL — ported from blackwall-analytics/Blackwall.tsx.
     Vertical ICE bands, a horizontal sweep, glitch slices with a cyan
     ghost. `focus` is where the wall destabilises; `energy` is how hard
     it is reacting. Canvas, not divs: ~90 bands need their own alpha
     per frame and layout/paint would never keep up.
     ════════════════════════════════════════════════════════════════ */
  var BAND_W = 13, SWEEP_SPEED = 90, MAX_DPR = 1.5;
  var canvas = $("#wall-c"), ctx = canvas.getContext("2d", {alpha:false});
  var W = 0, H = 0, dpr = 1, phases = [], seeds = [];
  var focusTarget = 0.5, smoothFocus = 0.5;
  var energyWant = 0, energy = 0;
  var raf = 0;

  function resize(){
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    W = Math.max(1, Math.floor(r.width));
    H = Math.max(1, Math.floor(r.height));
    canvas.width  = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = Math.ceil(W / BAND_W) + 1;
    phases = []; seeds = [];
    for(var i = 0; i < cols; i++){
      phases.push((i * 1.7) % (Math.PI * 2));
      seeds.push(((i * 9301 + 49297) % 233280) / 233280);
    }
  }

  function draw(tMs){
    var t = tMs / 1000;
    smoothFocus += (focusTarget - smoothFocus) * 0.08;   /* the wall has inertia */
    energy += (energyWant - energy) * 0.06;

    ctx.fillStyle = "#05070c";
    ctx.fillRect(0, 0, W, H);

    /* 1. vertical ICE bands */
    var fx = smoothFocus * W;
    for(var i = 0; i < phases.length; i++){
      var x = i * BAND_W;
      var breathe = 0.5 + 0.5 * Math.sin(t * 0.9 + phases[i]);
      var near = Math.exp(-Math.pow(x - fx, 2) / (2 * Math.pow(W * 0.09, 2)));
      var a = 0.05 + breathe * 0.09 + near * energy * 0.5;
      var hot = near * energy;
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0,    "rgba(255," + (40 + hot*90).toFixed(0) + "," + (60 + hot*70).toFixed(0) + "," + (a*0.35).toFixed(3) + ")");
      g.addColorStop(0.55, "rgba(" + (190 + hot*65).toFixed(0) + "," + (18 + hot*60).toFixed(0) + "," + (40 + hot*50).toFixed(0) + "," + a.toFixed(3) + ")");
      g.addColorStop(1,    "rgba(90,6,22," + (a*0.5).toFixed(3) + ")");
      ctx.fillStyle = g;
      ctx.fillRect(x, 0, BAND_W - 2, H);

      /* lit cell: data grain, not a rain of glyphs */
      if(seeds[i] > 0.72){
        var cy = ((t * (18 + seeds[i]*26) + seeds[i]*H) % (H + 60)) - 30;
        ctx.fillStyle = "rgba(255," + (90 + hot*120).toFixed(0) + "," + (110 + hot*90).toFixed(0) + "," + (0.16 + hot*0.5).toFixed(3) + ")";
        ctx.fillRect(x, cy, BAND_W - 2, 2 + seeds[i]*10);
      }
    }

    /* 2. the sweep — the wall auditing itself */
    var sweepY = RM ? H * 0.42 : (t * SWEEP_SPEED) % (H + 200) - 100;
    var sg = ctx.createLinearGradient(0, sweepY - 70, 0, sweepY + 8);
    sg.addColorStop(0, "rgba(255,47,69,0)");
    sg.addColorStop(1, "rgba(255,90,110," + (0.1 + energy*0.12).toFixed(3) + ")");
    ctx.fillStyle = sg;
    ctx.fillRect(0, sweepY - 70, W, 78);
    ctx.fillStyle = "rgba(255,180,190," + (0.25 + energy*0.3).toFixed(3) + ")";
    ctx.fillRect(0, sweepY, W, 1);

    /* 3. glitch slices: displaced cut + cyan ghost */
    if(!RM){
      var slices = 1 + Math.floor(energy * 3);
      for(var s = 0; s < slices; s++){
        var seed = Math.sin(Math.floor(t * 3.2) * 91.7 + s * 37.3);
        if(seed < 0.55) continue;
        var sy = ((seed * 10) % 1) * H;
        var sh = 4 + ((seed * 100) % 1) * 26;
        var dx = (seed > 0.8 ? 1 : -1) * (6 + energy * 42);
        ctx.drawImage(canvas, 0, sy*dpr, W*dpr, sh*dpr, dx, sy, W, sh);
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = "rgba(0," + (120 + energy*80).toFixed(0) + "," + (150 + energy*90).toFixed(0) + "," + (0.05 + energy*0.1).toFixed(3) + ")";
        ctx.fillRect(dx * -0.6, sy, W, sh);
        ctx.globalCompositeOperation = "source-over";
      }
    }
    if(!RM) raf = requestAnimationFrame(draw);
  }

  resize();
  addEventListener("resize", function(){ resize(); if(RM) draw(0) });
  document.addEventListener("visibilitychange", function(){
    cancelAnimationFrame(raf);
    if(!document.hidden && !RM) raf = requestAnimationFrame(draw);
  });
  raf = requestAnimationFrame(draw);
  if(RM) draw(0);

  /* the wall destabilises under the pointer */
  addEventListener("pointermove", function(e){
    focusTarget = e.clientX / Math.max(1, innerWidth);
  }, {passive:true});

  /* pre-breach the wall is awake; after crossing it settles down */
  energyWant = 0.55;


  /* ════════════════════════════════════════════════════════════════
     ACT I — THE BLACKWALL IN 3D
     A raymarched wall of extruded cells. Light bleeds from the gaps
     between cells, a scan plane climbs it, and the floor reflects into
     fog. No external library: the CSP blocks CDNs, and a fragment
     shader weighs less than a 3D engine anyway.
     ════════════════════════════════════════════════════════════════ */
  var VERT = [
    "attribute vec2 p;",
    "void main(){ gl_Position = vec4(p, 0.0, 1.0); }"
  ].join("\n");

  var FRAG = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "uniform vec2      uRes;",
    "uniform float     uT;",
    "uniform vec2      uM;",
    "uniform float     uEntry;",   /* 0 = deep in the Old Net, 1 = at the wall */
    "uniform float     uAppr;",
    "uniform float     uCross;",
    "uniform float     uReveal;",
    "uniform vec4      uTarget;",
    "uniform sampler2D uPhoto;",
    "uniform float     uHasPhoto;",
    "",
    "float h11(float x){ return fract(sin(x * 127.13) * 43758.5453); }",
    "float h21(vec2 p){",
    "  p = fract(p * vec2(127.31, 311.7));",
    "  p += dot(p, p + 34.42);",
    "  return fract(p.x * p.y);",
    "}",
    "float vn(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  float a = h21(i), b = h21(i + vec2(1.0, 0.0));",
    "  float c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));",
    "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
    "}",
    "float ridged(vec2 p){",
    "  float s = 0.0, a = 0.6, f = 1.0;",
    "  for(int i = 0; i < 2; i++){",
    "    float n = vn(p * f);",
    "    n = 1.0 - abs(n * 2.0 - 1.0);",
    "    s += n * n * a;",
    "    a *= 0.5; f *= 2.2;",
    "  }",
    "  return s;",
    "}",
    "float h31(vec3 p){",
    "  return fract(sin(p.x * 127.1 + p.y * 311.7 + p.z * 74.7) * 43758.5453);",
    "}",
    "float sdBox(vec3 p, vec3 b){",
    "  vec3 q = abs(p) - b;",
    "  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);",
    "}",
    /* Old Net lattice: sparse emissive blocks. Empty cells are pushed a whole
       cell away so the ray sails through them. */
    /* The lattice lives only in z [-159, -75]. Bounding it in space is what
       lets the camera leave it behind and cross real darkness before the wall,
       instead of the scene being switched out from under the viewer. */
    "const float NET_MID = 350.0;",
    "const float NET_HALF = 320.0;",
    "float netMap(vec3 p, out float seed){",
    "  vec3 id = floor(p / 7.5);",
    "  float r = h31(id);",
    "  seed = r;",
    "  vec3 q = p - (id + 0.5) * 7.5;",
    "  float rad = max(abs(p.x), abs(p.y));",
    "  float ori = r * 3.0;",
  "  float L = 1.9 + fract(r * 7.3) * 2.6;",
  "  float T = 0.16 + fract(r * 3.1) * 0.24;",
  "  vec3 b = (ori < 2.2) ? vec3(L, T, L) : vec3(T, L * 0.7, T);",
    "  float d = sdBox(q, b);",
    "  if(r > 0.80) d += 7.5;",
    /* carve the corridor: the camera flies down an open channel */
    "  d = max(d, 5.6 - rad);",
    /* outside the band, report the distance to the band so the ray skips ahead */
    "  float band = abs(p.z - NET_MID) - NET_HALF;",
    "  return max(d, band);",
    "}",
    "float ss(float e0, float e1, float x){",
    "  float k = clamp((x - e0) / (e1 - e0), 0.0, 1.0);",
    "  return k * k * (3.0 - 2.0 * k);",
    "}",
    "",
    "const float FLOOR_Y = -2.6;",
    "const float LINE_SP = 1.40;",
    "const vec3  HOT  = vec3(1.00, 0.06, 0.36);",
    "const vec3  COLD = vec3(0.14, 0.52, 1.00);",
    "const vec3  PALE = vec3(0.80, 0.92, 1.00);",
    "",
    "void main(){",
    "  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;",
    "  float H2 = uRes.y * 0.5;",
    "",
    "  float band = floor(gl_FragCoord.y / 7.0);",
    "  float burst = step(0.968, h21(vec2(floor(uT * 3.4), 7.7)));",
    "  float gk = h21(vec2(band, floor(uT * 14.0)));",
    "  uv.x += step(0.88, gk) * (gk - 0.5) * 0.05 * (burst + uCross * 2.0);",
    "",
    /* A single path in Z. The entry flight covers the lattice and the darkness
       past it; scroll covers the approach. No branch, so no cut. */
    "  float adv = mix(0.0, 908.0, uEntry)",
    "            + (mix(0.0, 19.0, uAppr) + uCross * uCross * 22.0) * uEntry;",
    "  float wallZ = 930.0 - adv;",
    "  float fov = 1.40 - uCross * 0.24;",
    "  vec3  ro  = vec3(uM.x * 0.9, 0.5 + uM.y * 0.4, -6.0);",
    /* PITCH tilts the view up so the horizon sits at ~64% of frame height
       instead of dead centre, which is how the wall gets to own the frame. */
    "  vec3  rd  = normalize(vec3(uv.x * fov, uv.y * fov + 0.12, 1.0));",
    "",
    /* ── Old Net lattice, gathered as a layer. Marched only while the camera
          is anywhere near the band — that test is uniform, so no divergence. ── */
    "  vec3 netCol = vec3(0.0);",
    "  float netA = 0.0;",
    "  if(adv < 700.0){",
    "    float tn = 0.0, sd = 0.0, sdh = 0.0, hitn = 0.0;",
    "    for(int i = 0; i < 44; i++){",
    "      vec3 p = ro + rd * tn;",
    "      float d = netMap(vec3(p.x, p.y, p.z + adv), sd);",
    "      if(d < 0.02 + tn * 0.0025){ hitn = 1.0; sdh = sd; break; }",
    "      tn += max(d * 0.85, 0.03);",
    "      if(tn > 720.0) break;",
    "    }",
    "    if(hitn > 0.5){",
    "      vec3 p = ro + rd * tn;",
    "      vec3 po = vec3(p.x, p.y, p.z + adv);",
    "      vec3 id = floor(po / 7.5);",
    "      vec3 q = po - (id + 0.5) * 7.5;",
    "      float ori = sdh * 3.0;",
  "      float L = 1.9 + fract(sdh * 7.3) * 2.6;",
  "      float T = 0.16 + fract(sdh * 3.1) * 0.24;",
  "      vec3 b = (ori < 2.2) ? vec3(L, T, L) : vec3(T, L * 0.7, T);",
    /* second-smallest face slack marks an edge, where the glow lives */
    "      vec3 sl = b - abs(q);",
    "      float mn = min(sl.x, min(sl.y, sl.z));",
    "      float mx = max(sl.x, max(sl.y, sl.z));",
    "      float mid = sl.x + sl.y + sl.z - mn - mx;",
    "      float edge = exp(-max(mid, 0.0) * 5.5);",
    "      float lit = 0.5 + 0.5 * sin(uT * 1.3 + sdh * 40.0);",
    /* Which face are we looking at? The axis with the smallest slack. Each gets
       its own brightness, so a box reads as a lit solid instead of a wire
       outline — the blocks were coming out as dark wireframes. */
    "      float face = (abs(sl.x - mn) < 0.0001) ? 1.00",
    "                 : ((abs(sl.y - mn) < 0.0001) ? 0.55 : 0.78);",
    "      netCol = vec3(0.10, 0.82, 0.96) * (0.11 + 0.20 * sdh) * face * lit",
    "             + vec3(0.45, 0.98, 1.00) * edge * (0.85 + 0.75 * lit);",
    /* fade the block out over its last stretch of distance rather than
       popping when the ray limit is hit */
    "      netCol *= exp(-tn * 0.017);",
    "      netA = ss(300.0, 190.0, tn);",
    /* and fade the whole field out as the camera leaves the band, otherwise
       dimly-lit blocks linger through the darkness that should be empty */
    "      float netFade = ss(834.0, 690.0, adv);",
    "      netA *= netFade;",
    "      netCol *= netA;",
    "    }",
    "  }",
    /* the beam belongs to the lattice: it fades as the lattice is left behind */
    /* The seam never goes out. It used to be gated to the tunnel and cut to
       zero on exit, so it vanished and then the wall grew back in on its own —
       hence the blink. Now it widens and brightens continuously from mid-tunnel
       until the wall itself arrives. */
    /* The window the wall is revealed through: a thin slit on the horizon that
       opens vertically. The threads inside it are the wall's own, which is why
       the seam looks textured rather than like a painted glow. */
    "  float grow = ss(360.0, 860.0, adv);",
    "  float slit = exp(-abs(uv.y + 0.02) * mix(62.0, 2.2, grow));",
    "  float winOpen = mix(slit, 1.0, ss(0.86, 1.0, grow));",
    /* and a soft halo bleeding out of the slit, strongest while it is narrow */
    /* The halo starts at zero. It had a 0.30 floor, which bled red into the
       empty space between the tunnel blocks for the whole flight — those gaps
       must stay pure black until the seam actually opens. */
    "  netCol += vec3(1.0, 0.16, 0.42) * slit * (pow(grow, 1.5) * 0.95)",
    "            * (1.0 - ss(0.80, 1.0, grow) * 0.75);",
    "",
    /* ── floor of scattered dots, in perspective ── */
    "  vec3 floorCol = vec3(0.0);",
    "  if(rd.y < -0.0005){",
    "    float tg = (FLOOR_Y - ro.y) / rd.y;",
    "    if(tg > 0.0 && tg < 200.0){",
    "      vec3 gp = ro + rd * tg;",
    /* The dots share the thread grid in X. That alignment is what makes them
       read as radial rows running out from the foot of each thread, which is
       the thing an independent scattered grid could never reproduce. */
        /* match the wall's subdivision level so the rows continue its threads.
       Derived from the wall distance, not per-ray, so the whole floor shares
       one grid. */
    "      float pitchW = (LINE_SP / (fov * max(wallZ - ro.z, 0.001))) * H2;",
    "      float spW = LINE_SP / exp2(floor(max(log2(max(pitchW / 30.0, 1.0)), 0.0)));",
    "      vec2 cc = vec2(gp.x / spW, (gp.z + adv) / 0.44);",
    "      vec2 cid = floor(cc);",
    "      float r = h21(cid);",
    "      vec2 f = cc - cid - 0.5;",
    /* square dots, not gaussian smudges */
    "      float hw = 0.17 / spW * 0.5;",
    "      float hh = 0.15 / 0.44 * 0.5;",
    "      float sx = clamp((hw - abs(f.x)) / (hw * 0.55), 0.0, 1.0);",
    "      float sz = clamp((hh - abs(f.y)) / (hh * 0.55), 0.0, 1.0);",
    "      float d0 = sx * sz * step(0.12, r);",
    "      d0 *= 0.5 + 0.5 * sin(uT * 1.7 + r * 52.0 - gp.z * 0.4);",
    /* distant dot rows fall below a pixel: fade to their mean, do not alias */
    "      float aaD = clamp((spW / (fov * max(tg, 0.001))) * H2 / 2.0, 0.0, 1.0);",
    "      d0 = 0.14 * (1.0 - aaD) + d0 * aaD;",
    "      float bl = clamp(uAppr * 1.2 - 0.35, 0.0, 1.0);",
    /* exp(-tg) alone put the dots brightest under the camera and dimmest at
       the wall — backwards. Concentrate them where the wall stands. */
    /* Hard-limited to a region around the wall. Between the block field and
       the wall the floor is bare — the dots do not carpet the approach. */
    "      float ownZ = gp.z + adv;",
    /* Outside face only. The band was centred on the wall (850..890) so half
       the dots sat past it — behind the barrier, where nothing should be. The
       curtains span own 930..935, so the floor has to stop before 930. */
    "      float region = ss(913.0, 924.0, ownZ) * ss(930.0, 926.0, ownZ);",
    "      float att = region * exp(-abs(ownZ - 930.0) * 0.110) * exp(-tg * 0.011);",
    "      floorCol = mix(HOT, COLD, bl * r) * d0 * 3.4 * att;",
    "    }",
    "  }",
    "",
    /* ── the figure, gathered now and composited behind the threads ── */
    "  float FZ = 4.8;",
    "",
    /* ── five curtains of threads, front to back ── */
    "  vec3 curtCol = vec3(0.0);",
    "  float trans = 1.0;",
    "  for(int k = 0; k < 1; k++){",
    "    float fk = float(k);",
    /* Perpendicular depth to the wall plane. tc is the ray length, 2.7x longer
       at the frame edge, which dimmed and crowded the sides. */
    "    float dw = wallZ + fk * 3.2 - ro.z;",
    "    float tc = dw / rd.z;",
    "    if(tc <= 0.0) continue;",
    "    vec3 p = ro + rd * tc;",
    "    if(p.y < FLOOR_Y) continue;",
    "",
    /* No sway. The floor rows share this exact grid, so any horizontal
       displacement here slides them out of alignment — which is precisely
       what made the dashes drift off the threads. */
    "    float x = p.x;",
    "    x += sign(p.x) * exp(-p.x * p.x * 0.010) * (uAppr * 0.12 + uCross * 3.0);",
    "",
    "    float id = floor(x / LINE_SP);",
    "    float r2 = h11(id * 3.77 + fk * 13.0);",
    "",
    /* Continuous LOD. Fixed subdivision levels miss at both ends: measured on
       the CPU renderer, at distance they subdivide down to ~1.8px (sub-pixel
       noise) and up close they only reach ~21px (fat bars). Pick the level
       whose projected pitch lands near TARGET and blend with its neighbour, so
       apparent thread density stays constant at every distance. Two samples,
       not five — cheaper as well as more correct. */
    "    float pitch0 = (LINE_SP / (fov * max(dw, 0.001))) * H2;",
    "    float lod = max(log2(max(pitch0 / 30.0, 1.0)), 0.0);",
    "    float lo = floor(lod);",
    "    float lfrac = lod - lo;",
    "    float line = 0.0, core = 0.0, rsum = 0.0, wsum = 0.000001;",
    "    for(int wi = 0; wi < 2; wi++){",
    "      float lv = lo + float(wi);",
    "      float wgt = (wi == 0) ? (1.0 - lfrac) : lfrac;",
    "      if(wgt < 0.002) continue;",
    "      float sp = LINE_SP / exp2(lv);",
    "      float pitch = pitch0 / exp2(lv);",
    "      float idl = floor(x / sp);",
    "      float fxl = (x / sp - idl - 0.5) * sp;",
    "      float rr = h11(idl * 1.31 + fk * 71.0 + lv * 211.0);",
    "      float w = sp * 0.090;",
    "      float c0 = exp(-(fxl * fxl) / (w * w));",
    "      float h0 = exp(-(fxl * fxl) / (w * w * (9.0 + fk * 16.0))) * (0.07 + fk * 0.055);",
    "      float aal = clamp(pitch / 2.2, 0.0, 1.0);",
    "      float meanl = 0.090 * 1.7724539 * (1.0 + (0.07 + fk * 0.055) * sqrt(9.0 + fk * 16.0));",
    "      line += (meanl + ((c0 + h0) - meanl) * aal) * wgt;",
    "      core += c0 * wgt;",
    "      rsum += rr * wgt;",
    "      wsum += wgt;",
    "    }",
    "    float r  = rsum / wsum;",
    "    float aa = clamp(pitch0 / 2.2, 0.0, 1.0);",
    "",
    "    float dash = 0.72 + 0.28 * aa * sin(p.y * 0.85 - uT * 2.1 + r * 40.0);",
    /* Every thread is red. What is blue is a WAVE sweeping across the wall.
       Explicit travelling bands, not noise thresholds: measured on the CPU
       renderer, noise fired so rarely it produced 1% cool pixels — invisible
       as motion. Two sines at different rates, roughened by a little noise so
       the banding is not mechanical. */
    "    float b1 = 0.5 + 0.5 * sin(p.x * 0.095 - uT * 0.30 + fk * 2.1);",
    "    float b2 = 0.5 + 0.5 * sin(p.x * 0.038 + uT * 0.12 + fk * 1.3);",
    /* max(), not a sum: two summed smoothsteps reached 1.85 before the clamp,
       so the "wave" blanketed the wall and everything read blue. And a higher
       spatial frequency, because at 0.042 a single band filled the screen once
       the visible span shrank to a few units up close. */
    "    float wave = max(ss(0.74, 0.96, b1), ss(0.80, 0.98, b2) * 0.9);",
    "    wave *= 0.75 + 0.5 * vn(vec2(p.x * 0.09, fk * 5.0 + uT * 0.05));",
    "    wave = clamp(wave, 0.0, 1.0);",
    /* No approach bloom: the blue is the wave and nothing else. And the tint
       is capped — in the reference the waves read violet over magenta, not
       saturated blue. */
    "    float cold = clamp(wave * 0.60 + uCross * 0.45, 0.0, 1.0);",
    "    float br = 0.80 + r * 0.30;",
    /* A wave LIGHTS the thread it crosses. Tinting alone darkened it: the
       cold colour carries a low red channel. */
    /* the wave lights its thread, but must not out-shine the wall: at 0.90
       the few blue threads became the brightest thing on screen and dominated
       the read even while a minority of pixels */
    "    br *= 1.0 + wave * 0.40;",
    "    br += step(0.76, r2) * 2.8 * r2;",           /* the occasional blazing thread */
    "    br *= 0.72 + 0.28 * sin(uT * 0.66 + r * 37.0);",
    "    br *= ss(70.0, 14.0, p.y);",
    "    br *= ss(FLOOR_Y - 0.2, FLOOR_Y + 1.4, p.y);",
    "",
    /* Equal curtains at different depths each project their own spacing and
       cross each other, which is what destroyed the rhythm. One leads. During
       the crossing the back ones lift, or the passage goes dark once the camera
       clears the front curtain. */
    "    float base = pow(0.68, fk);",
    "    float fade = (base + (1.0 - base) * uCross * 0.85) * exp(-dw * 0.020);",
    "    float a   = line * br * fade;",
    "    float occ = core * br * fade;",
    "",
    /* colour is spatial: cold at the centre, hot at the edges */
    "    vec3 c = mix(HOT, COLD, cold);",
    "    c = mix(c, PALE, cold * cold * r * 0.7);",
    "    curtCol += c * a * dash * trans;",
    "    trans   *= 1.0 - min(occ * 0.62, 0.95);",
    "  }",
    "",
    /* the wall and its floor are seen through the opening slit */
    /* Gate on `grow` as well as the slit. With grow = 0 the slit still equals 1
       at uv.y = 0, so the distant curtains were rendered in the centre band and
       their diffuse red filled what should be pure black for the whole flight.
       The wall does not exist until the seam starts to open. */
    "  float wallIn = ss(0.10, 0.55, grow);",
    "  vec3 col = (floorCol + curtCol) * winOpen * wallIn;",
    /* the lattice is nearer than the wall whenever it exists, so it occludes */
    "  col = col * (1.0 - clamp(netA, 0.0, 1.0)) + netCol;",
    "",
    /* ── the photograph, landing on the Act II rectangle ── */
    "  if(uHasPhoto > 0.5 && uReveal > 0.001){",
    "    float s = max(wallZ - ro.z, 0.001);",
    /* photo box follows the figure's new scale/lift: centre -0.10*1.95+0.48,
       half-size 0.623*1.95 x 0.85*1.95 */
    "    vec2 srcC = (vec2(0.0, 0.285) - ro.xy) / (fov * s);",
    "    vec2 srcH = vec2(1.215, 1.658) / (fov * s);",
    "    float k2 = ss(0.28, 0.96, uCross);",
    "    vec2 cN = mix(srcC, uTarget.xy, k2);",
    "    vec2 hN = max(mix(srcH, uTarget.zw, k2), vec2(0.001));",
    "    vec2 puv = (uv - cN) / hN * 0.5 + 0.5;",
    "    puv.y = 1.0 - puv.y;",
    "    puv += (vec2(vn(uv * 9.0 + uT * 0.2), vn(uv * 9.0 + 9.3)) - 0.5) * (1.0 - uReveal) * 0.045;",
    "    vec2 ok = step(vec2(0.0), puv) * step(puv, vec2(1.0));",
    "    vec3 ph = texture2D(uPhoto, clamp(puv, 0.0, 1.0)).rgb;",
    "    float m = ok.x * ok.y * k2 * uReveal;",
    "    col = mix(col, ph * 1.20, m);",
    "  }",
    "",
    /* ── void: at distance the wall is swallowed by black ── */
    "  float d2 = dot(uv, uv);",
    /* Keyed to max(uAppr, grow), not uAppr. The tight 2.2 vignette belongs to
       the tunnel flight, but uAppr is still 0 when the wall finishes arriving,
       so the wall inherited it and lost its outer thirds. grow reaches 1 with
       the wall, which opens the frame at exactly the right moment. */
    "  float vOpen = max(uAppr, grow);",
    "  float vf = exp(-d2 * mix(2.2, 0.26, vOpen));",
    "  col *= vf + (1.0 - vf) * 0.05;",
    /* 1.10 crosses zero at |uv| = 0.95, inside a 16:9 frame -- that was the
       hard black bar down each side, not a falloff. */
    "  col *= 1.0 - d2 * mix(1.10, 0.16, vOpen);",
    "",
    "  col += PALE * exp(-pow((uCross - 0.62) / 0.14, 2.0)) * 0.8;",
    /* push colour away from its own luminance: the wall reads as lit glass,
       not tinted grey */
    "  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));",
    "  col = luma + (col - luma) * 1.35;",
    "  col *= 0.93 + 0.07 * sin(gl_FragCoord.y * 1.9);",
    "  col += (h21(gl_FragCoord.xy + fract(uT) * 91.0) - 0.5) * 0.025;",
    "",
    "  gl_FragColor = vec4(max(col, 0.0), 1.0);",
    "}"
  ].join("
");

  var glc = $("#gl"), gl = null, prog = null, uni = {}, glRaf = 0;
  var crossT = 0, crossTarget = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
  /* charge = how hard you are pushing against the wall (0..1). It decays
     when you stop, so the crossing has to be earned in one sustained push. */
  var charge = 0, chargeT = 0, autoCharge = false;
  /* The entry flight runs itself; scroll does nothing until it lands. */
  var entry = 0, entryDone = false, entryT0 = 0;
  var ENTRY_MS = 4400;

  function sh(type, src){
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
  var photoTex = null, photoReady = false;
  function loadPhoto(){
    var el = document.querySelector(".ph img");
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
  var target = [-0.28, 0.02, 0.075, 0.102];   /* sane default if measuring fails */
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
  function glFrame(ms){
    if(!gl) return;
    if(!glT0) glT0 = ms;
    var t = (ms - glT0) / 1000;
    /* inertia on the pointer: the wall is heavy */
    mx += (tmx - mx) * 0.055;
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
    addEventListener("resize", function(){ glResize(); measureTarget() });
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

  /* ════════════════════════════════════════════════════════════════
     LANGUAGE
     ════════════════════════════════════════════════════════════════ */
  var isPT = true;
  function localise(){
    $$("[data-en]").forEach(function(el){
      if(el.dataset.pt === undefined) el.dataset.pt = el.innerHTML;
      el.innerHTML = isPT ? el.dataset.pt : el.dataset.en;
    });
    document.documentElement.lang = isPT ? "pt-BR" : "en";
    $("#lang").innerHTML = isPT ? "<b>PT</b> / EN" : "PT / <b>EN</b>";
  }
  $("#lang").addEventListener("click", function(){ isPT = !isPT; localise(); buildSkills(); buildShards(); });

  /* ════════════════════════════════════════════════════════════════
     ACT I — the handshake terminal, then the breach
     ════════════════════════════════════════════════════════════════ */
  var LINES_PT = [
    ['> ', 'sondando perímetro blackwall'],
    ['> ', 'ICE <span class="w">ativo</span> · camada 3'],
    ['> ', '<span class="w">[!]</span> presença detectada do outro lado'],
    ['> ', 'forma <span class="k">humanoide</span> · sinal fraco'],
    ['> ', 'aproxime-se para identificar <span class="a">— role</span>']
  ];
  var LINES_EN = [
    ['> ', 'probing blackwall perimeter'],
    ['> ', 'ICE <span class="w">active</span> · layer 3'],
    ['> ', '<span class="w">[!]</span> presence detected on the far side'],
    ['> ', '<span class="k">humanoid</span> shape · weak signal'],
    ['> ', 'close in to identify <span class="a">— scroll</span>']
  ];
  /* appended once the face resolves — the reveal lands in the log too */
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

  var term = $("#term"), typing = null;
  function typeLines(){
    clearTimeout(typing);
    term.innerHTML = "";
    idDone = false;          /* the reveal line must survive a language switch */
    var set = isPT ? LINES_PT : LINES_EN;
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

  var gate = $("#gate"), crossed = false;
  function cross(){
    if(crossed) return;
    crossed = true;
    clearTimeout(typing);
    /* the shader flies the camera through the wall; the overlay just clears */
    crossTarget = 1;
    autoCharge = false;
    energyWant = 1.4;
    document.body.classList.add("breaching");
    var wait = RM ? 0 : 3200;
    setTimeout(function(){
      gate.classList.add("gone");
      document.body.classList.remove("breaching");
      document.body.classList.add("through");
      glStop();                             /* GL is Act I only — stop paying for it */
      energyWant = 0.2;                     /* the 2D wall settles behind the content */
      scrollTo({top:0, behavior:"auto"});
      observe();
    }, wait);
  }
  /* The wall resists. Every push adds charge; letting go lets it drain.
     Reaching full charge is what opens the tear — one gesture never does. */
  var meter = $("#meter"), meterFill = $("#meter-i"), meterTxt = $("#meter-t");
  var PUSH = 1 / 1900;   /* ~1900px of scroll, one way */

  function push(amount){
    if(crossed || !entryDone) return;   /* the entry is not skippable by scroll */
    chargeT = Math.min(1, chargeT + amount);
  }
  function setMeter(v){
    if(!meterFill) return;
    meterFill.style.transform = "scaleX(" + v.toFixed(3) + ")";
    meter.classList.toggle("hot", v > 0.03);
    if(meterTxt) meterTxt.textContent = Math.round(v * 100) + "%";
  }

  addEventListener("wheel", function(e){
    if(e.deltaY > 0) push(e.deltaY * PUSH);   /* upward wheel is ignored, not reversed */
  }, {passive:true});

  addEventListener("keydown", function(e){
    if(crossed) return;
    if(e.key === "ArrowDown" || e.key === "PageDown" || e.key === " "){ push(0.085); e.preventDefault() }
    else if(e.key === "Enter"){ autoCharge = true }
  });

  var touchY = null;
  addEventListener("touchstart", function(e){ touchY = e.touches[0].clientY }, {passive:true});
  addEventListener("touchmove", function(e){
    if(crossed || touchY === null) return;
    var y = e.touches[0].clientY;
    if(touchY - y > 0) push((touchY - y) * PUSH * 2.2);
    touchY = y;
  }, {passive:true});

  /* the button does the pushing for you — nobody is forced to scroll */
  $("#breach").addEventListener("click", function(){ autoCharge = true });
  $("#skip").addEventListener("click", function(){ chargeT = 1 });

  /* ════════════════════════════════════════════════════════════════
     CONTENT BUILT FROM DATA (so PT/EN never drift out of sync)
     ════════════════════════════════════════════════════════════════ */
  var SKILLS = [
    {n:"SQL", tag:"postgresql · sql server", v:9,
     pt:"T-SQL avançado: joins, subconsultas, CTEs, DDL, chaves e relacionamentos. O catálogo de 292 queries do BlackWall mora aqui. <em>Produção, diário.</em>",
     en:"Advanced T-SQL: joins, subqueries, CTEs, DDL, keys and relationships. The 292-query BlackWall catalogue lives here. <em>Production, daily.</em>"},
    {n:"Python", tag:"pandas · numpy · fastapi", v:8,
     pt:"Pandas, NumPy, Matplotlib, Jupyter. Pipelines orientados a objeto; FastAPI no backend do BlackWall. <em>Produção, diário.</em>",
     en:"Pandas, NumPy, Matplotlib, Jupyter. Object-oriented pipelines; FastAPI on the BlackWall backend. <em>Production, daily.</em>"},
    {n:"pt:Automação|en:Automation", tag:"graph api · telegram · bots", v:8,
     pt:"Dois bots Telegram em produção, integração Graph API, e a rotina que saiu de 1–2 dias para 5–10 minutos. <em>Produção, com plantão.</em>",
     en:"Two Telegram bots in production, Graph API integration, and the routine that went from 1–2 days to 5–10 minutes. <em>Production, on call.</em>"},
    {n:"BI", tag:"power bi · betmetrica", v:7,
     pt:"Power BI, BetMetrica, Matplotlib — e conferir um número em quatro fontes antes de ele chegar numa tela. <em>Produção, semanal.</em>",
     en:"Power BI, BetMetrica, Matplotlib — and cross-checking one number across four sources before it reaches a screen. <em>Production, weekly.</em>"},
    {n:"pt:Infra|en:Infra", tag:"docker · nginx · linux · git", v:6,
     pt:"Docker Compose e nginx no BlackWall, Linux (Ubuntu/WSL), Git. Airflow e MongoDB são <em>certificados, ainda não em produção</em> — prefiro dizer.",
     en:"Docker Compose and nginx on BlackWall, Linux (Ubuntu/WSL), Git. Airflow and MongoDB are <em>certified, not yet in production</em> — I would rather say so."}
  ];
  function pick(s){
    if(s.indexOf("pt:") !== 0) return s;
    var m = s.split("|");
    return (isPT ? m[0].slice(3) : m[1].slice(3));
  }
  function buildSkills(){
    var box = $("#sk"); box.innerHTML = "";
    SKILLS.forEach(function(s, idx){
      var row = document.createElement("div");
      row.className = "sk__row";
      row.setAttribute("data-r", "");
      row.style.setProperty("--i", idx);
      var pips = "";
      for(var k = 0; k < 10; k++){
        pips += '<i class="' + (k < s.v ? "f" : "") + '" style="--k:' + k + '"></i>';
      }
      row.innerHTML =
        '<div class="sk__t"><span class="sk__n">' + pick(s.n) + ' <i>· ' + s.tag + '</i></span>' +
        '<span class="sk__v">' + s.v + '</span></div>' +
        '<div class="sk__b">' + pips + '</div>' +
        '<p class="sk__d">' + (isPT ? s.pt : s.en) + '</p>';
      box.appendChild(row);
    });
  }

  var SHARDS = [
    {g:"a", pt:["Apache Airflow","orquestrando seu primeiro pipeline"], en:["Apache Airflow","orchestrating your first pipeline"]},
    {g:"a", pt:["Pipeline de dados + OO","python, orientação a objeto"],  en:["Data pipeline + OOP","python, object orientation"]},
    {g:"a", pt:["Pipeline: MongoDB + MySQL","integração python"],         en:["Pipeline: MongoDB + MySQL","python integration"]},
    {g:"b", pt:["SQL Server 2022","consultas avançadas"],                 en:["SQL Server 2022","advanced queries"]},
    {g:"b", pt:["SQL Server 2022","conhecendo SQL"],                      en:["SQL Server 2022","getting to know SQL"]},
    {g:"b", pt:["Modelagem relacional","entendendo SQL"],                 en:["Relational modelling","understanding SQL"]},
    {g:"b", pt:["MongoDB","um banco NoSQL"],                              en:["MongoDB","a NoSQL database"]},
    {g:"b", pt:["Python e APIs","a biblioteca requests"],                 en:["Python and APIs","the requests library"]},
    {g:"b", pt:["Python para Dados","funções, estruturas, exceções"],     en:["Python for Data","functions, structures, exceptions"]},
    {g:"b", pt:["Python para Dados","primeiros passos"],                   en:["Python for Data","getting started"]},
    {g:"c", pt:["PHP","criando sua aplicação"],                           en:["PHP","creating your application"]},
    {g:"c", pt:["PHP","organize seu código"],                             en:["PHP","organised code"]}
  ];
  function buildShards(){
    var box = $("#shs"); box.innerHTML = "";
    SHARDS.forEach(function(s){
      var a = document.createElement("a");
      a.className = "sh sh--" + s.g;
      a.href = "#0";
      a.dataset.g = s.g;
      var txt = isPT ? s.pt : s.en;
      a.innerHTML = "<h4>" + txt[0] + "</h4><p>Alura · " + txt[1] + "</p>";
      box.appendChild(a);
    });
  }
  $$("#filt button").forEach(function(b){
    b.addEventListener("click", function(){
      $$("#filt button").forEach(function(x){ x.setAttribute("aria-pressed", x === b ? "true" : "false") });
      $$("#shs .sh").forEach(function(c){
        c.style.display = (b.dataset.f === "all" || c.dataset.g === b.dataset.f) ? "" : "none";
      });
    });
  });

  /* ════════════════════════════════════════════════════════════════
     SCROLL: section reveals, active nav, and the wall reacting
     ════════════════════════════════════════════════════════════════ */
  var io = null, io2 = null;
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
  addEventListener("scroll", function(){
    if(!crossed) return;
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? scrollY / max : 0;
    energyWant = 0.16 + Math.abs(p - 0.5) * 0.34;
  }, {passive:true});

  /* ════════════════════════════════════════════════════════════════
     BOOT
     ════════════════════════════════════════════════════════════════ */
  buildSkills();
  buildShards();
  localise();
  /* typeLines() now fires when the entry flight lands */
})();
