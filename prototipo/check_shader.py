# -*- coding: utf-8 -*-
"""Reconstruct the GLSL from the JS string array and run static checks.
A shader that fails to compile renders a black screen with no other symptom,
so it is worth validating what we can before publishing."""
import io, os, re, sys

# Default to the shader that actually ships. Pass a path to check the prototype:
#   python check_shader.py bw.tpl.html
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'lib', 'shader.ts')
t = io.open(SRC, encoding='utf-8').read()
print('checking %s' % os.path.relpath(SRC, HERE))

def grab(varname):
    # `var FRAG = [` in the prototype, `export const FRAG = [` in lib/shader.ts
    for decl in ('var ' + varname + ' = [', 'const ' + varname + ' = ['):
        if decl in t:
            start = t.index(decl)
            break
    else:
        raise SystemExit('FAIL  %s not found in %s' % (varname, SRC))
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

# Every uniform declared must be fetched and written, and vice versa. In the
# ported layout that JS lives in lib/engine.ts, not beside the GLSL, so read it
# separately -- searching `t` would pass vacuously against text that no longer
# holds the calls, which is exactly the silence this validator exists to break.
ENGINE = os.path.join(os.path.dirname(os.path.abspath(SRC)), 'engine.ts')
js = t if 'uni[n]' in t else (
    io.open(ENGINE, encoding='utf-8').read() if os.path.exists(ENGINE) else '')
chk('found the uniform-binding JS', 'uni[n]' in js,
    'looked in %s' % os.path.basename(ENGINE))

decl = set(re.findall(r'uniform\s+\w+\s+(\w+)\s*;', frag))
js_list = re.search(r'\[([^\]]*)\]\.forEach\(function\(n\)\{ uni\[n\]', js)
js_names = set(re.findall(r'"(\w+)"', js_list.group(1))) if js_list else set()
chk('uniforms declared == fetched', decl == js_names,
    'glsl=%s js=%s' % (sorted(decl), sorted(js_names)))

# each declared uniform should actually be set each frame
for u in sorted(decl):
    chk('uniform %s is set' % u, ('uni.' + u) in js)

# reserved-word landmines in GLSL ES 1.00
for word in ['mat', 'vec', 'sampler', 'input', 'output', 'sample']:
    bad = re.search(r'\b(?:float|int|vec[234])\s+' + word + r'\b', frag)
    chk('no identifier named "%s"' % word, bad is None)

# GLSL ES 1.00 has no implicit int->float; catch the classic slips
for pat, label in [(r'\bfloat\s+\w+\s*=\s*-?\d+\s*;', 'float assigned a bare int'),
                   (r'\bpow\(\s*[^,]+,\s*-?\d+\s*\)', 'pow() with an int exponent')]:
    m = re.search(pat, frag)
    chk('no ' + label, m is None, m.group(0) if m else '')


# Redeclaring a local in the same scope is a compile error, and a shader that
# fails to compile renders black with no other symptom. Track declarations per
# brace depth inside main().
_body = frag[frag.index('void main()'):]
_depth, _seen, _dupes = 0, {}, []
for _line in _body.split('\n'):
    _m = re.match(r'\s*(?:float|int|vec[234]|mat[234]|bool)\s+(\w+)\s*[=;]', _line)
    if _m:
        _b = _seen.setdefault(_depth, set())
        if _m.group(1) in _b:
            _dupes.append('%s (depth %d)' % (_m.group(1), _depth))
        _b.add(_m.group(1))
    for _ch in _line:
        if _ch == '{':
            _depth += 1
        elif _ch == '}':
            _seen.pop(_depth, None)
            _depth -= 1
chk('no redeclared locals', not _dupes, ', '.join(_dupes))

print('\n' + ('ALL STATIC CHECKS PASSED' if ok else 'SOMETHING FAILED — fix before publishing'))
sys.exit(0 if ok else 1)
