# -*- coding: utf-8 -*-
"""CPU mirror of the Blackwall fragment shader.

Purpose: see the output. The GLSL runs in the browser where I cannot look at it,
so this reimplements the same maths in numpy, renders stills at several points
along the approach, and writes PNGs I can compare against the reference frames.
Tune here, then port the constants back into the GLSL.

Every knob lives in P so the two stay in sync deliberately rather than by luck.
"""
import numpy as np
from PIL import Image
import sys, os

P = dict(
    FLOOR_Y   = -2.6,
    LINE_SP   = 0.54,     # wide enough to resolve at distance; AA handles the rest
    N_CURTAIN = 5,
    FIG_PRES  = 1.45,
    FIG_SCALE = 1.95,
    FIG_LIFT  = 0.48,   # plant the feet on the floor
    Z0        = -1.2,
    DZ        = 1.20,
    FIG_Z     = 4.8,
    CAM_FAR   = -30.0,
    CAM_NEAR  = -3.2,
    FOV       = 1.40,
    PITCH     = 0.12,      # look up: horizon drops, wall dominates
    CORE_W    = 0.090,
    CORE_VAR  = 0.000,
    HALO_MUL  = 9.0,
    HALO_AMP  = 0.07,
    # sway: the threads bow, they do not serpentine. Low frequency only.
    SWAY1_A   = 0.020, SWAY1_F = 0.030,
    SWAY2_A   = 0.010, SWAY2_F = 0.075,
    # colour is spatial: cold core, hot edges
    COLD_FRAC = 0.74,      # threads above this hash are cold; most are hot
    NEAR_BLUE = 0.00,   # the blue is the wave, nothing else      # blue bloom at the point you are closing on
    HOT       = (1.00, 0.06, 0.36),
    COLD      = (0.14, 0.52, 1.00),
    PALE      = (0.80, 0.92, 1.00),
    SAT       = 1.35,
    BR_BASE   = 0.80, BR_VAR = 0.30, BR_GAMMA = 1.00, SPIKE_T = 0.76, SPIKE_A = 2.8,
    # dashes only resolve close up; far away they are sub-pixel noise
    DASH_BASE = 0.72, DASH_AMP = 0.28, DASH_F = 0.85,
    TOP_FADE  = (70.0, 14.0),
    DOT_SZ    = 0.44, DOT_W = 0.17, DOT_H = 0.15,
    DOT_LIT   = 0.12,
    DOT_GAIN  = 3.4,
    DOT_FALL  = 0.011, DOT_NEARWALL = 0.030, DOT_REACH = 26.0,
    VOID_FAR  = 2.2, VOID_NEAR = 0.26, VOID_FLOOR = 0.05,
)

def fract(x): return x - np.floor(x)

def h11(x):
    return fract(np.sin(x * 127.13) * 43758.5453)

def h21(x, y):
    px = fract(x * 127.31); py = fract(y * 311.7)
    d = px * (px + 34.42) + py * (py + 34.42)
    px = fract(px + d); py = fract(py + d)
    return fract(px * py)

def vn(x, y):
    ix, iy = np.floor(x), np.floor(y)
    fx, fy = x - ix, y - iy
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy)
    a = h21(ix, iy); b = h21(ix + 1, iy)
    c = h21(ix, iy + 1); d = h21(ix + 1, iy + 1)
    return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy

def ridged(x, y, oct=2):
    s = np.zeros_like(x); a = 0.6; f = 1.0
    for _ in range(oct):
        n = vn(x * f, y * f)
        n = 1.0 - np.abs(n * 2 - 1)
        s += n * n * a
        a *= 0.5; f *= 2.2
    return s

def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def sdseg(px, py, ax, ay, bx, by, r):
    pax, pay = px - ax, py - ay
    bax, bay = bx - ax, by - ay
    h = np.clip((pax * bax + pay * bay) / (bax * bax + bay * bay), 0, 1)
    return np.sqrt((pax - bax * h) ** 2 + (pay - bay * h) ** 2) - r

def figure_sdf(x, y):
    d = sdseg(x, y, 0.0, -0.86, 0.0, 0.30, 0.265)
    d = np.minimum(d, np.sqrt(x ** 2 + (y - 0.605) ** 2) - 0.175)
    d = np.minimum(d, sdseg(x, y, -0.235, 0.22, -0.40, -0.34, 0.082))
    d = np.minimum(d, sdseg(x, y,  0.235, 0.22,  0.40, -0.30, 0.082))
    d = np.minimum(d, sdseg(x, y, -0.115, -0.86, -0.15, -1.62, 0.102))
    d = np.minimum(d, sdseg(x, y,  0.115, -0.86,  0.15, -1.62, 0.102))
    return d

def render(appr, cross=0.0, W=680, H=383, T=3.0):
    p = P
    yy, xx = np.mgrid[0:H, 0:W]
    fragx = xx + 0.5
    fragy = (H - 1 - yy) + 0.5           # GL counts y up from the bottom
    u = (fragx - 0.5 * W) / H
    v = (fragy - 0.5 * H) / H

    cz = p['CAM_FAR'] + (p['CAM_NEAR'] - p['CAM_FAR']) * appr + cross * cross * 22.0
    fov = p['FOV'] - cross * 0.24
    rox, roy, roz = 0.0, 0.5, cz

    dx, dy, dz = u * fov, v * fov + p['PITCH'], np.ones_like(u)
    L = np.sqrt(dx * dx + dy * dy + dz * dz)
    rdx, rdy, rdz = dx / L, dy / L, dz / L

    col = np.zeros((H, W, 3))
    trans = np.ones((H, W))

    # ── floor of dots ────────────────────────────────────────────────
    floorCol = np.zeros((H, W, 3))
    down = rdy < -5e-4
    tg = np.where(down, (p['FLOOR_Y'] - roy) / np.where(down, rdy, -1), -1)
    ok = down & (tg > 0) & (tg < 200)
    if ok.any():
        gx = rox + rdx * tg
        gz = roz + rdz * tg
        # The dots share the thread grid in X, which is what makes them read as
        # radial rows running out from the foot of each thread.
        cx, cz_ = gx / p['LINE_SP'], gz / p['DOT_SZ']
        cidx, cidz = np.floor(cx), np.floor(cz_)
        r = h21(cidx, cidz)
        fx, fz = cx - cidx - 0.5, cz_ - cidz - 0.5
        # square dots, not gaussian smudges
        halfw = p['DOT_W'] / p['LINE_SP'] * 0.5
        halfh = p['DOT_H'] / p['DOT_SZ'] * 0.5
        sx = np.clip((halfw - np.abs(fx)) / max(halfw * 0.55, 1e-4), 0, 1)
        sz = np.clip((halfh - np.abs(fz)) / max(halfh * 0.55, 1e-4), 0, 1)
        d0 = sx * sz * (r > p['DOT_LIT'])
        d0 *= 0.5 + 0.5 * np.sin(T * 1.7 + r * 52.0 - gz * 0.4)
        pxDot = (p['LINE_SP'] / (fov * np.maximum(tg, 1e-3))) * (H * 0.5)
        aaD = np.clip(pxDot / 2.0, 0.0, 1.0)
        d0 = 0.14 * (1 - aaD) + d0 * aaD
        # Dots gather at the foot of the wall. The old exp(-tg) did the reverse:
        # brightest under the camera, dimmest where the wall stands.
        # Hard-limited to a region around the wall: between the blocks and the
        # wall the floor is bare, which is what the video shows.
        region = smoothstep(-p['DOT_REACH'] - 14.0, -p['DOT_REACH'] + 6.0, gz)
        atten = region * np.exp(-np.abs(gz) * p['DOT_NEARWALL'])
        atten *= np.exp(-np.clip(tg, 0, 200) * p['DOT_FALL'])
        for i, ch in enumerate(p['HOT']):
            floorCol[..., i] = np.where(ok, ch * d0 * p['DOT_GAIN'] * atten, 0)

    # ── the figure, behind every curtain ────────────────────────────
    figCol = np.zeros((H, W, 3))
    tf = (p['FIG_Z'] - roz) / rdz
    okf = tf > 0
    fqx = rox + rdx * np.where(okf, tf, 0)
    fqy = roy + rdy * np.where(okf, tf, 0)
    fd = figure_sdf(fqx / p['FIG_SCALE'], (fqy - p['FIG_LIFT']) / p['FIG_SCALE']) * p['FIG_SCALE']
    inFig = 1.0 - smoothstep(-0.02, 0.03, fd)
    rimFig = np.exp(-np.abs(fd) * 22.0)
    fil = ridged(fqx * 2.6, fqy * 2.6 + T * 0.2)
    pres = 0.18 + appr * p['FIG_PRES']
    dataC = [0.20 + (0.88 - 0.20) * fil * 0.7,
             0.66 + (0.96 - 0.66) * fil * 0.7,
             0.88 + (1.00 - 0.88) * fil * 0.7]
    for i in range(3):
        figCol[..., i] = np.where(okf, dataC[i] * (inFig * (0.26 + fil * 0.7) + rimFig * 0.45) * pres, 0)

    # ── curtains, front to back ──────────────────────────────────────
    curtCol = np.zeros((H, W, 3))
    for k in range(p['N_CURTAIN']):
        zc = p['Z0'] + k * p['DZ']
        tc = (zc - roz) / rdz
        live = tc > 0
        if not live.any():
            continue
        px = rox + rdx * tc
        py = roy + rdy * tc

        # Straight, unswayed, evenly spaced. The floor rows share this exact
        # grid, so any horizontal offset here would slide them out of line.
        x = px.copy()
        bow = np.exp(-px * px * 0.010) * (appr * 0.12 + cross * 3.0)
        x += np.sign(px) * bow

        sp0 = p['LINE_SP']
        pitch0 = (sp0 / (fov * np.maximum(tc, 1e-3))) * (H * 0.5)

        # Continuous LOD instead of fixed subdivision levels. Fixed levels miss
        # at both ends: at distance they subdivide down to ~2px (sub-pixel), and
        # up close they only reach ~21px (fat bars). Pick the level that lands
        # near TARGET_PX and blend with its neighbour, so apparent density is
        # constant at every distance — which is how the wall reads in the video.
        TARGET = 7.0
        lod = np.maximum(np.log2(np.maximum(pitch0 / TARGET, 1.0)), 0.0)
        lo = np.floor(lod)
        frac = lod - lo

        line = np.zeros_like(px); core = np.zeros_like(px)
        rsum = np.zeros_like(px); wsum = np.zeros_like(px) + 1e-6
        for which in (0, 1):
            lv = lo + which
            wgt = (1.0 - frac) if which == 0 else frac
            sp = sp0 / (2.0 ** lv)
            pitch = pitch0 / (2.0 ** lv)
            idl = np.floor(x / sp)
            r_ = h11(idl * 1.31 + k * 71.0 + lv * 211.0)
            w = sp * p['CORE_W']
            fxl = (x / sp - idl - 0.5) * sp
            c_ = np.exp(-(fxl * fxl) / (w * w))
            h_ = np.exp(-(fxl * fxl) / (w * w * p['HALO_MUL'])) * p['HALO_AMP']
            aa_l = np.clip(pitch / 2.2, 0.0, 1.0)
            meanl = p['CORE_W'] * 1.7724539 * (1.0 + p['HALO_AMP'] * np.sqrt(p['HALO_MUL']))
            line += (meanl + ((c_ + h_) - meanl) * aa_l) * wgt
            core += c_ * wgt
            rsum += r_ * wgt
            wsum += wgt

        r = rsum / wsum
        aa = np.clip(pitch0 / 2.2, 0.0, 1.0)
        dash = p['DASH_BASE'] + p['DASH_AMP'] * aa * np.sin(py * p['DASH_F'] - T * 2.1 + r * 40.0)
        r2 = h11(idl * 3.77 + k * 13.0)
        # The threads are all red. The blue is a WAVE sweeping across the wall:
        # explicit travelling bands, because noise thresholds fired too rarely
        # to read as motion (measured 1% cool pixels).
        b1 = 0.5 + 0.5 * np.sin(px * 0.095 - T * 0.30 + k * 2.1)
        b2 = 0.5 + 0.5 * np.sin(px * 0.038 + T * 0.12 + k * 1.3)
        wave = np.maximum(smoothstep(0.74, 0.96, b1),
                          smoothstep(0.80, 0.98, b2) * 0.9)
        # a little noise so the bands are not mechanically even
        wave *= 0.75 + 0.5 * vn(px * 0.09, np.full_like(px, k * 5.0) + T * 0.05)
        wave = np.clip(wave, 0, 1)
        # the region being closed on also cools, but gently
        nearBlue = np.exp(-(u * u) / 0.10) * (appr * P['NEAR_BLUE'] + cross * 0.9)
        br = p['BR_BASE'] + (r ** p['BR_GAMMA']) * p['BR_VAR']
        br += (r2 > p['SPIKE_T']) * p['SPIKE_A'] * r2      # the occasional blazing thread
        br *= 0.72 + 0.28 * np.sin(T * 0.66 + r * 37.0)
        br *= 1.0 + wave * 0.40   # a wave lights its thread, without out-shining the wall
        br *= smoothstep(p['TOP_FADE'][0], p['TOP_FADE'][1], py)
        br *= smoothstep(p['FLOOR_Y'] - 0.2, p['FLOOR_Y'] + 1.4, py)

        base = 0.42 ** k
        fade = (base + (1.0 - base) * cross * 0.85) * np.exp(-np.clip(tc, 0, 400) * 0.020)
        a = line * br * fade
        occ = core * br * fade

        cold = np.clip(wave * 0.60 + nearBlue * 0.5, 0, 1)
        c = np.empty((H, W, 3))
        for i in range(3):
            hot, cd, pale = p['HOT'][i], p['COLD'][i], p['PALE'][i]
            base = hot + (cd - hot) * cold
            c[..., i] = base + (pale - base) * (cold * cold * r * 0.7)
            c[..., i] *= a * dash

        m = live.astype(float)
        curtCol += c * (trans * m)[..., None]
        trans *= 1.0 - np.minimum(occ * 0.62 * m, 0.95)

    col = floorCol + figCol * trans[..., None] + curtCol

    # ── void falloff ─────────────────────────────────────────────────
    d2 = u * u + v * v
    vf = np.exp(-d2 * (p['VOID_FAR'] + (p['VOID_NEAR'] - p['VOID_FAR']) * appr))
    col *= (vf + (1 - vf) * p['VOID_FLOOR'])[..., None]
    col *= (1 - d2 * 1.10)[..., None]

    # saturation lift: push colour away from its own luminance
    luma = (col * np.array([0.2126, 0.7152, 0.0722])).sum(axis=2, keepdims=True)
    col = luma + (col - luma) * P['SAT']

    return np.clip(col, 0, 1)

def save(arr, path):
    Image.fromarray((arr ** (1 / 1.0) * 255).astype(np.uint8)).save(path)

if __name__ == "__main__":
    tag = sys.argv[1] if len(sys.argv) > 1 else "a"
    os.makedirs("frames", exist_ok=True)
    shots = [("far", 0.00, 0.0), ("mid", 0.40, 0.0), ("near", 0.85, 0.0), ("thru", 1.00, 0.45)]
    for name, ap, cr in shots:
        img = render(ap, cr)
        out = "frames/%s_%s.png" % (tag, name)
        save(img, out)
        print("%-5s appr=%.2f cross=%.2f  mean=%.4f  max=%.3f  lit%%=%.1f  ->  %s"
              % (name, ap, cr, img.mean(), img.max(), 100.0 * (img.max(axis=2) > 0.08).mean(), out))
