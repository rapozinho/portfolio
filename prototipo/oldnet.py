# -*- coding: utf-8 -*-
"""CPU preview of the Old Net flythrough (video ~0:37).

A lattice of emissive cyan blocks the camera flies through, with a horizontal
magenta beam cutting the middle. This sits in FRONT of the Blackwall in world
space, so the entry animation is one continuous move: fly +Z through the blocks
and arrive at the wall. Preview here, then port to GLSL.
"""
import numpy as np
from PIL import Image
import os

Q = dict(
    CELL      = 7.0,      # lattice pitch
    FILL      = 0.30,     # fraction of cells that hold a block
    BOX_MIN   = 0.35,
    BOX_VAR   = 1.05,
    STEPS     = 46,
    Z_START   = -150.0,   # deep inside the net
    Z_END     = -34.0,    # clear of it, wall ahead
    FOV       = 1.40,
    PITCH     = 0.12,
    CYAN      = (0.10, 0.78, 0.92),
    EDGE      = (0.55, 0.97, 1.00),
    BEAM      = (1.00, 0.16, 0.42),
    FOG       = 0.017,
)

def fract(x): return x - np.floor(x)

def h31(x, y, z):
    n = np.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
    return fract(n)

def sdbox(px, py, pz, bx, by, bz):
    qx, qy, qz = np.abs(px) - bx, np.abs(py) - by, np.abs(pz) - bz
    ox = np.maximum(qx, 0); oy = np.maximum(qy, 0); oz = np.maximum(qz, 0)
    outside = np.sqrt(ox * ox + oy * oy + oz * oz)
    inside = np.minimum(np.maximum(qx, np.maximum(qy, qz)), 0.0)
    return outside + inside

def netmap(px, py, pz):
    """Distance to the block lattice, plus the cell's random seed."""
    c = Q['CELL']
    idx, idy, idz = np.floor(px / c), np.floor(py / c), np.floor(pz / c)
    r = h31(idx, idy, idz)
    qx = px - (idx + 0.5) * c
    qy = py - (idy + 0.5) * c
    qz = pz - (idz + 0.5) * c
    # empty cells get pushed far away so the ray passes through
    empty = r > Q['FILL']
    bx = Q['BOX_MIN'] + r * Q['BOX_VAR']
    by = Q['BOX_MIN'] + fract(r * 7.3) * Q['BOX_VAR'] * 1.6
    bz = Q['BOX_MIN'] + fract(r * 3.1) * Q['BOX_VAR']
    d = sdbox(qx, qy, qz, bx, by, bz)
    d = np.where(empty, d + c, d)
    return d, r

def render(entry, W=680, H=383, T=3.0):
    q = Q
    yy, xx = np.mgrid[0:H, 0:W]
    u = (xx + 0.5 - 0.5 * W) / H
    v = ((H - 1 - yy) + 0.5 - 0.5 * H) / H

    cz = q['Z_START'] + (q['Z_END'] - q['Z_START']) * entry
    rox, roy, roz = 0.0, 0.6, cz
    dx, dy, dz = u * q['FOV'], v * q['FOV'] + q['PITCH'], np.ones_like(u)
    L = np.sqrt(dx * dx + dy * dy + dz * dz)
    rdx, rdy, rdz = dx / L, dy / L, dz / L

    t = np.zeros((H, W))
    hit = np.zeros((H, W), bool)
    seed = np.zeros((H, W))
    for _ in range(q['STEPS']):
        px, py, pz = rox + rdx * t, roy + rdy * t, roz + rdz * t
        d, r = netmap(px, py, pz)
        newly = (~hit) & (d < 0.02 + t * 0.002)
        seed = np.where(newly, r, seed)
        hit |= newly
        t = np.where(hit, t, t + np.maximum(d * 0.85, 0.02))
        if hit.all():
            break

    col = np.zeros((H, W, 3))
    px, py, pz = rox + rdx * t, roy + rdy * t, roz + rdz * t

    # block faces: dark body, bright edges. Edge proximity from the cell frame.
    c = q['CELL']
    qx = px - (np.floor(px / c) + 0.5) * c
    qy = py - (np.floor(py / c) + 0.5) * c
    qz = pz - (np.floor(pz / c) + 0.5) * c
    bx = q['BOX_MIN'] + seed * q['BOX_VAR']
    by = q['BOX_MIN'] + fract(seed * 7.3) * q['BOX_VAR'] * 1.6
    bz = q['BOX_MIN'] + fract(seed * 3.1) * q['BOX_VAR']
    # slack on each axis: 0 exactly on that face. Two small slacks = an edge.
    ax = bx - np.abs(qx); ay = by - np.abs(qy); az = bz - np.abs(qz)
    sl = np.sort(np.stack([ax, ay, az]), axis=0)
    edge = np.exp(-np.maximum(sl[1], 0) * 5.5)     # second-smallest slack
    # which face is this? the axis with the smallest slack. Give each its own
    # brightness so a box reads as a solid rather than a wire outline.
    amin = np.minimum(ax, np.minimum(ay, az))
    faceX = (np.abs(ax - amin) < 1e-6)
    faceY = (np.abs(ay - amin) < 1e-6)
    face = np.where(faceX, 1.00, np.where(faceY, 0.55, 0.78))
    body = 0.10 + 0.26 * seed
    lit = 0.5 + 0.5 * np.sin(T * 1.3 + seed * 40.0)
    fog = np.exp(-t * q['FOG'])
    for i in range(3):
        base = q['CYAN'][i] * body * face * lit + q['EDGE'][i] * edge * (0.55 + 0.55 * lit)
        col[..., i] = np.where(hit, base * fog, 0.0)

    # the horizontal beam: a slab of magenta light through the middle
    beam = np.exp(-np.abs(v + 0.02) * 34.0)
    for i in range(3):
        col[..., i] += q['BEAM'][i] * beam * 0.9

    # a hint of the wall ahead, growing as we clear the net
    wallGlow = np.exp(-(u * u) * 1.1) * np.exp(-np.abs(v + 0.02) * 2.2)
    for i in range(3):
        col[..., i] += q['BEAM'][i] * wallGlow * (0.04 + entry * 0.55)

    d2 = u * u + v * v
    col *= (1 - d2 * 0.55)[..., None]
    col += (np.random.default_rng(7).random((H, W, 1)) - 0.5) * 0.02
    return np.clip(col, 0, 1)

if __name__ == "__main__":
    os.makedirs("frames", exist_ok=True)
    for name, e in [("net0", 0.0), ("net1", 0.45), ("net2", 0.85), ("net3", 1.0)]:
        img = render(e)
        Image.fromarray((img * 255).astype(np.uint8)).save("frames/%s.png" % name)
        print("%-5s entry=%.2f  mean=%.4f  lit%%=%.1f" % (name, e, img.mean(), 100 * (img.max(axis=2) > 0.08).mean()))
