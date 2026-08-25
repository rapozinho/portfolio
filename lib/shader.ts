/* GLSL ES 1.0, hand-written. No Three.js: a fragment shader weighs less than a
   3D engine, and the prototype's CSP blocked CDNs anyway. Kept as a string array
   because that is how it was validated -- prototipo/check_shader.py reconstructs
   the source from exactly this shape and checks brace balance, uniform parity and
   redeclared locals. A GLSL compile error renders a black screen with no other
   symptom, so that check is not optional. */
export const VERT = [
  "attribute vec2 p;",
  "void main(){ gl_Position = vec4(p, 0.0, 1.0); }"
].join("\n");

export const FRAG = [
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
  /* The origin does not move. uM.x turns the view instead of sliding it:
     sliding sideways was parallax against a static-viewpoint scene, which is
     the one thing this composition is not allowed to do. */
  "  vec3  ro  = vec3(0.0, 0.5 + uM.y * 0.4, -6.0);",
  /* PITCH tilts the view up so the horizon sits at ~64% of frame height
     instead of dead centre, which is how the wall gets to own the frame. */
  "  vec3  rd  = normalize(vec3(uv.x * fov, uv.y * fov + 0.12, 1.0));",
  /* Yaw about Y, up to +/-0.62 rad (~35 deg). Damped to zero through the
     crossing: the photo match cut is measured in screen space against a
     forward view, so a turned camera would land the face off its rectangle. */
  "  float yaw = uM.x * 0.55 * (1.0 - uCross);",
  "  float cy = cos(yaw), sy = sin(yaw);",
  "  rd = vec3(rd.x * cy + rd.z * sy, rd.y, rd.z * cy - rd.x * sy);",
  /* the view axis after turning, so depth can be measured along it */
  "  vec3  fwd = vec3(sy, 0.0, cy);",
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
  /* ── the seam, in four phases ──────────────────────────────────────
     One curve per phase instead of one `grow` driving everything, so the line
     can hold its hard edge while the band is already expanding behind it. */
  "  float grow  = ss(360.0, 860.0, adv);",
  /* grow saturates before the flight ends, which crams the last three beats into
     its final 2%. uEntry is the eased progress, so undoing the easing recovers a
     value linear in time, and every constant below is just the reference's
     millisecond over 2600. */
  "  float kt = 1.0 - pow(max(1.0 - uEntry, 0.0001), 0.71429);",
  "  float sp = clamp((kt - 0.3027) / 0.5909, 0.0, 1.0);",
  "  float gLine  = ss(0.000, 0.154, sp);",
  "  float gOpen  = ss(0.077, 0.519, sp);",
  /* the blow-out, 250ms wide: narrow on purpose, it is the one moment of impact */
  "  float gFlash = exp(-pow((sp - 0.904) / 0.058, 2.0));",
  "  float gClear = ss(0.923, 1.000, sp);",
  "",
  /* Asymmetric aperture, from 0:37.75: a hard core on the lower edge, a soft
     bloom spreading up, and a shorter reflection below it. A symmetric
     exponential cannot produce any of those three. */
  "  float hy = uv.y + 0.02;",
  "  float halfW = mix(0.0055, 0.235, gOpen * gOpen);",
  /* an unstable edge, not a UI rule: the line breathes about a pixel */
  "  halfW *= 1.0 + 0.10 * sin(uT * 5.7) * (1.0 - gOpen);",
  "  float sCore  = 1.0 - ss(halfW * 0.5, halfW, abs(hy));",
  "  float sAbove = exp(-max(hy, 0.0) / (halfW * 2.1));",
  "  float sBelow = exp(-max(-hy, 0.0) / (halfW * 0.65)) * 0.5;",
  /* a bright node running the length of the line while it is still a line */
  "  float nx = fract(uT * 0.21) * 2.6 - 1.3;",
  "  float node = exp(-pow((uv.x - nx) / 0.075, 2.0)) * (1.0 - gOpen);",
  "  float seam = clamp(sCore * (1.0 + node * 1.7) + sAbove * 0.7 + sBelow, 0.0, 1.8);",
  "",
  /* The wall is seen through the aperture and nowhere else until gClear opens
     the frame. That gate is the difference between a reveal and a crossfade. */
  "  float winOpen = clamp(sCore + sAbove * 0.85, 0.0, 1.0);",
  "  winOpen = mix(winOpen, 1.0, gClear);",
  "",
  /* deep red while it is a line, magenta once it is a band */
  "  vec3 seamCol = mix(vec3(1.00, 0.09, 0.20), vec3(1.00, 0.34, 0.62), gOpen);",
  /* (1.0 - gClear) takes it to exactly zero. The old term stopped at 0.25, which
     left a permanent wash in every gap between the threads. */
  "  netCol += seamCol * seam * gLine * (1.0 - gClear) * 0.95;",
  /* the flash is not masked by the aperture -- filling the frame is the point */
  "  netCol += vec3(1.00, 0.40, 0.68) * gFlash * 0.85;",
  /* the halo is part of the aperture above, not a separate term */
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
  /* Depth along the view axis, not along world Z. They are the same thing
     looking straight ahead and diverge as soon as the view turns; using dw
     while turned would draw the wall with no perspective compression. */
  "    float zeye = max(tc * dot(rd, fwd), 0.001);",
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
  "    float pitch0 = (LINE_SP / (fov * zeye)) * H2;",
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
  /* 11.0, not 2.2: a thread is 0.090 * pitch wide, so it is sub-pixel from a
     pitch of 11 down. Below that, fade to the mean rather than point-sample. */
  "      float aal = clamp(pitch / 11.0, 0.0, 1.0);",
  "      float meanl = 0.090 * 1.7724539 * (1.0 + (0.07 + fk * 0.055) * sqrt(9.0 + fk * 16.0));",
  "      line += (meanl + ((c0 + h0) - meanl) * aal) * wgt;",
  "      core += c0 * wgt;",
  "      rsum += rr * wgt;",
  "      wsum += wgt;",
  "    }",
  "    float r  = rsum / wsum;",
  "    float aa = clamp(pitch0 / 11.0, 0.0, 1.0);",
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
  "    float fade = (base + (1.0 - base) * uCross * 0.85) * exp(-zeye * 0.020);",
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
  /* tied to gOpen, so the threads arrive with the aperture that shows them */
  "  float wallIn = clamp(gOpen * 1.35, 0.0, 1.0);",
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
].join("\n");
