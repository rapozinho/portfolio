# -*- coding: utf-8 -*-
"""Reconstruct the GLSL from the JS string array and run static checks.
A shader that fails to compile renders a black screen with no other symptom,
so it is worth validating what we can before publishing."""
import io, re, sys

t = io.open('bw.tpl.html', encoding='utf-8').read()

def grab(varname):
    start = t.index('var ' + varname + ' = [')
    end = t.index('].join', start)
    blk = t[start:end]
    # every JS string literal on its own line
    lits = re.findall(r'"((?:[^"\\]|\\.)*)"', blk)
    return '\n'.join(x.replace('\\n', '') for x in lits)

frag = grab('FRAG')
vert = grab('VERT')

print('=' * 70)
print(frag)
print('=' * 70)

ok = True
def chk(label, cond, extra=''):
    global ok
    if not cond:
        ok = False
    print(('  OK   ' if cond else '  FAIL ') + label + ('  ' + extra if extra else ''))

print('\n--- static checks ---')
chk('braces balanced', frag.count('{') == frag.count('}'),
    '{%d }%d' % (frag.count('{'), frag.count('}')))
chk('parens balanced', frag.count('(') == frag.count(')'),
    '(%d )%d' % (frag.count('('), frag.count(')')))
chk('has void main()', 'void main()' in frag)
chk('writes gl_FragColor', frag.count('gl_FragColor') >= 1, '%d write(s) - one per return path' % frag.count('gl_FragColor'))
chk('precision declared', 'precision' in frag)
chk('precision guarded', '#ifdef GL_FRAGMENT_PRECISION_HIGH' in frag)
chk('vertex shader ok', 'gl_Position' in vert)

# every uniform declared must be fetched in JS, and vice versa
decl = set(re.findall(r'uniform\s+\w+\s+(\w+)\s*;', frag))
fetched = set(re.findall(r'"(u[A-Z]\w*)"', t[t.index('].join', t.index('var FRAG')):]))
fetched = {n for n in fetched if n in decl or n.startswith('u')}
js_list = re.search(r'\[([^\]]*)\]\.forEach\(function\(n\)\{ uni\[n\]', t)
js_names = set(re.findall(r'"(\w+)"', js_list.group(1))) if js_list else set()
chk('uniforms declared == fetched', decl == js_names,
    'glsl=%s js=%s' % (sorted(decl), sorted(js_names)))

# each declared uniform should actually be set each frame
for u in sorted(decl):
    chk('uniform %s is set' % u, ('uni.' + u) in t)

# reserved-word landmines in GLSL ES 1.00
for word in ['mat', 'vec', 'sampler', 'input', 'output', 'sample']:
    bad = re.search(r'\b(?:float|int|vec[234])\s+' + word + r'\b', frag)
    chk('no identifier named "%s"' % word, bad is None)

# GLSL ES 1.00 has no implicit int->float; catch the classic slips
for pat, label in [(r'\bfloat\s+\w+\s*=\s*-?\d+\s*;', 'float assigned a bare int'),
                   (r'\bpow\(\s*[^,]+,\s*-?\d+\s*\)', 'pow() with an int exponent')]:
    m = re.search(pat, frag)
    chk('no ' + label, m is None, m.group(0) if m else '')

print('\n' + ('ALL STATIC CHECKS PASSED' if ok else 'SOMETHING FAILED — fix before publishing'))
sys.exit(0 if ok else 1)
